# TINY ARCADE

A tiny arcade cabinet that lives in a browser tab. Runs offline, no build step.

    DESIGN.md           the work queue: what is built, what is next
    sw.js               service worker: offline play, no stale files
    pack.sh             builds the zip from a whitelist
    sync.sh             pushes this folder to the GitHub repo
    index.html          the launcher (the arcade floor)
    audio.js            shared synth engine — every sound is generated
    manifest.webmanifest  installs as TINY ARCADE on Android/Chrome
    effigy.png          attribution mark shown in the footer
    games.js            the catalogue — one entry per machine
    arcade.js           shared pause / restart / exit header
    icon.png            home-screen icon
    games/*.html        one self-contained game per file

## Running it

Open `index.html`. That's it.

To play it like an app on a phone or tablet, put the folder somewhere with a
URL — https://app.netlify.com/drop takes a drag-and-drop folder and gives you
one in about a minute — then open it in Safari and use
**Share → Add to Home Screen**. It launches full screen with no browser bars.

The name comes up pre-filled as **TINY ARCADE** with the cabinet icon, and it
does so even if you happen to be inside a game when you hit Share — `arcade.js`
puts the arcade's name, icon and manifest on every page, and the manifest's
`start_url` sends the installed app back to the launcher rather than whichever
machine you were standing at.

## A note on editing the launcher's CSS

`index.html` keeps its styles in one `<style>` block. A stray `}` there closes
the stylesheet early and **silently kills every rule below it** — no error, no
warning, the page just quietly loses layout. That happened once: deleting the
scrolling marquee left an orphaned keyframe step behind, and `.rack`'s
`display:grid` stopped applying, so the favourites ordering computed correctly
and rendered in DOM order anyway.

If layout goes strange after an edit, check the braces balance before anything
else:

```js
let d=0; for (const c of css) d += c==='{' ? 1 : c==='}' ? -1 : 0;
// d must be 0
```

## Packing

    ./pack.sh

Builds `tiny-arcade.zip` from an explicit list of files rather than from
whatever happens to be in the folder. It also checks that every game named in
`games.js` is present and that no game is shipped which the catalogue does not
list, and it refuses to run if anything scratch (`_*`, dotfiles, `.py`) made it
into the staging area.

This exists because four instrumented debug builds — `_n.html`, `_s.html`,
`_st.html`, `_x.html` — once reached the public zip. Cleanup had been tacked
onto the end of shell lines that sometimes never ran. A whitelist cannot fail
that way.

## Pushing to GitHub

    ./sync.sh "what changed"

Clones github.com/EffigyMedia/tiny_arcade to a temp directory, copies these
files over it, and commits only what actually differs. History is preserved,
nothing is force-pushed, and a second run with no changes does nothing.

Override the target with `TINY_ARCADE_REPO=...` if the repo ever moves.

## Offline

`sw.js` is a service worker. It registers from `arcade.js`, so the launcher and
every game get it without any per-page setup.

Two rules, pulling in opposite directions:

- **pages and scripts** — network first with a 2.5s timeout, falling back to
  cache. Online you always get the newest file; offline you get the last one
  that worked.
- **art, icons and fonts** — served from cache instantly, refreshed in the
  background for next time.

There is **no version number to bump**. Freshness comes from asking the network
first, not from a cache name.

One subtlety worth knowing if you ever touch it: the worker fetches with
`cache: 'reload'`. The browser keeps its own HTTP cache *in front of* the
worker and will otherwise hand it a stale script it decided was still fresh.
With `reload`, the Cache API is the only cache in play, which is the point.

On a first visit the launcher quietly asks the worker to pull the **whole
catalogue** down in the background, so even a machine you have never opened
works with no signal. Settings (the cog, top right) has a **FETCH ALL** button
to do it again on command, with a progress bar, plus the sound toggles and an
erase-saved-data option.

## Adding a game## Adding a game

1. Drop `yourgame.html` into `games/`.

2. Put four lines in its `<head>`:

       <meta name="arcade-title"  content="Your Game">
       <meta name="arcade-accent" content="#4de0c8">
       <script src="../audio.js"></script>
       <script src="../arcade.js"></script>

3. Add one entry to `games.js`:

       {
         file:  'games/yourgame.html',
         name:  'Your Game',
         accent:'#4de0c8',
         genre: 'PUZZLE \u00B7 TURN-BASED',
         hook:  'One sentence that makes someone want to tap it.',
         attract:'grid'
       }

   `attract` picks the little idle animation on the card:
   `dive`, `grid`, `road`, or `none`.

That's the whole process. The launcher builds itself from `games.js` — the rack
is a grid, so it goes one column on a phone and two on a tablet, scrolls as long
as it needs to, and only runs the attract loops for cabinets you can actually
see. Nothing in the launcher assumes how many machines there are.

Keep `hook` to one short line: cards clamp it at four lines.

## What arcade.js expects

It injects a 38px title bar and a pause menu, then tells the game the room got
smaller by firing a `resize` event. For that to land correctly a game needs:

- an `#stage` element positioned `absolute; inset: 0`
- its root sized from `var(--stage-h)`, e.g.
  `height: var(--stage-h); width: min(100dvw, calc(var(--stage-h) * 0.62))`
- any top safe-area padding written as `var(--safe-top, env(safe-area-inset-top, 0px))`
- a `resize` listener that recomputes layout

All three variables have standalone defaults, so a game still works when you
open its file directly without the launcher.

## Sound

Nothing is sampled — `audio.js` synthesises every note and every effect from
oscillators and filtered noise, so the whole arcade weighs nothing and works
with no network.

Three buses: **sfx**, **music**, and **ui**. The player's mute choices live in
`localStorage` and follow them from the launcher into a game and back. The
pause menu carries SFX / MUSIC toggles and a MUTE ALL; the launcher has a
speaker button in the corner.

Browsers refuse to make noise until the user has touched something, so call
`Arcade.audio.init()` from a real gesture handler — the title screen tap is
usually the right place.

Useful pieces:

    Arcade.sfx.tone({freq, to, dur, type, gain, cutoff, verb})
    Arcade.sfx.noise({freq, to, dur, gain, filter, q})
    Arcade.sfx.drum('kick'|'snare'|'hat'|'open'|'tom'|'clap', t, gain)
    Arcade.sfx.hold({...})        a held voice you drive yourself
    Arcade.sfx.holdNoise({...})   wind, tyres, water
    Arcade.music.start(bpm, stepsPerBeat, function(step, t){ ... })
    Arcade.note('C#', 4)

A music bed is just a `tick(step, t)` that schedules notes at the times it is
handed. Put drones and pads on `bus:'music'` so the music toggle governs them.

## Controls

Touch, mouse and keyboard work everywhere. Any standard gamepad — Xbox,
DualShock/DualSense, 8BitDo — is picked up automatically by `arcade.js` and
mapped to common names, so a game never has to care which pad it is.

    Arcade.pad.connected()      is one plugged in
    Arcade.pad.axis()           {x, y} from the left stick, dead-zoned
    Arcade.pad.down('rt')       held state
    Arcade.pad.onPress(fn)      fires on press; directions auto-repeat

Names: `a b x y lb rb lt rt back start l3 r3 up down left right`. The stick
also reports as d-pad presses, so menus work either way.

**Start** pauses from anywhere, **B** resumes, and the pause menu is
navigable with the d-pad and **A**.

## Saving

`Arcade.save` is namespaced localStorage — one slot per game id, holding
anything JSON-serialisable.

    Arcade.save.get(id)         -> object or null
    Arcade.save.set(id, obj)
    Arcade.save.merge(id, obj)
    Arcade.save.clear(id)

If a game writes a `label`, the launcher prints it on that machine's cabinet
card, so high scores show up on the arcade floor. Write `resume: true` and the
card also shows RUN IN PROGRESS.

Deep and Highway keep a best score. Derelict saves the **whole run** — map,
fog, inventory, installed cores, the lot — after every turn, and offers
CONTINUE on its title screen. Cores hold functions so they travel by name and
are re-linked on load. Dying clears the slot.

Nothing leaves the device. There is no account and no server.

## How pausing works

Pausing is done by gating `requestAnimationFrame` — a paused loop never gets to
schedule its next frame — so `arcade.js` needs to know nothing about a game's
internals. Turn-based games get the menu and the exit route for free even
though there's no clock to stop.

---

© 2026 Effigy Media. All rights reserved.
