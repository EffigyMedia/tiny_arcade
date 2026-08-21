/* =====================================================================
   TINY ARCADE — sw.js

   Two jobs, and they pull in opposite directions:

     · never serve a stale file when the network is there
     · always serve something when it is not

   So pages and scripts are network-first with a short timeout and a cache
   fallback, while art and fonts are served from cache immediately and
   refreshed in the background. There is no version number to maintain —
   freshness comes from asking the network first, not from a cache name.

   Games are cached the first time you open them, so a machine you have
   never played is the one thing that will not work on a plane.

   © 2026 Effigy Media. All rights reserved.
   ===================================================================== */
/* BUMP THESE WHENEVER A FILE MOVES OR IS RENAMED. A device that already has
   the old catalogue cached will keep serving it, and every path in it now
   points at a file that no longer exists — which is a site of 404s that looks
   like a broken deploy rather than a stale cache. Changing the names makes
   every client throw its cache away on the next visit. */
const CORE    = 'tiny-arcade-core-v15';
const RUNTIME = 'tiny-arcade-runtime-v15';
const KEEP    = [CORE, RUNTIME];

/* the least we need to open the arcade with no signal at all */
const CORE_FILES = [
  './',
  './index.html',
  './audio.js',
  './arcade.js',
  './games.js',
  './manifest.webmanifest',
  './icon.png',
  './icon-512.png',
  './effigy.png'
];

const NET_TIMEOUT = 7000;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE);
    /* one at a time: a single 404 must not sink the whole install */
    await Promise.all(CORE_FILES.map(f =>
      cache.add(new Request(f, { cache: 'reload' })).catch(() => {})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(n => KEEP.includes(n) ? null : caches.delete(n)));
    await self.clients.claim();
  })());
});

/* The browser keeps its own HTTP cache in front of us, and it will happily
   hand this worker a stale script it decided was still fresh. Ask for a
   reload so the network is really the network — the Cache API below is then
   the only cache in play, which is the whole point of running a worker. */
function freshRequest(request){
  if (request.mode === 'navigate') return request;   // cannot be re-wrapped
  try {
    return new Request(request.url, {
      cache: 'reload',
      mode: request.url.indexOf(self.location.origin) === 0 ? 'same-origin' : 'cors',
      credentials: 'same-origin',
      redirect: 'follow'
    });
  } catch (e) { return request; }
}

function timedFetch(request, ms){
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(freshRequest(request))
      .then(res => { clearTimeout(timer); resolve(res); })
      .catch(err => { clearTimeout(timer); reject(err); });
  });
}

/* pages and code: the network is the source of truth, cache is the parachute */
async function networkFirst(request){
  const cache = await caches.open(RUNTIME);
  try {
    const fresh = await timedFetch(request, NET_TIMEOUT);
    if (fresh && fresh.ok) cache.put(request, fresh.clone()).catch(() => {});
    return fresh;
  } catch (err) {
    const hit = (await cache.match(request)) || (await caches.match(request));
    if (hit) return hit;
    if (request.mode === 'navigate'){
      const shell = await caches.match('./index.html');
      if (shell) return shell;
    }
    throw err;
  }
}

/* art and fonts: instant from cache, quietly refreshed for next time */
async function staleWhileRevalidate(request){
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(request);
  const spin = fetch(request)
    .then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone()).catch(() => {}); return res; })
    .catch(() => null);
  return hit || spin.then(r => r || caches.match(request)) || Response.error();
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  const sameOrigin = url.origin === self.location.origin;
  const isCode = /\.(?:html|js|webmanifest|json)$/i.test(url.pathname) || req.mode === 'navigate';

  if (sameOrigin && isCode) event.respondWith(networkFirst(req));
  else event.respondWith(staleWhileRevalidate(req));
});

/* The launcher can ask for the whole catalogue up front, so a machine you
   have never opened still works with no signal. Progress is reported back so
   the settings sheet can show it. */
async function fetchAll(urls, client){
  const cache = await caches.open(RUNTIME);
  let done = 0, failed = 0;
  for (const url of urls){
    try {
      const res = await fetch(new Request(url, { cache: 'reload' }));
      if (res && res.ok) await cache.put(url, res.clone());
      else failed++;
    } catch (e) { failed++; }
    done++;
    if (client) client.postMessage({ type:'prefetch', done, total:urls.length, failed });
  }
  if (client) client.postMessage({ type:'prefetch-done', done, total:urls.length, failed });
}

self.addEventListener('message', event => {
  const data = event.data;
  if (data === 'skipWaiting') return self.skipWaiting();
  if (data === 'purge'){
    event.waitUntil((async () => {
      for (const k of await caches.keys()) await caches.delete(k);
      if (event.source) event.source.postMessage({ type:'purged' });
    })());
    return;
  }
  if (data && data.type === 'prefetch' && Array.isArray(data.urls)){
    event.waitUntil(fetchAll(data.urls, event.source));
  }
});
