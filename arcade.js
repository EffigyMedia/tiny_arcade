/* =====================================================================
   TINY ARCADE — arcade.js
   Drop this one line into any game's <head> and it gains a title bar,
   a pause menu, and a way back to the launcher:

     <script src="../audio.js"></script>
     <script src="../arcade.js"></script>
     <meta name="arcade-title"  content="Sounding">
     <meta name="arcade-accent" content="#4de0c8">

   The contract a game has to honour is three CSS variables, all of
   which have standalone-friendly defaults so the game still runs fine
   when opened on its own:

     --stage-h    height available to the game        (default 100dvh)
     --safe-top   top safe-area inset to apply        (default env(...))
     #stage       an absolutely-positioned inset:0 root element

   Also provides, to games and to the launcher alike:

     Arcade.pad    Xbox / PlayStation / any standard gamepad
     Arcade.save   namespaced localStorage, one slot per game

   Pausing works by gating requestAnimationFrame, so nothing here needs
   to know anything about how a particular game is built.

   © 2026 Effigy Media. All rights reserved.
   ===================================================================== */
(function(){
"use strict";

var A = window.Arcade = window.Arcade || {};

/* ---- 0. offline. Registering here covers the launcher and every game,
   since arcade.js is the one file all of them load. ---- */
if ('serviceWorker' in navigator && location.protocol.slice(0,4) === 'http'){
  window.addEventListener('load', function(){
    /* this file runs from <head>, so the body does not exist yet — the
       launcher/game test has to wait until load or it always says launcher
       and registers games/sw.js, which does not exist. */
    var root = document.getElementById('stage') ? '../' : './';
    navigator.serviceWorker.register(root + 'sw.js').then(null, function(err){
      if (window.console && console.warn) console.warn('arcade: offline cache unavailable', err);
    });
  });
}

/* ---- 1. frame gate. Installed immediately, before the game boots ---- */
var paused = false, held = null;
var raf = window.requestAnimationFrame && window.requestAnimationFrame.bind(window);
if (raf) {
  window.requestAnimationFrame = function(cb){
    return raf(function(t){
      if (paused) held = cb;          // only ever one: a paused loop
      else cb(t);                     // cannot schedule its successor
    });
  };
}

/* ---- 2. saving ------------------------------------------------------
   One slot per game id. Anything JSON-serialisable. If a game writes a
   `label`, the launcher prints it on that machine's cabinet card.      */
var SKEY = 'tinyarcade.save.v1.';
A.save = {
  get: function(id){
    try { var r = localStorage.getItem(SKEY + id); return r ? JSON.parse(r) : null; }
    catch(e){ return null; }
  },
  set: function(id, obj){
    try { localStorage.setItem(SKEY + id, JSON.stringify(obj)); return true; }
    catch(e){ return false; }
  },
  merge: function(id, obj){
    var cur = A.save.get(id) || {};
    for (var k in obj) cur[k] = obj[k];
    return A.save.set(id, cur);
  },
  clear: function(id){ try { localStorage.removeItem(SKEY + id); } catch(e){} }
};

/* ---- 3. gamepad -----------------------------------------------------
   Standard mapping, so an Xbox pad and a DualSense land on the same
   names. Directions auto-repeat, which suits both menus and a grid
   crawler. Polled off the raw rAF so Start still works while paused.  */
var NAMES = ['a','b','x','y','lb','rb','lt','rt','back','start','l3','r3','up','down','left','right','home'];
var padState = {}, padPrev = {}, padRepeat = {}, padSubs = [], padAxis = {x:0,y:0};
var padOn = false, DEAD = 0.28;
var REPEAT_DIRS = { up:1, down:1, left:1, right:1 };

function pollPad(){
  var list = navigator.getGamepads ? navigator.getGamepads() : [];
  var gp = null;
  for (var i=0;i<list.length;i++) if (list[i] && list[i].connected){ gp = list[i]; break; }
  padOn = !!gp;
  var now = performance.now();

  for (var n=0;n<NAMES.length;n++) padPrev[NAMES[n]] = padState[NAMES[n]];

  if (gp){
    for (var b=0;b<NAMES.length;b++){
      var btn = gp.buttons[b];
      padState[NAMES[b]] = !!(btn && (btn.pressed || btn.value > 0.5));
    }
    var ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    padAxis.x = Math.abs(ax) > DEAD ? ax : 0;
    padAxis.y = Math.abs(ay) > DEAD ? ay : 0;
    /* stick doubles as the d-pad for menus */
    if (padAxis.x < -0.6) padState.left = true;
    if (padAxis.x >  0.6) padState.right = true;
    if (padAxis.y < -0.6) padState.up = true;
    if (padAxis.y >  0.6) padState.down = true;
  } else {
    for (var c=0;c<NAMES.length;c++) padState[NAMES[c]] = false;
    padAxis.x = padAxis.y = 0;
  }

  for (var k=0;k<NAMES.length;k++){
    var name = NAMES[k], is = padState[name], was = padPrev[name];
    var fire = false;
    if (is && !was){ fire = true; padRepeat[name] = now + 380; }
    else if (is && was && REPEAT_DIRS[name] && now > (padRepeat[name] || 0)){
      fire = true; padRepeat[name] = now + 150;
    }
    if (fire) for (var q=0;q<padSubs.length;q++) try { padSubs[q](name); } catch(e){}
  }
  if (raf) raf(pollPad);
}

A.paused = function(){ return paused; };

A.pad = {
  connected: function(){ return padOn; },
  axis: function(){ return padAxis; },
  down: function(name){ return !!padState[name]; },
  onPress: function(fn){ padSubs.push(fn); },
  /* the two face buttons everyone means by "confirm" and "back" */
  confirm: function(name){ return name === 'a' || name === 'start'; },
  cancel:  function(name){ return name === 'b'; }
};
if (raf) raf(pollPad);

function meta(name, fallback){
  var el = document.querySelector('meta[name="' + name + '"]');
  return (el && el.getAttribute('content')) || fallback;
}

function boot(){
  /* no #stage means we are on the launcher: skip the shell, keep the rest */
  if (!document.getElementById('stage')) return;

  var title  = meta('arcade-title', document.title || 'Untitled');
  var accent = meta('arcade-accent', '#e9e9f2');
  var home   = meta('arcade-home', '../index.html');
  var root   = home.replace(/index\.html$/, '');

  /* Add to Home Screen from inside a game should still install the arcade,
     under the arcade's name and icon, opening on the launcher. */
  function head(tag, attrs){
    var el = document.createElement(tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    document.head.appendChild(el);
    return el;
  }
  var appName = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (appName) appName.setAttribute('content', 'TINY ARCADE');
  else head('meta', { name:'apple-mobile-web-app-title', content:'TINY ARCADE' });
  if (!document.querySelector('meta[name="application-name"]'))
    head('meta', { name:'application-name', content:'TINY ARCADE' });
  if (!document.querySelector('link[rel="manifest"]'))
    head('link', { rel:'manifest', href: root + 'manifest.webmanifest' });
  if (!document.querySelector('link[rel="apple-touch-icon"]')){
    head('link', { rel:'apple-touch-icon', href: root + 'icon.png' });
    head('link', { rel:'icon', href: root + 'icon.png' });
  }

  var css = document.createElement('style');
  css.textContent = [
    ':root{',
    '  --arcade-bar:38px;',
    '  --arcade-h:calc(38px + env(safe-area-inset-top,0px));',
    '  --stage-h:calc(100dvh - var(--arcade-h));',
    '  --safe-top:0px;',
    '  --ark:' + accent + ';',
    '}',
    '#stage{top:var(--arcade-h)!important}',
    '.ark-bar{',
    '  position:fixed;top:0;left:0;right:0;z-index:9000;',
    '  height:var(--arcade-h);padding:env(safe-area-inset-top,0px) 6px 0 14px;',
    '  display:flex;align-items:center;gap:10px;',
    '  background:#0b0b11;border-bottom:1px solid #20212c;',
    '  font-family:ui-monospace,Menlo,monospace;',
    '}',
    '.ark-name{font-size:12px;font-weight:600;letter-spacing:.16em;',
    '  text-transform:uppercase;color:var(--ark)}',
    '.ark-tag{margin-left:auto;font-size:8px;font-weight:600;letter-spacing:.2em;color:#7c7f95}',
    '.ark-btn{flex:none;width:38px;height:26px;margin-left:8px;display:grid;place-items:center;',
    '  background:transparent;border:1px solid #20212c;color:#e9e9f2;cursor:pointer;padding:0}',
    '.ark-btn:active{background:#1a1a24}',
    '.ark-btn:focus-visible{outline:2px solid var(--ark);outline-offset:2px}',
    '.ark-btn i{display:block;width:9px;height:11px;',
    '  border-left:3px solid currentColor;border-right:3px solid currentColor}',
    '.ark-veil{position:fixed;inset:0;z-index:9100;display:none;place-items:center;',
    '  padding:28px 24px;text-align:center;background:rgba(6,6,10,.90);',
    '  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);',
    '  font-family:ui-monospace,Menlo,monospace;color:#e9e9f2}',
    '.ark-veil.on{display:grid}',
    '.ark-wrap{width:100%;max-width:290px}',
    '.ark-kick{font-size:9px;font-weight:600;letter-spacing:.32em;color:#7c7f95;margin-bottom:10px}',
    '.ark-title{font-size:30px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;',
    '  line-height:1;margin-bottom:26px;color:var(--ark)}',
    '.ark-act{display:block;width:100%;margin-bottom:9px;padding:14px;cursor:pointer;',
    '  font-family:inherit;font-weight:600;font-size:11px;letter-spacing:.24em;',
    '  background:transparent;border:1px solid #20212c;color:#e9e9f2;text-decoration:none}',
    '.ark-act.key{border-color:var(--ark);color:var(--ark);background:rgba(255,255,255,.04)}',
    '.ark-act:active{background:rgba(255,255,255,.08)}',
    '.ark-act:focus-visible{outline:2px solid var(--ark);outline-offset:2px}',
    '.ark-note{margin-top:14px;font-size:9.5px;line-height:1.7;color:#7c7f95}',
    '.ark-sep{display:flex;align-items:center;gap:8px;margin:20px 0 12px;',
    '  font-size:8px;letter-spacing:.3em;color:#7c7f95}',
    '.ark-sep::before,.ark-sep::after{content:"";flex:1;height:1px;background:#20212c}',
    '.ark-row{display:flex;gap:8px;margin-bottom:9px}',
    '.ark-row .ark-act{margin-bottom:0}',
    '.ark-act.tog{display:flex;align-items:center;justify-content:space-between;',
    '  padding:12px 13px;letter-spacing:.16em}',
    '.ark-act.tog b{font-weight:600;color:#565a70}',
    '.ark-act.tog.on b{color:var(--ark)}',
    '.ark-act.cursor{border-color:var(--ark);box-shadow:0 0 0 1px var(--ark) inset}',
    '.ark-hint{margin-top:10px;font-size:9px;letter-spacing:.14em;color:#565a70}'
  ].join('\n');
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.className = 'ark-bar';
  bar.innerHTML = '<span class="ark-name"></span>' +
                  '<span class="ark-tag">RUNNING</span>' +
                  '<button class="ark-btn" type="button" aria-label="Pause"><i></i></button>';
  bar.querySelector('.ark-name').textContent = title;
  document.body.appendChild(bar);

  var veil = document.createElement('div');
  veil.className = 'ark-veil';
  veil.innerHTML =
    '<div class="ark-wrap">' +
      '<div class="ark-kick">PAUSED</div>' +
      '<div class="ark-title"></div>' +
      '<button class="ark-act key" type="button" data-a="resume">RESUME</button>' +
      '<button class="ark-act" type="button" data-a="restart">RESTART</button>' +
      '<a class="ark-act" href="' + home + '">EXIT TO ARCADE</a>' +
      '<div class="ark-sep">AUDIO</div>' +
      '<div class="ark-row">' +
        '<button class="ark-act tog" type="button" data-a="sfx">SFX<b>ON</b></button>' +
        '<button class="ark-act tog" type="button" data-a="music">MUSIC<b>ON</b></button>' +
      '</div>' +
      '<button class="ark-act" type="button" data-a="all">MUTE ALL</button>' +
      '<div class="ark-note">Restarting throws away the current run.</div>' +
      '<div class="ark-hint" id="ark-pad"></div>' +
    '</div>';
  veil.querySelector('.ark-title').textContent = title;
  document.body.appendChild(veil);

  var tag = bar.querySelector('.ark-tag');
  var AU = (window.Arcade && window.Arcade.audio) || null;

  function paintAudio(){
    if (!AU) return;
    var t = veil.querySelectorAll('.ark-act.tog');
    for (var i=0;i<t.length;i++){
      var k = t[i].getAttribute('data-a'), on = AU.get(k);
      t[i].classList.toggle('on', on);
      t[i].querySelector('b').textContent = on ? 'ON' : 'OFF';
    }
    veil.querySelector('[data-a="all"]').textContent = AU.anyOn() ? 'MUTE ALL' : 'UNMUTE ALL';
  }
  if (AU){ AU.onChange(paintAudio); paintAudio(); }

  function setPaused(v){
    if (v === paused) return;
    if (!v) { var cb = held; held = null; if (cb) { try { cb(performance.now()); } catch(e){} } }
    paused = v;
    veil.classList.toggle('on', v);
    tag.textContent = v ? 'PAUSED' : 'RUNNING';
    if (AU){ AU.init(); AU.hush(v); if (v) paintAudio(); }
  }

  bar.querySelector('.ark-btn').addEventListener('click', function(){
    if (AU) AU.init();
    setPaused(!paused);
  });

  /* ---- pad-driven pause menu ---- */
  var acts = [], cursor = 0;
  function refreshActs(){
    acts = [].slice.call(veil.querySelectorAll('.ark-act'));
    paintCursor();
  }
  function paintCursor(){
    for (var i=0;i<acts.length;i++) acts[i].classList.toggle('cursor', i === cursor && A.pad.connected());
  }
  function moveCursor(d){
    if (!acts.length) refreshActs();
    cursor = (cursor + d + acts.length) % acts.length;
    paintCursor();
  }
  refreshActs();

  A.pad.onPress(function(name){
    if (name === 'start'){ if (AU) AU.init(); setPaused(!paused); return; }
    if (!paused){
      if (name === 'back'){ if (AU) AU.init(); setPaused(true); }
      return;
    }
    if (name === 'up')   return moveCursor(-1);
    if (name === 'down') return moveCursor(1);
    if (name === 'b')    return setPaused(false);
    if (name === 'a'){
      if (!acts.length) refreshActs();
      var el = acts[cursor];
      if (el) el.click();
      setTimeout(refreshActs, 0);
    }
  });

  var padHint = document.getElementById('ark-pad');
  function padWatch(){
    var on = A.pad.connected();
    if (padHint) padHint.textContent = on ? 'PAD \u00B7 D-PAD MOVE \u00B7 A SELECT \u00B7 B RESUME \u00B7 START PAUSE' : '';
    if (on) paintCursor();
    setTimeout(padWatch, 700);
  }
  padWatch();
  window.addEventListener('gamepadconnected', function(){
    tag.textContent = 'PAD READY';
    setTimeout(function(){ tag.textContent = paused ? 'PAUSED' : 'RUNNING'; }, 1600);
  });
  veil.addEventListener('click', function(e){
    var el = e.target.closest ? e.target.closest('[data-a]') : e.target;
    var a = el && el.getAttribute('data-a');
    if (a === 'resume') setPaused(false);
    else if (a === 'restart') location.reload();
    else if (a === 'sfx' || a === 'music'){
      if (!AU) return;
      AU.init(); AU.toggle(a);
      (AU.get(a) ? window.Arcade.ui.ok : window.Arcade.ui.off)();
    } else if (a === 'all'){
      if (!AU) return;
      AU.init();
      if (AU.anyOn()){ AU.allOff(); } else { AU.allOn(); window.Arcade.ui.ok(); }
    }
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){ e.preventDefault(); setPaused(!paused); }
  });
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) setPaused(true);
  });

  // the game booted at full height a moment ago — tell it the room shrank
  window.dispatchEvent(new Event('resize'));
  setTimeout(function(){ window.dispatchEvent(new Event('resize')); }, 60);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
