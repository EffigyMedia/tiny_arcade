/* =====================================================================
   TINY ARCADE — arcade.js
   Drop this one line into any game's <head> and it gains a title bar,
   a pause menu, and a way back to the launcher:

     <script src="../arcade.js"></script>
     <meta name="arcade-title"  content="Sounding">
     <meta name="arcade-accent" content="#4de0c8">

   The contract a game has to honour is three CSS variables, all of
   which have standalone-friendly defaults so the game still runs fine
   when opened on its own:

     --stage-h    height available to the game        (default 100dvh)
     --safe-top   top safe-area inset to apply        (default env(...))
     #stage       an absolutely-positioned inset:0 root element

   Pausing works by gating requestAnimationFrame, so nothing here needs
   to know anything about how a particular game is built.
   ===================================================================== */
(function(){
"use strict";

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

function meta(name, fallback){
  var el = document.querySelector('meta[name="' + name + '"]');
  return (el && el.getAttribute('content')) || fallback;
}

function boot(){
  var title  = meta('arcade-title', document.title || 'Untitled');
  var accent = meta('arcade-accent', '#e9e9f2');
  var home   = meta('arcade-home', '../index.html');

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
    '.ark-note{margin-top:14px;font-size:9.5px;line-height:1.7;color:#7c7f95}'
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
      '<div class="ark-note">Restarting throws away the current run.</div>' +
    '</div>';
  veil.querySelector('.ark-title').textContent = title;
  document.body.appendChild(veil);

  var tag = bar.querySelector('.ark-tag');
  function setPaused(v){
    if (v === paused) return;
    if (!v) { var cb = held; held = null; if (cb) { try { cb(performance.now()); } catch(e){} } }
    paused = v;
    veil.classList.toggle('on', v);
    tag.textContent = v ? 'PAUSED' : 'RUNNING';
  }

  bar.querySelector('.ark-btn').addEventListener('click', function(){ setPaused(!paused); });
  veil.addEventListener('click', function(e){
    var a = e.target.getAttribute && e.target.getAttribute('data-a');
    if (a === 'resume') setPaused(false);
    if (a === 'restart') location.reload();
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
