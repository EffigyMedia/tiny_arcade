> **REFERENCE ANCESTOR — frozen on 2026-08-23 at the Code Continuum standup.**
> This document is the record of the work done before the project moved into the
> development process. It is not updated. The live design authority is
> `docs/core/tiny_arcade_design.md`. The live work record is the fragment store in
> `docs/fragments/`. Read this document for the reasoning behind what exists; do not
> add to it.

# Shipping Tiny Arcade

How this gets out of a browser tab and in front of people. Written 2026-08-20;
prices and store terms change, so verify before committing to anything.

---

## What it is, technically

A static site. No server, no backend, no build step. Saves go to `localStorage`,
audio is synthesised at runtime, and since the fonts were brought in-house
(see `fonts.py`) there is **no network call at launch at all**.

That is an unusually good position to be in. Every wrapping option below works
by pointing a webview at exactly these files.

---

## Wrapping it

**Godot is the wrong tool.** Its web support runs the other way — Godot exports
*to* HTML5. Putting HTML *inside* Godot means embedding a browser it does not
ship. You would fight it the whole way.

### Mobile — Capacitor

Wraps a web app as a real iOS and Android app: App Store and Play Store, proper
icon, no browser chrome. Free, open source, from the Ionic team. Point it at
this folder and it mostly just works. `localStorage` behaves the same inside the
webview, so saves survive.

Costs: Apple Developer Program is about $99/year, Google Play a one-off ~$25.

### Desktop — Tauri

Uses the operating system's own webview, so a binary lands around a megabyte
rather than Electron's hundred-plus. Rust toolchain to build, but the app itself
stays HTML. Steam accepts Tauri builds.

### Neither — PWA

It already installs to a home screen and runs offline. Free, no store review, no
cut. The weakness is discovery: nobody browses for PWAs.

---

## Where to sell it

**itch.io — start here.** Hosts HTML5 games playable in the browser *and* as
downloads, you set the price, and it is the lowest-friction way to find out
whether anyone wants this. No wrapping required. Put it up before investing in
native builds.

**Steam** — needs a desktop wrapper and a $100 submission fee per title. Worth
it only once there is evidence of demand.

**App Store / Play** — the natural home for a phone arcade, and the highest
effort. Review is stricter about "collection of small games" than it used to be;
the Originals are the strongest argument that this is a real product.

**Sell the collection, not the games.** That is the right framing: the shelves
make it one cabinet with many machines rather than four separate purchases.

---

## The clone problem

Be clear-eyed about this before money changes hands.

**Effigy Originals** — Deep, Derelict, Highway — are yours outright. No
exposure. Sell them with confidence.

**Golden Era** is different. Selling clean-room takes on Pac-Man, Tetris and the
rest commercially is a real risk rather than a theoretical one. The Tetris
Company in particular pursues clones aggressively, including ones that changed
the names and the art. Bundling does not help: a rights holder objects to the
copy being distributed, not to how it is packaged.

**The mitigation is already built in.** Games carry a `cat`, and the launcher
renders shelves from it, so a commercial build can simply omit `games/golden/`
and come up with two shelves and no complaints. Doing that *before* release
costs nothing; doing it after a complaint costs a great deal more.

The posture I would take: **sell the Originals, keep the clones free.** They are
the front of house that gets people in, and they cannot be leveraged against you
if nobody is charged for them.

To keep the split cheap, hold one rule: **nothing clone-specific ever goes into
the shared layer.** `arcade.js`, `audio.js` and the launcher stay generic. The
moment Golden Era code leaks into the shell, pulling a shelf stops being a
one-line change.

---

## Before any of it

- [x] **Self-host the fonts.** Done — a wrapped app cannot depend on
      fonts.googleapis.com at launch.
- [ ] **Decide the commercial shelf split**, and add `./pack.sh --commercial`
      to omit a category. Five minutes, but pointless until there is a release.
- [ ] **A licence file**, and font licences shipped alongside — `fonts/LICENSES.md`
      already exists.
- [ ] **Test the wrapped build on a real device.** Webviews are not browsers;
      audio autoplay and safe-area insets are where it usually bites.
