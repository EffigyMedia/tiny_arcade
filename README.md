# TINY ARCADE

A tiny arcade cabinet that lives in a browser tab. Runs offline, no build step.

    index.html          the launcher (the arcade floor)
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

## Adding a game

1. Drop `yourgame.html` into `games/`.

2. Put three lines in its `<head>`:

       <meta name="arcade-title"  content="Your Game">
       <meta name="arcade-accent" content="#4de0c8">
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

Pausing is done by gating `requestAnimationFrame` — a paused loop never gets to
schedule its next frame — so `arcade.js` needs to know nothing about a game's
internals. Turn-based games get the menu and the exit route for free even
though there's no clock to stop.

---

© 2026 Effigy Media. All rights reserved.
