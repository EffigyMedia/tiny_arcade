# TINY ARCADE

An arcade cabinet that lives in a browser tab. Eighteen games on three shelves, offline, with no
server, no build step, and no network call at launch.

## Play it

**https://effigymedia.github.io/tiny_arcade/**

That link is the whole arcade and it is the only one worth sharing. Two things about it are worth
knowing before it is passed on:

- **The path is case-sensitive and the underscore matters.** `/Tiny_Arcade/` and `/tiny-arcade/`
  are not the same address and neither one exists.
- **A link to one cabinet is not a link to the arcade.** The games moved into shelf folders, so
  any cabinet link saved before that move is dead. Such a link now lands on a page that sends the
  visitor to the launcher, but the front door above is what to send in the first place.

On a phone, open it and use **Share → Add to Home Screen**. It installs as TINY ARCADE, launches
full screen, and works with no signal after the first visit.

    index.html            the launcher - the arcade floor
    games/<shelf>/*.html  one self-contained game per file
    games.js              the catalog - one entry per machine
    arcade.js             the shell: title bar, pause, gamepad, saves, scanlines
    audio.js              the synthesizer - every sound is generated at runtime
    road.js               the shared driving engine, behind Highway and Raceway
    sw.js / assets.js     offline play, and the generated cache list
    fonts/                self-hosted and subset, licenses included

## Running it

Open `index.html`. That is the whole procedure.

To play it like an app, put the folder somewhere with a URL and open it on a phone, then use
**Share → Add to Home Screen**. It launches full screen with no browser bars, and it works with no
signal after the first visit.

## Building it

    ./pack.sh            build and validate tiny-arcade.zip
    ./pack.sh --check    validate only, build nothing

The build works from an explicit whitelist rather than from whatever is in the folder, and it
refuses to build when a check fails. It needs `node`.

**The build cannot tell you the game works.** That is what the two harnesses are for:

    python tools/smoke-test.py    all 18 cabinets boot, no errors, real paint on the canvas
    python tools/drive-test.py    both driving games play - speed, laps, fuel, tires, damage

## The documents

The live documents are in `docs/`: `core/tiny_arcade_design.md` is the design authority, and
`fragments/` is the work record. `docs/reference/` holds the six documents written before the
project entered its development process; they are frozen and kept for the reasoning in them.

Development instructions for an agent working in this repository are in `CLAUDE.md` at the root.

---

© 2026 Effigy Media. All rights reserved.
