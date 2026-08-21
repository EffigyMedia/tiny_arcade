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
const CORE    = 'tiny-arcade-core-v17';
const RUNTIME = 'tiny-arcade-runtime-v17';
const KEEP    = [CORE, RUNTIME];

/* The shell. Enough to open the arcade with no signal at all. */
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

/* ---------------------------------------------------------------------------
   EVERYTHING ELSE — every cabinet and every font, written here by pack.sh.
   This used to be lazy: a game was cached the first time you opened it, so a
   machine you had never played was a 404 offline, and a partially-warmed cache
   produced intermittent misses that looked like a broken deploy. The whole
   arcade is now pulled down on first visit.
   DO NOT EDIT BY HAND — pack.sh regenerates it from what is actually shipping,
   so it cannot drift out of step with the catalogue.
   --------------------------------------------------------------------------- */
const ALL_FILES = [
  "./games/golden/aegis.html",
  "./games/golden/blocks.html",
  "./games/golden/burrow.html",
  "./games/golden/coil.html",
  "./games/golden/feather.html",
  "./games/golden/girder.html",
  "./games/golden/penboy.html",
  "./games/golden/phalanx.html",
  "./games/golden/popshot.html",
  "./games/golden/ribbit.html",
  "./games/golden/ricochet.html",
  "./games/golden/swarm.html",
  "./games/golden/vector.html",
  "./games/golden/ziggurat.html",
  "./games/original/deep.html",
  "./games/original/derelict.html",
  "./games/original/highway0.html",
  "./games/second/highway.html",
  "./fonts/LICENSES.md",
  "./fonts/anton-400.woff2",
  "./fonts/archivo-var.woff2",
  "./fonts/bebasneue-400.woff2",
  "./fonts/bricolagegrotesque-var.woff2",
  "./fonts/bungee-400.woff2",
  "./fonts/chivomono-var.woff2",
  "./fonts/cutivemono-400.woff2",
  "./fonts/dmmono-400.woff2",
  "./fonts/dmmono-500.woff2",
  "./fonts/fredoka-var.woff2",
  "./fonts/ibmplexmono-400.woff2",
  "./fonts/ibmplexmono-500.woff2",
  "./fonts/ibmplexmono-600.woff2",
  "./fonts/majormonodisplay-400.woff2",
  "./fonts/michroma-400.woff2",
  "./fonts/orbitron-var.woff2",
  "./fonts/oxanium-var.woff2",
  "./fonts/pressstart2p-400.woff2",
  "./fonts/rajdhani-400.woff2",
  "./fonts/sairacondensed-600.woff2",
  "./fonts/sairacondensed-800.woff2",
  "./fonts/sharetechmono-400.woff2",
  "./fonts/silkscreen-400.woff2",
  "./fonts/spacegrotesk-var.woff2",
  "./fonts/spacemono-400.woff2",
  "./fonts/syne-var.woff2",
  "./fonts/vt323-400.woff2"
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

/* ---------------------------------------------------------------------------
   Filling the cache is driven by the PAGE, not by install.

   It used to run inside the install handler, which meant it ran exactly once —
   on a device that already had a worker registered no install ever fires, so
   nothing downloaded, no progress arrived, and the launcher sat at 0/0 until it
   timed out and then 404ed every game. Worse, the loop was started outside
   `waitUntil`, so even on a real install the browser was free to kill the
   worker halfway through.

   The page now asks on every load. The worker reports progress, skips what it
   already has, and answers 'precache-done' when the arcade is complete.
   --------------------------------------------------------------------------- */
let filling = null;
async function fillCache(){
  const cache = await caches.open(CORE);
  const all = CORE_FILES.concat(ALL_FILES);
  const total = all.length;
  let done = 0;
  const tell = async (type) => {
    const cs = await self.clients.matchAll({ includeUncontrolled: true });
    for(const c of cs) c.postMessage({ type, done, total });
  };
  for(const f of all){
    const req = new Request(f, { cache: 'reload' });
    /* skip what is already there so a warm start costs nothing */
    const have = await cache.match(f);
    if(!have){
      try { await cache.add(req); } catch(e){}
    }
    done++;
    if(done % 2 === 0 || done === total) await tell('precache');
  }
  await tell('precache-done');
  return total;
}

self.addEventListener('message', event => {
  if(!event.data || event.data.type !== 'precache') return;
  if(!filling) filling = fillCache().finally(() => { filling = null; });
  event.waitUntil(filling);
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
  /* Look this up BEFORE going to the network, so a bad answer has somewhere
     to fall back to. `caches.match` searches every cache, which matters
     because the precache writes to CORE and this function's own puts go to
     RUNTIME — a file could be perfectly cached and still be missed here. */
  const cached = (await cache.match(request)) || (await caches.match(request));
  try {
    const fresh = await timedFetch(request, NET_TIMEOUT);
    /* THE 404 BUG: a non-ok response was returned straight through. A flaky
       moment, a sleeping host, a redirect gone wrong — any of them produced a
       404 for a file sitting in the cache the whole time. A bad answer is now
       treated exactly like no answer. */
    if (fresh && fresh.ok){
      cache.put(request, fresh.clone()).catch(() => {});
      return fresh;
    }
    if (cached) return cached;
    return fresh;                       /* nothing cached: pass it on as-is */
  } catch (err) {
    if (cached) return cached;
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
