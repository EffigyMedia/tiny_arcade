/* =====================================================================
   TINY ARCADE — audio.js

   Every sound in this arcade is generated at runtime. No samples, no
   files, nothing to download. One shared engine so the mute settings
   follow you from the launcher into a game and back.

     <script src="../audio.js"></script>     (before arcade.js)

   Buses:  sfx  · music  · ui        each mutable independently
   Prefs persist in localStorage under 'tinyarcade.audio.v1'.

   Browsers will not make a sound until the user has touched something,
   so call Arcade.audio.init() from a real gesture handler.

   © 2026 Effigy Media. All rights reserved.
   ===================================================================== */
(function(){
"use strict";

var KEY = 'tinyarcade.audio.v1';
var A = window.Arcade = window.Arcade || {};

var ctx = null, master = null, sfxBus = null, musBus = null, uiBus = null;
var verb = null, noiseBuf = null, hushed = false;
var listeners = [];

var pref = { sfx:true, music:true };
try {
  var raw = localStorage.getItem(KEY);
  if (raw){ var o = JSON.parse(raw); pref.sfx = o.sfx !== false; pref.music = o.music !== false; }
} catch(e){}

function save(){ try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch(e){} }
function fire(){ for (var i=0;i<listeners.length;i++) try { listeners[i](pref); } catch(e){} }

function applyGains(t){
  if (!ctx) return;
  var now = ctx.currentTime, k = Math.max(0.004, (t === undefined ? 0.09 : t) / 3);
  sfxBus.gain.setTargetAtTime((pref.sfx   && !hushed) ? 1    : 0, now, k);
  musBus.gain.setTargetAtTime((pref.music && !hushed) ? 0.85 : 0, now, k);
  uiBus.gain.setTargetAtTime(pref.sfx ? 0.9 : 0, now, 0.01);
}

function buildVerb(){
  var len = Math.floor(ctx.sampleRate * 1.9);
  var buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (var c=0;c<2;c++){
    var d = buf.getChannelData(c);
    for (var i=0;i<len;i++){
      var x = i/len;
      d[i] = (Math.random()*2-1) * Math.pow(1-x, 3.1) * (1 - x*0.25);
    }
  }
  var cv = ctx.createConvolver(); cv.buffer = buf;
  return cv;
}

/* ------------------------------------------------------------------ */
A.audio = {
  ready:false,
  ctx:null,

  init: function(){
    if (ctx){ if (ctx.state === 'suspended') ctx.resume(); return true; }
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return false;
    try { ctx = new C(); } catch(e){ return false; }

    master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.connect(master);
    uiBus  = ctx.createGain(); uiBus.connect(master);

    verb = buildVerb();
    var vg = ctx.createGain(); vg.gain.value = 0.85;
    verb.connect(vg); vg.connect(master);

    var n = Math.floor(ctx.sampleRate * 2);
    noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i=0;i<n;i++) d[i] = Math.random()*2-1;

    A.audio.ctx = ctx; A.audio.ready = true;
    applyGains(0);
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  },

  get: function(k){ return pref[k]; },
  set: function(k, v){ pref[k] = !!v; save(); applyGains(); fire(); },
  toggle: function(k){ A.audio.set(k, !pref[k]); },
  allOn:  function(){ pref.sfx = true;  pref.music = true;  save(); applyGains(); fire(); },
  allOff: function(){ pref.sfx = false; pref.music = false; save(); applyGains(); fire(); },
  anyOn:  function(){ return pref.sfx || pref.music; },
  onChange: function(fn){ listeners.push(fn); },

  /* silence everything without touching the user's preferences */
  hush: function(v){
    hushed = !!v;
    applyGains(0.16);
    if (hushed) A.music.pause(); else A.music.resume();
  },

  bus: function(which){
    return which === 'music' ? musBus : which === 'ui' ? uiBus : sfxBus;
  },
  now: function(){ return ctx ? ctx.currentTime : 0; }
};

/* ------------------------------------------------------------------
   voices
   ------------------------------------------------------------------ */
function env(g, t0, peak, attack, dur, hold){
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
  if (hold) g.gain.setValueAtTime(Math.max(0.0002, peak), t0 + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
}

A.sfx = {
  /* a pitched blip, optionally sliding */
  tone: function(o){
    if (!ctx) return null;
    o = o || {};
    var t0 = o.t || ctx.currentTime;
    var dur = o.dur || 0.18;
    var osc = ctx.createOscillator();
    osc.type = o.type || 'square';
    var f0 = o.freq || 440, f1 = o.to || f0;
    osc.frequency.setValueAtTime(f0, t0);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    if (o.detune) osc.detune.value = o.detune;

    var g = ctx.createGain();
    env(g, t0, o.gain === undefined ? 0.22 : o.gain, o.attack === undefined ? 0.006 : o.attack, dur, o.hold);

    var tail = osc;
    if (o.cutoff){
      var f = ctx.createBiquadFilter();
      f.type = o.filter || 'lowpass';
      f.frequency.setValueAtTime(o.cutoff, t0);
      if (o.cutoffTo) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.cutoffTo), t0 + dur);
      if (o.q) f.Q.value = o.q;
      tail.connect(f); tail = f;
    }
    tail.connect(g);
    g.connect(A.audio.bus(o.bus || 'sfx'));
    if (o.verb){ var vs = ctx.createGain(); vs.gain.value = o.verb; g.connect(vs); vs.connect(verb); }
    osc.start(t0); osc.stop(t0 + dur + 0.06);
    return osc;
  },

  /* filtered noise: impacts, wind, hats, splashes */
  noise: function(o){
    if (!ctx) return null;
    o = o || {};
    var t0 = o.t || ctx.currentTime;
    var dur = o.dur || 0.2;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    src.playbackRate.value = o.rate || 1;

    var f = ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1200, t0);
    if (o.to) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + dur);
    f.Q.value = o.q === undefined ? 1 : o.q;

    var g = ctx.createGain();
    env(g, t0, o.gain === undefined ? 0.2 : o.gain, o.attack === undefined ? 0.004 : o.attack, dur, o.hold);

    src.connect(f); f.connect(g);
    g.connect(A.audio.bus(o.bus || 'sfx'));
    if (o.verb){ var vs = ctx.createGain(); vs.gain.value = o.verb; g.connect(vs); vs.connect(verb); }
    src.start(t0); src.stop(t0 + dur + 0.06);
    return src;
  },

  /* several tones at once */
  chord: function(freqs, o){
    o = o || {};
    for (var i=0;i<freqs.length;i++){
      var c = {}; for (var k in o) c[k] = o[k];
      c.freq = freqs[i];
      c.t = (o.t || (ctx ? ctx.currentTime : 0)) + (o.spread || 0) * i;
      A.sfx.tone(c);
    }
  },

  drum: function(kind, t, gain, bus){
    if (!ctx) return;
    t = t || ctx.currentTime;
    gain = gain === undefined ? 0.5 : gain;
    bus = bus || 'music';
    if (kind === 'kick'){
      A.sfx.tone({ t:t, freq:150, to:44, dur:0.19, type:'sine', gain:gain, attack:0.004, bus:bus });
      A.sfx.noise({ t:t, freq:90, dur:0.04, gain:gain*0.35, filter:'lowpass', bus:bus });
    } else if (kind === 'snare'){
      A.sfx.noise({ t:t, freq:1800, to:900, dur:0.15, gain:gain*0.55, filter:'bandpass', q:0.8, bus:bus });
      A.sfx.tone({ t:t, freq:210, to:150, dur:0.1, type:'triangle', gain:gain*0.28, bus:bus });
    } else if (kind === 'hat'){
      A.sfx.noise({ t:t, freq:8200, dur:0.038, gain:gain*0.22, filter:'highpass', q:0.6, bus:bus });
    } else if (kind === 'open'){
      A.sfx.noise({ t:t, freq:7200, dur:0.20, gain:gain*0.16, filter:'highpass', q:0.6, bus:bus });
    } else if (kind === 'tom'){
      A.sfx.tone({ t:t, freq:190, to:90, dur:0.22, type:'sine', gain:gain*0.5, bus:bus });
    } else if (kind === 'clap'){
      for (var i=0;i<3;i++)
        A.sfx.noise({ t:t+i*0.012, freq:1500, dur:0.09, gain:gain*0.3, filter:'bandpass', q:1.4, bus:bus });
    }
  },

  /* a held voice you drive yourself — engines, sirens, drones */
  hold: function(o){
    if (!ctx) return null;
    o = o || {};
    var osc = ctx.createOscillator();
    osc.type = o.type || 'sawtooth';
    osc.frequency.value = o.freq || 110;
    if (o.detune) osc.detune.value = o.detune;
    var f = ctx.createBiquadFilter();
    f.type = o.filter || 'lowpass';
    f.frequency.value = o.cutoff || 900;
    f.Q.value = o.q === undefined ? 0.8 : o.q;
    var g = ctx.createGain(); g.gain.value = 0;
    osc.connect(f); f.connect(g); g.connect(A.audio.bus(o.bus || 'sfx'));
    if (o.verb){ var vs = ctx.createGain(); vs.gain.value = o.verb; g.connect(vs); vs.connect(verb); }
    osc.start();
    return {
      osc:osc, filter:f, gain:g,
      set: function(freq, level, cutoff, glide){
        var n = ctx.currentTime, k = glide || 0.05;
        if (freq !== undefined)   osc.frequency.setTargetAtTime(Math.max(8, freq), n, k);
        if (level !== undefined)  g.gain.setTargetAtTime(level, n, k);
        if (cutoff !== undefined) f.frequency.setTargetAtTime(Math.max(40, cutoff), n, k);
      },
      stop: function(){ try { g.gain.setTargetAtTime(0, ctx.currentTime, 0.05); osc.stop(ctx.currentTime + 0.4); } catch(e){} }
    };
  },

  /* same idea but noise-based — wind, tyre roar, water */
  holdNoise: function(o){
    if (!ctx) return null;
    o = o || {};
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    var f = ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.value = o.freq || 800;
    f.Q.value = o.q === undefined ? 0.7 : o.q;
    var g = ctx.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(A.audio.bus(o.bus || 'sfx'));
    src.start();
    return {
      gain:g, filter:f,
      set: function(freq, level, glide){
        var n = ctx.currentTime, k = glide || 0.08;
        if (freq !== undefined)  f.frequency.setTargetAtTime(Math.max(40, freq), n, k);
        if (level !== undefined) g.gain.setTargetAtTime(level, n, k);
      },
      stop: function(){ try { g.gain.setTargetAtTime(0, ctx.currentTime, 0.05); src.stop(ctx.currentTime + 0.4); } catch(e){} }
    };
  }
};

/* small interface clicks, on their own bus so a paused game stays audible */
A.ui = {
  tick: function(){ A.sfx.tone({ freq:900, to:1300, dur:0.05, type:'square', gain:0.10, bus:'ui' }); },
  ok:   function(){ A.sfx.tone({ freq:660, to:990, dur:0.10, type:'square', gain:0.11, bus:'ui' }); },
  off:  function(){ A.sfx.tone({ freq:520, to:300, dur:0.10, type:'square', gain:0.11, bus:'ui' }); }
};

/* ------------------------------------------------------------------
   music: a lookahead step sequencer. A game hands over a tick(step, t)
   and schedules whatever it likes at the times it is given.
   ------------------------------------------------------------------ */
var M = { bpm:120, div:4, step:0, next:0, tickFn:null, timer:null, on:false, paused:false };

A.music = {
  start: function(bpm, div, tickFn){
    if (!ctx) return;
    A.music.stop();
    M.bpm = bpm; M.div = div; M.tickFn = tickFn;
    M.step = 0; M.next = ctx.currentTime + 0.1; M.on = true; M.paused = false;
    M.timer = setInterval(function(){
      if (!M.on || M.paused || !ctx) return;
      var horizon = ctx.currentTime + 0.14;
      var spb = 60 / M.bpm / M.div;
      var guard = 0;
      while (M.next < horizon && guard++ < 64){
        try { M.tickFn(M.step, M.next); } catch(e){}
        M.step++; M.next += spb;
      }
    }, 25);
  },
  stop: function(){
    M.on = false; M.tickFn = null;
    if (M.timer){ clearInterval(M.timer); M.timer = null; }
  },
  pause:  function(){ M.paused = true; },
  resume: function(){
    if (!M.on || !ctx) return;
    if (M.paused){ M.next = ctx.currentTime + 0.06; M.paused = false; }
  },
  playing: function(){ return M.on; },
  bpm: function(){ return M.bpm; }
};

/* a handful of note names so game code reads musically */
var NAMES = {C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
A.note = function(name, oct){
  var n = NAMES[name];
  if (n === undefined) return 440;
  return 440 * Math.pow(2, (n - 9) / 12 + ((oct === undefined ? 4 : oct) - 4));
};

/* first touch anywhere wakes the engine up */
function wake(){ A.audio.init(); }
document.addEventListener('pointerdown', wake, { once:false, passive:true });
document.addEventListener('keydown', wake, { passive:true });
})();
