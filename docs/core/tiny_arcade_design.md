# Tiny Arcade — Design Document

## 0. Document Control

| Field | Value |
|---|---|
| Document version | 1.0 |
| Date | 2026-08-23 |
| Owner | Alexander Steele, Effigy Media |
| Status | in build |
| Tier | Complex |
| Routing posture | `ROUTING_BIAS: 2` (quality) |

**One-line pitch.** Tiny Arcade is an arcade cabinet that lives in a browser tab: eighteen small
games on three shelves, all offline, with no server, no build step, and no network call at launch.

**Why the routing posture is quality.** The product is intended for sale (section 7, item 7). Two of
its decisions are expensive to reverse: the clone-risk posture in section 3, and any change to the
9,849-line driving engine, which serves two games at once. A generator defect or a lost tuning pass
costs more than the model time saved.

> **HOW THIS DOCUMENT WAS MADE, AND WHAT THAT MEANS FOR ITS AUTHORITY.**
> Tiny Arcade was built in a chat assistant before it entered the Code Continuum process. It had no
> design interview. This document is a reconstruction, written on 2026-08-23 at the standup from the
> six documents the project already carried, from `games.js`, and from the source itself. Those six
> documents are frozen in `docs/reference/` and are not updated again.
>
> From this date, **this document is the design authority**. Where it disagrees with a frozen
> ancestor, this document wins, and the disagreement is a defect in this document until section 12
> records the decision. Where a decision was made before the standup and its date is not recorded,
> section 12 says so instead of inventing one.
>
> **THE ANCESTORS ARE NOT EQUALLY AGED, AND THE FIRST VERSION OF THIS DOCUMENT GOT IT WRONG.**
> `DESIGN.md` is a running log in reverse date order, and it kept being appended after `DRIVING.md`
> and `START-HERE.md` were written. Its **top** entries are the newest thing in the repository. Read
> in the wrong order they produce a plan for work that is already done: this document's first
> version, and the fragment store seeded from it, listed corners, qualifying, sector times and the
> per-biome skyline as queued when all four had shipped. Corrected 2026-08-23 against the code.
> **When the frozen documents disagree, `DESIGN.md` from the top is the newest, and the code is the
> truth.**

---

## 1. Vision and Purpose

**The problem.** A person with five minutes and a phone has two poor options. Native arcade
collections need a store account, a download, and permission to track them. Web game portals need a
network, load advertisements, and lose the player's progress when the tab closes.

**The status quo and why it is not enough.** The classic cabinets that this product descends from
were designed for a ninety-second run and a single input. That shape fits a phone exactly. Almost
nothing on a phone keeps it, because the business model around a mobile game pulls toward sessions,
accounts, and advertisements.

**The core insight.** A static web page can be a complete arcade. Every sound is synthesized at
runtime, every font is self-hosted, and every save is local, so the whole product is a folder of
files. That folder installs to a home screen, runs with no signal, and costs nothing to serve.

**What success looks like.** A player opens the arcade on a phone with no signal, picks a machine
off a shelf, and plays a full run with sound. The player's best score is on the cabinet card when
the player comes back. The Effigy Originals are good enough to sell on their own.

---

## 2. Users and Success Criteria

**User types.**

| User | Context | Goal |
|---|---|---|
| The phone player | portrait, one thumb, a few minutes, often offline | one short run, no setup, no account |
| The tablet player | portrait or landscape, two hands | the same games with more room |
| The desktop player | keyboard or gamepad, a browser tab | the same games, no second-class input mode |
| The owner | the developer of the arcade | add a machine without a project around it |

**Success criteria.** Each one is observable.

1. The launcher opens with no network and lists every machine.
2. Any cabinet plays a full run with touch, with a keyboard, and with a standard gamepad. No input
   mode is second-class.
3. A run makes sound on the first gesture, with no mute toggle dance.
4. A best score written by a game appears on that machine's cabinet card in the launcher.
5. The console holds zero errors across load, play, pause, death, and restart.
6. A machine holds 60 frames per second on a mid-range phone.
7. A new machine is added with one HTML file, four lines in its `<head>`, and one entry in
   `games.js`.

**The quality bar.** *Usable* is a run that completes with no error. *Good* adds the sound bed that
reacts to play and an attract card that matches the machine. *Done* is the machine-checkable list in
section 9 plus the owner's verdict on a real device.

---

## 3. Scope, Principles and Constraints

### North-star principles

1. **One cabinet, many machines.** The shell, the audio engine, and the launcher are the arcade. A
   game is a machine that stands on its floor. The product is the collection.
2. **Nothing is downloaded to play.** Sound is synthesized, fonts are self-hosted, art is drawn at
   runtime. A network is a convenience, never a dependency.
3. **The player's device holds everything.** Saves are local. There is no account and no server.
4. **A game is one self-contained file.** A machine that needs a build step is not a machine.
5. **Measure before a change, and check the artifact, not the source.** Almost every wrong turn in
   the pre-standup work came from a number adjusted by eye, or from trust in a green build that was
   never opened. This principle is load-bearing and it is section 9's reason to exist.
6. **Nothing clone-specific enters the shared layer.** `arcade.js`, `audio.js`, and the launcher
   stay generic, so a commercial build can drop a whole shelf with a one-line change.

### Non-Goals

Each is a decision, not an omission.

| Non-goal | Why | Date |
|---|---|---|
| A server, an account, or a login | The product is a folder of static files. A server would make it a service. | before 2026-08-23 |
| A build step or a bundler | A machine must open from the file system with no toolchain. | before 2026-08-23 |
| Sampled audio assets | The synthesizer makes the arcade weigh almost nothing and work offline. | before 2026-08-23 |
| Any analytics or tracking | Nothing leaves the device. | before 2026-08-23 |
| Landscape orientation in the shell | The shell assumes portrait. A few queued machines want width, and that is queued work, not a current capability. | before 2026-08-23 |
| Godot, or any engine wrapper | Godot exports *to* HTML. To put HTML inside it means to embed a browser it does not ship. | 2026-08-20 |
| Multiplayer, in any form | No server, and no queued machine needs it. | 2026-08-23 |

### Constraints

| Constraint | Hard or preference |
|---|---|
| The whole product runs from `file://` and from a static host, with no server logic. | hard |
| Portrait, from 320x568 through 430x932, plus tablet. | hard |
| No network call at launch, fonts included. | hard |
| Clean-room only: our name, our palette, our typography, our sound. See the clone posture below. | hard |
| Vanilla JavaScript, no framework and no dependency. | preference, held since the first machine |

### The clone posture, which is a legal constraint and not a style

The Golden Era and Second Wave shelves hold clean-room takes on published cabinets. Game rules are
not protected; presentation is. A rights holder objects to the copy, not to the wrapper around it,
so a bundle does not help.

The rules that follow from this:

- Our name, our palette, our typography, our sound, for every machine.
- No lifted sprite shapes, color schemes, level layouts, or character designs.
- Every clone entry records what it descends from, in this document. Six months later, "Myriapod"
  says nothing; "after Centipede" says everything.
- Each machine gets a distinct accent color, so the launcher never shows two of one color.

**The commercial split.** The intended posture is to sell the Effigy Originals — Deep and Derelict —
and to keep the other two shelves free. The mechanism is already built: every catalog entry carries
a `cat` field and the launcher builds its shelves from it, so a commercial build omits a shelf. See
section 11 for the risk this manages.

### Not greenfield

The project entered the process with about 21,000 lines of working code, eighteen shipped machines,
and 220 commits. Section 8 describes the architecture as built, not as wished. What must not break:
the shell contract in section 5, the save format, and the two driving games that share one engine.

---

## 4. Domain Model and Vocabulary

| Term | Meaning |
|---|---|
| **Arcade** | The whole product: the launcher, the shell, the audio engine, and every machine. |
| **Machine** (also **cabinet**) | One game. One self-contained HTML file at `games/<cat>/<id>.html`. |
| **Shelf** | A group of machines shown as one rack. Three exist: Golden Era (`ge`), Second Wave (`sw`), Effigy Originals (`em`). |
| **Catalog** | `games.js`. One entry per machine. The launcher builds itself from it and holds no list of its own. |
| **Catalog entry** | `{file, id, cat, name, accent, genre, hook, attract}`. |
| **Accent** | The machine's one color. It is in the catalog entry and in the machine's own `arcade-accent` meta tag. |
| **Hook** | The one or two lines on the cabinet card. It is written like cabinet glass, not like a store listing. |
| **Attract** | The idle animation on a cabinet card. The field names a function in the `draw` map in `index.html`. |
| **Shell** | `arcade.js`. The title bar, the pause menu, the gamepad, the save layer, the gesture layer, and the scanline overlay. |
| **Bus** | One of the three audio channels: `sfx`, `music`, `ui`. Each is muted on its own. |
| **Save slot** | One namespaced `localStorage` record per machine. A `label` in it prints on the cabinet card. |
| **Seam** | A `CFG` callback that lets one game differ from another on the shared driving engine. |
| **Fork** | A game built on the driving engine through seams. Raceway is a fork of the same engine as Highway. |
| **Biome** | One of the driving engine's five worlds: forest, desert, mountain, city, tundra. Each sets weather odds. |
| **League** | Raceway's three circuit classes: sports, GT, formula. Each has its own corner character. |

---

## 5. Functional Specification

### Flows

**F1 — Open the arcade.** The player opens `index.html`. The launcher shows the three shelves and
nothing else. The player taps a shelf and the rack opens. Each cabinet card carries the machine's
name, genre, hook, accent, attract animation, and any saved label. Attract loops run only for the
cards on screen, and they are off in the shelves view.

**F2 — Start a machine.** The player taps a cabinet. The machine's own HTML file loads. The shell
injects a 38-pixel title bar and a pause menu, then fires a `resize` event to tell the game that the
room got smaller.

**F3 — Play a run.** Every machine opens on a title screen with PLAY, OPTIONS, QUIT, and CONTINUE
when a run exists. OPTIONS holds CONTROLS, and CONTROLS is detected per device through
`Arcade.touch`, never asked. The order is title, then any cinematic, then the run.

**F4 — Pause and leave.** The shell pauses by gating `requestAnimationFrame`, so it needs to know
nothing about the game. The pause menu carries SFX and MUSIC toggles and MUTE ALL. QUIT calls
`Arcade.home()`, which reads the machine's `arcade-home` meta tag, so QUIT means one thing
everywhere.

**F5 — Settings.** The cog in the launcher holds the sound toggles, an erase-saved-data option, and
FETCH ALL, which pulls the whole catalog into the cache with a progress bar.

**F6 — Install.** The manifest installs the arcade as TINY ARCADE with the cabinet icon. The shell
puts the name, the icon, and the manifest on every page, so a share from inside a machine still
installs the arcade. `start_url` returns the installed app to the launcher.

**F7 — Play offline.** The service worker registers from the shell, so the launcher and every
machine get it with no per-page setup. Pages and scripts are network-first with a 2.5-second
timeout and fall back to cache. Art, icons, and fonts are served from cache and refreshed in the
background. On a first visit the launcher asks the worker to pull the whole catalog down.

**F8 — Drive (Highway and Raceway).** The garage sets the body, paint, stripes, gearbox, and the
session options. A race starts at a rolling start in second gear. Highway measures the run in miles
against a clock that only checkpoints extend. Raceway measures it in laps, with fuel, tire wear, a
pit lane in the last 9% of the lap, and a minimap.

### Feature priority

**Must** — the shell contract, the catalog, the audio engine, the save layer, the service worker,
and the eighteen shipped machines.

**Should** — the queued driving work in section 10, the shared engine helpers in section 8, and the
title screens that three machines still lack.

**Could** — the Second Wave queue, the two remaining Golden Era control-risk machines, and the kart
racer. Each is a candidate non-goal until it is scheduled.

### States and edge cases

- **No network.** Every flow works. F5's FETCH ALL is the only one that needs a network, and it
  reports what it could not get.
- **A first visit.** The service worker takes control without a page reload. A `hadController` guard
  in the shell prevents the reload loop that a `clients.claim` plus `controllerchange` pair caused.
- **A stale link.** A navigation to a file that no longer exists falls back to the launcher, not to
  the host's 404 page.
- **A machine opened on its own,** with no launcher and no title bar. The three CSS variables have
  standalone defaults, so the machine still runs.
- **A missing attract function.** The card renders black, with no error. This is why section 9 makes
  the attract entry machine-checked.
- **Audio before a gesture.** Browsers refuse sound until the player touches the page.
  `Arcade.audio.init()` is called from a real gesture handler, usually the title screen tap.

### Interface contracts

**The arcade contract.** Every machine must:

- live at `games/<cat>/<id>.html`, self-contained, one file;
- declare `arcade-home`, `arcade-title`, and `arcade-accent` meta tags;
- load `../audio.js` and then `../arcade.js`;
- use `#stage`, positioned absolute with `inset: 0`, wrapped around `#frame`;
- size `#frame` from `var(--stage-h, 100dvh)`, never from raw `100dvh`;
- write top safe-area padding as `var(--safe-top, env(safe-area-inset-top, 0px))`;
- listen for `resize` and fully recompute its layout;
- **never define `--stage-h` or `--safe-top` in its own `:root`.** The shell appends its stylesheet
  during parse, so a later `:root` block wins on source order and silently discards the shell's
  calculation. All four early machines did this, and every frame was 38 pixels taller than the room
  it had.

**The shell surface.** `Arcade.gesture`, `Arcade.pad`, `Arcade.save`, `Arcade.audio`, `Arcade.sfx`,
`Arcade.music`, `Arcade.note`, `Arcade.cinema`, `Arcade.options`, `Arcade.crt`, `Arcade.touch`,
`Arcade.home`, `Arcade.wordmark`. `Arcade.pad` exports `connected, axis, down, onPress, confirm,
cancel` and nothing else. A call to a method that does not exist throws only when a gamepad is
connected, and no test rig here has one, so section 9 makes this a machine-checked item.

**The driving seams.** `CFG.id`, `title`, `curvature`, `grade`, `hudScore`, `onReset`, `onStep`,
`afterDraw`, `titleArt`, `garageButtons`, `garageActions`, `biome`, `roadSpan`, `curveK`,
`circuitOnly`, `logoCool`, `logoHot`. Highway passes almost none of them. **That is the design, not
an oversight.**

### Permissions

None. There is no account, no server, and no permission prompt other than the browser's own install
and audio gestures.

---

## 6. Experience and Interface

**Interaction principles.**

- A thumb lands where it lands. Touch input goes through `Arcade.gesture`, so the whole page steers.
  A 360-pixel canvas target is a fight with the game rather than with the game's hazards.
- The front door only has to open. A title screen is the name and four buttons: no flavor
  paragraph, no legend, no control recap. The game teaches itself.
- One control scheme per machine, not two. A mouse does what a thumb does. A separate keyboard
  scheme made one machine feel like two different games.

**Visual direction.** The arcade reads as one machine, not as eighteen web pages. A fixed scanline
overlay sits above every page with a corner vignette and `pointer-events: none`, and it defers to a
page that brings its own. Each machine gets its own font pairing, subset and self-hosted, and its
own accent. Cabinet art is drawn at runtime; there is no sprite library.

**Content and tone.** A hook reads like cabinet glass. It is concrete, one or two short lines, and
structurally different from its neighbors. Four cards that are each two clauses of one length read
as filler, however good the machines are.

**Accessibility and internationalization.** English only, and no localization is planned. This is a
gap, not a decision, and section 11 records it as an open question.

---

## 7. Technology Discovery

Every entry states the decision, the reason, and what was rejected. Where the decision predates the
standup, the date column says so.

| # | Area | Decision | Reason | Rejected | Date |
|---|---|---|---|---|---|
| 1 | Delivery platform | A static web page, installed as a progressive web app | It runs from a file, from a static host, and from a home screen with the same files | A native app as the primary target | before 2026-08-23 |
| 2 | Language and runtime | Vanilla JavaScript in the browser, no transpiler | No build step is a hard constraint, and a machine must open from `file://` | TypeScript, and any bundler | before 2026-08-23 |
| 3 | Framework | None | The shell is the framework. A dependency would need a build step | React, Svelte, Phaser, and every game engine | before 2026-08-23 |
| 4 | Persistence | `localStorage`, namespaced one slot per machine | Saves must survive with no account and no network. A webview keeps the same behavior | IndexedDB (more capability than the data needs), any server store | before 2026-08-23 |
| 5 | External services | None at runtime | A network call at launch would break the offline promise | Google Fonts, which is why the fonts were brought in-house | 2026-08-20 |
| 6 | Content and assets | Audio synthesized at runtime; art drawn at runtime; fonts self-hosted and subset by `fonts.py`; licenses in `fonts/LICENSES.md` | The whole arcade weighs almost nothing and needs no network | Sampled audio, a sprite library, a font CDN | before 2026-08-23 |
| 7 | Deployment | GitHub Pages from this repository, plus a packaged zip for a drag-and-drop host | The repository is the site. Nothing is built | A hosting service with a build pipeline | before 2026-08-23 |
| 8 | Testing toolchain | Playwright through Python: `tools/drive-test.py` and `tools/smoke-test.py`, both against a local server, neither one touching a game file | A static check cannot tell you the game works. See section 9 | Unit tests against a codebase with no module system | 2026-08-23 |
| 9 | Development environment | A text editor, a local static server, and Python for the two test harnesses | There is nothing to install to run the product | Any package manager | before 2026-08-23 |
| 10 | Version control | git, on GitHub, at `EffigyMedia/tiny_arcade`, public | The repository is also the deployed site | A private repository, which would need a separate deploy path | before 2026-08-23 |
| 11 | Continuous integration | None | The two harnesses run on demand and the product has no build | A pipeline for a product with no build step | 2026-08-23 |

**The never-commit list.** No signing keys, no store credentials, no API keys of any kind (the
product uses none), and no licensed or copyrighted reference material — no sprite rips, no captured
audio, and no artwork from the cabinets that the clones descend from. The font files that ship are
licensed for it and their licenses ship beside them.

**Where the version lives.** `arcade.js` holds `Arcade.version`, and it is the one authoritative
copy. The shell is on every page, so the version is readable from the launcher and from inside any
machine. The git tag mirrors it, and a tag is a record, not a second source.

---

## 8. Architecture

### Modules

| Module | Owns | Must not |
|---|---|---|
| `index.html` | The launcher: shelves, the rack, cabinet cards, the attract `draw` map, settings | hold any list of machines of its own, or any knowledge of one machine's rules |
| `games.js` | The catalog. One entry per machine | hold any code |
| `arcade.js` | The shell: title bar, pause, gestures, gamepad, saves, scanlines, cinema primitives, options, the wordmark, the service worker registration | contain anything specific to one machine or to one shelf |
| `audio.js` | The synthesizer and the three buses, and the mute state in `localStorage` | know what a game is |
| `road.js` | The shared driving engine: the road, the projection, the cars, physics, traffic, police, weather, biomes, laps, the garage, the fleet | know which of its two games is running, except through a `CFG` seam |
| `games/<cat>/<id>.html` | One machine, whole | reach into another machine, or define `--stage-h` or `--safe-top` |
| `sw.js` | The cache policy | decide freshness by a cache name (see below) |
| `assets.js` | The generated cache list and the cache name | be edited by hand |

### Single sources of truth

- **The catalog is `games.js`.** The launcher, the packer, and the cache list all read it.
- **The shell owns the room.** `--stage-h` and `--safe-top` are calculated in one place.
- **The engine owns driving.** Anything in `road.js` is in both driving games automatically.
- **`Arcade.version` in `arcade.js` is the version.**

### Data flow

The launcher reads the catalog and renders the racks. A tap loads a machine's own file. The shell
loads on that page, reads the machine's meta tags, injects the bar, and hands the machine the
`resize`. The machine writes its save through `Arcade.save`; the launcher reads the `label` out of
that slot and prints it on the cabinet card. The service worker sits under all of it.

### Cache freshness, which is a rule and not an implementation detail

There is no cache version to bump for pages and scripts. Freshness comes from a network-first fetch
with a timeout, not from a cache name. The worker fetches with `cache: 'reload'`, because the
browser keeps its own HTTP cache in front of the worker and will otherwise hand it a stale script
that it decided was still fresh. With `reload`, the Cache API is the only cache in play.

### Hard problems

| Problem | State | How it is managed |
|---|---|---|
| A pseudo-3D road cannot draw a corner past about 90 degrees | Settled. The cap is a renderer limit, not a taste one. Past that angle the road leaves the frame | Recorded here and in section 12. Do not re-derive it |
| Corners that are slow enough to matter | **Solved.** The scale constant was the lever, not the geometry, and the slowest point on every lap turned out to be a leftover spline cusp rather than a designed corner | Built. `CURVE_K` is Raceway's own at 0.000040, and curvature is clamped to the tightest hairpin the league asked for. Slowest corner 99 to 123 mph, braking 6.9% to 10.1% |
| The generator can still ask for a corner the renderer cannot draw | Open. The 90-degree limit is a fact about the projection; nothing clamps the generator to it | Sweep cap, one clamp. Tracked |
| A 914-line `step()` function, a 634-line `paintCar()`, and a 585-line `zUnlocked()` | Known. They accreted | A refactor is not scheduled. The harness comes first, and it now exists |
| The painters look repetitive and are not | Settled. Each body's proportions were tuned against screenshots over many sessions | **Do not collapse them into one parameterized painter.** The duplication is the record of the tuning |
| `paintProfile` and `paintQuarter` are unbuilt | Deliberate. They are for a kart racer | Do not delete them as dead code |
| The seam contract fills in two stages | Settled, and it has bitten three times. `onReset` fires during setup, before `ROAD()` returns, so anything a seam might touch is attached at the top of the function | Recorded in the source at the definition and here |

### Tunables

Per-car figures (top speed, pull, grip, braking, horsepower, mass, gear bands) live in the engine's
car table. Weather odds live per biome. Tire compounds are defined in `COMPOUNDS`. The pit window is
the last 9% of the lap. Slipstream is 4.5% inside 3,600 units in the same lane above 55% of top
speed. **`COMPOUNDS` is defined and not connected to `cornerG`** — section 10 carries it as a slice.

### Cross-cutting targets

- Zero console errors across load, play, pause, death, and restart.
- Nothing leaves the device, ever.
- The arcade works with no network, from the launcher and from inside any machine.
- 60 frames per second on a mid-range phone.

---

## 9. Quality and Performance Strategy

### The rule this section exists for

**A static check cannot tell you the game works.** The packer checks that files parse, that scripts
resolve, and that the catalog matches. It has passed while it shipped a syntax error, a missing
file, and two machines that booted to a black screen. A green build is not evidence.

### Test types

| Harness | Scope | What it asserts |
|---|---|---|
| `tools/smoke-test.py` | All eighteen machines | The machine boots, the console is clean, and the canvas has paint on it. A black screen has a canvas too |
| `tools/drive-test.py` | Highway and Raceway | Boots both, drives 30 seconds with an autopilot, and asserts speed, lap count, fuel, tires, damage, the HUD, and page errors |
| The packer (`pack.sh`) | The distributable | The whitelist, the catalog against the shipped files, the shell contract items below. **The script is absent from the repository.** See section 11 |

Both harnesses run against a local server and modify no game file. The autopilot reads the engine
through three read-only getters on the API surface: `playerX`, `dmg`, and `traffic`.

**Measure with a steady driver before you believe a number the driver can influence.** An early
harness run reported that Raceway tires died in 20 seconds. The autopilot was sawing the wheel, and
lateral load is what wears tires. Smoothed, wear is about 36% per lap.

**When a check fails identically everywhere, suspect the check.** A scan once flagged every
object-method shorthand in the codebase. A selector once reported the pause button missing from all
four machines. A test that looked for one implementation of scanlines reported the only page that
had them as the page without them. **Test for the effect, not for your own implementation of it.**

### The machine-checked list for a new machine

The packer enforces these and refuses to build otherwise:

- No call to a shell method that does not exist.
- The `arcade-home`, `arcade-title`, and `arcade-accent` meta tags.
- It loads `audio.js` and `arcade.js`.
- A title screen with PLAY, OPTIONS, and QUIT, plus CONTINUE when it saves.
- A CONTROLS page, detected per device.
- A music bed, sound effects, and a best score.
- Music routed to `bus: 'music'`.
- An `attract` field whose function exists in the `draw` map in `index.html`.

### The list a machine cannot check

- **The mix.** Music sits under the effects. Measure both buses. A bed at 0.02 RMS is inaudible on a
  phone, and one that matches the effects drowns them. Beds land between 0.03 and 0.06.
- **The bed reacts to play.** A loop that never changes is wallpaper.
- **The attract card matches the machine it advertises.** Cards go stale when a machine is reskinned
  and the card is not. **Reskin a machine and update its card in the same unit of work.**
- **It fits every screen,** from 320x568 through 430x932.
- **Pause, resume, and EXIT TO ARCADE all work from mid-game.**
- **Zero console errors across a few minutes of play.**

### Performance targets

| Target | Metric | Threshold | Workload |
|---|---|---|---|
| Frame rate | frames per second | 60, sustained | A mid-range phone, any machine, a full run |
| Launch | network requests before the launcher is usable | 0 | A cold load with the network disabled |
| Corner discipline (Raceway) | brake time as a share of one lap | 7% to 12% | a generated circuit per league |
| Slowest corner (Raceway) | speed at the slowest point of a lap | 95 to 125 mph | a generated circuit per league |
| Tire life (Raceway) | wear per lap with a steady driver | 35% to 40% | `drive-test.py`, smoothed autopilot |
| Fuel range (Raceway) | fuel per lap with a steady driver | 3 to 4.5 laps per tank | `drive-test.py`, smoothed autopilot |

**Measured 2026-08-23.** Frame rate and launch hold. Tire life is 37% a lap and fuel 25% a lap
(about 2.7 and 4.1 laps) — both confirmed by `drive-test.py`, independently of the frozen log that
first claimed them.

**The two corner rows are recorded from the frozen log and cannot yet be re-measured here.** Its
figures are 99, 102 and 123 mph at the slowest corner and 6.9%, 10.1% and 7.7% braking for CUP, GT
and GP. `drive-test.py` reports neither number, so the thresholds above are written from one
measurement that no command in this repository can repeat. **That gap is tracked, and until it
closes these two rows are a claim rather than a check.**

**The 15% braking target was dropped, deliberately.** It was written into the first version of this
document from a note that predated the corner work. The circuits measure 7% to 10% and drive as
circuits, so the number to hold is the one the game actually produces, not the one an older note
aimed at.

### Security and privacy

Nothing leaves the device. There is no account, no server, no analytics, and no third-party script.
The threat model at this tier is the player's own browser and nothing else.

---

## 10. Delivery Plan

The product is past its walking skeleton. Eighteen machines ship, and the process adopts the
codebase at v0.9.0. The slices below are ordered by dependency, not by size, and they carry the
order the frozen ancestors set on 2026-08-23.

**WHAT THE STANDUP GOT WRONG HERE, AND WHY IT IS WORTH SAYING.** The first version of this section
listed eight slices in dependency order. **Four of them were already built** — the corner work,
qualifying, sector times and the live delta, and the per-biome skyline — and the plan was written
from `DRIVING.md` and `START-HERE.md` without noticing that the top of `DESIGN.md` is newer than
both. Corrected 2026-08-24 against the code. Section 0 carries the rule that prevents the repeat.

**What is built, so it is not re-planned:** the corners (slowest 99 to 123 mph, braking 6.9% to
10.1%), qualifying and the grid it feeds, sector times with a live delta, the per-biome skyline, the
grid title screen, the fuel and tire re-tune that followed the corner work, and the billboard car
angles.

### The slices, in dependency order

**Slice 1 — Curate the seeded circuits.** *Promoted to first, and the reason is the strongest
argument in the frozen log.* The generator is already deterministic — a track is a number — and a
curation trial over 120 seeds passed 118. What ships is still a fresh random circuit every race.
**Everything built in the last two passes quietly depends on this**: sector bests, the live delta,
qualifying and lap records are all about improving on a track you know, and a lap record on a
circuit you will never see again is meaningless. Procedural generation is undermining the features
built on top of it.

**Slice 2 — The end card shows the session.** The game records qualifying, sector bests, lap times
and grid position, then throws all of it away. The highest value per hour on the list, because the
data already exists and the work is display.

**Slice 3 — Tire compounds into `cornerG`.** `COMPOUNDS` defines 1.10, 1.00 and 0.92 and nothing
reads it. It was blocked while every lap was flat out; the corners are built now, so an 18% grip
difference is finally observable. One line turns a cosmetic choice into a strategic one.

**Slice 4 — The start line and the lights.** Half of it exists on the wrong screen: the title art is
the start grid with a gantry running five reds. The race has no line and no start sequence.

**Slice 5 — Pit road art.** Fuel and tires are real and decide races. The pit lane is a speed zone
with no picture.

**Slice 6 — Flags and lapped traffic.** Cheap, and they make a race feel officiated rather than
simulated.

**Slice 7 — Cap corner sweep at 90 degrees.** One clamp, so the generator never asks the renderer
for a corner it cannot express.

### Two measurement debts, ahead of any of it

**`drive-test.py` reports neither brake share nor slowest cornering speed**, so section 9's two
corner rows cannot be re-measured — they rest on one reading in a frozen document. And **the bend
fix was never verified in view**: the road rendered dead straight on every circuit, `CFG.roadSpan()`
fixed it, and no screenshot has ever shown a bent road because the probe that would jump the car to
a corner did not move it. Both are tracked. Neither is large, and both make everything after them
checkable rather than claimed.

**Later, in no fixed order:** the garage split into a car screen and a session screen; the weather
and compound options that exist in code with no interface; a championship across circuits; a
track-limits penalty; tunnels as a z-range effect, then bridges; a real Raceway wordmark, since the
title scene was rebuilt and the wordmark is still Highway's; finishing the billboard angle tuning;
the shared engine helpers (`Arcade.grid`, `Arcade.fx`, `Arcade.scores`, `Arcade.haptics`,
`Arcade.sticks`, `Arcade.tilt`); landscape support in the shell; the attract-loop kit; title screens
for Penboy, Highway and Deep; and `Arcade.cinema.play` as a shell convention.

**The queues.** Nine Golden Era machines remain unbuilt, and the Second Wave shelf holds a queue of
twenty-four. Neither queue is scheduled. Each entry is written to be picked up cold.

**Definition of done per slice.** The change is implemented, both harnesses pass, the fragment moves
to built, the changelog has an entry, the patch version is bumped, and the unit is committed.

**Release criteria for 1.0.** Every success criterion in section 2 holds. Both harnesses pass on all
eighteen machines. The commercial shelf split is decided and built. A license file ships. A wrapped
build is tested on a real device.

---

## 11. Risks, Assumptions and Open Questions

### Risks

| Risk | Mitigation |
|---|---|
| **A rights holder objects to a clone.** The risk is real, not theoretical, and it is highest for the falling-block machine | Sell the Originals, keep the clones free. The `cat` field already lets a build drop a shelf. Do it before release, not after a complaint |
| **`pack.sh` is absent from the repository** and never existed in it. It is the build, the whitelist, and the enforcement of the machine-checked list, and it generates `assets.js` | Section 10 carries its reconstruction. Until then no new machine can enter the offline cache list, because the file that holds it says "generated by pack.sh - do not edit" |
| **`sync.sh` no longer matches how the project works.** It clones the remote to a temporary folder and copies files over the top, because the working folder was not a repository. The working folder is now this repository | Retire it, or rewrite it as a deploy step. It is tracked |
| A refactor of the engine has far more surface than the three broken builds that already shipped | The harness argued for in the frozen `REFACTOR.md` now exists. No refactor is scheduled before it is trusted |
| An attract card advertises art the machine no longer has | The rule in section 9: reskin a machine and update its card in the same unit of work |

### Assumptions

| Assumption | How we would find out |
|---|---|
| A webview behaves like the browser for audio autoplay and safe-area insets | Test a wrapped build on a real device. Not yet done |
| The five unverified driving features work in play, not only in a probe | Play them, or extend `drive-test.py` |
| 60 frames per second holds on a mid-range phone across all eighteen machines | Measure on a real device. The harness runs on a desktop |

### Open questions

| Question | Who decides | When it matters |
|---|---|---|
| The `sw` shelf renders as "SECOND WAVE" in the launcher, and the owner named it "Second Wind" when the shelf question was ruled on. Is the label renamed? | Owner | Before the next machine joins that shelf |
| Does a root `README.md` come back for the public repository? The process permits one Markdown file at the root, and it is `CLAUDE.md` | Owner | Whenever the repository's front page matters |
| Is there any localization target, or is English-only a decided non-goal? | Owner | Before a store submission |
| Which store comes first: itch.io, Steam through a desktop wrapper, or the mobile stores? | Owner | Before any wrapping work starts |

---

## 12. Decision Log

Entries are newest first. An entry with "before 2026-08-23" carries a decision recovered from the
frozen ancestors, where the source records no date.

- **The fragment store and the delivery plan were seeded from stale documents, and are corrected
  against the code** — `DESIGN.md` is a reverse-order log that kept being appended after `DRIVING.md`
  and `START-HERE.md` were written, so its top entries are the newest thing in the repository. Four
  items were queued that had already shipped: the corner work, qualifying, sector times, and the
  per-biome skyline — *the rule that follows is in section 0: when the frozen documents disagree,
  the top of `DESIGN.md` is newest and the code is the truth* — 2026-08-24.
- **The 15% braking target is dropped in favor of the 7% to 12% the circuits actually produce** —
  the higher figure came from a note written before the corner work, and a target nothing has ever
  met is a target nobody reads — 2026-08-24.
- **Highway and Raceway are `sw` shelf cabinets, and the design note that calls Highway an Effigy
  Original is stale** — owner ruling: "It's a Second Wind cabinet now." The shelf grew into the
  driving floor, so the catalog is right and the note is out of date — *the consequence: a
  commercial build that omits the clone shelves omits these two as well* — 2026-08-23.
- **The project adopts the Code Continuum process at v0.9.0, not at 0.0.0** — the codebase already
  ships eighteen machines, and a version that says 0.0.0 would be a false statement about maturity —
  *rejected: 0.0.0 by a literal reading of bootstrap; 1.0.0, which would declare a release that has
  not happened* — 2026-08-23.
- **The work record is the fragment store, not a hand-maintained tracker** — the store is the live
  system in this environment, and a new project carries no migration debt — *rejected: a classic
  `tracker.md`, which is the format the environment moves off* — 2026-08-23.
- **This document is written by distillation from the frozen ancestors, not by a fresh design
  interview** — the decisions already exist and are recorded; an interview would relitigate them —
  *rejected: a skeleton document that points at a 277-kilobyte log; a full interview* — 2026-08-23.
- **`Arcade.version` in `arcade.js` is the one authoritative version** — the shell loads on every
  page, so the version is visible from anywhere in the product, and there is no `package.json` to
  hold it — *rejected: a `VERSION` file at the root, which nothing in the product reads* —
  2026-08-23.
- **The six pre-standup documents are frozen and moved to `docs/reference/`** — they are the record
  of how the arcade got here, and a document that looks live and is not is worse than no document —
  2026-08-23.
- **The harness comes before any refactor of `road.js`** — the session that argued for a refactor
  shipped three broken builds, and every one passed the checks that existed — *rejected: a refactor
  first, on the argument that structure was the problem* — 2026-08-23.
- **One control scheme per machine, not two** — a keyboard-shaped alternative to a point-at-a-tile
  game made it two games with two feels; a mouse does what a thumb does — 2026-08-23.
- **Godot is the wrong wrapper** — it exports to HTML rather than hosting it, so it would mean an
  embedded browser it does not ship — *rejected in favor of Capacitor for mobile and Tauri for
  desktop, neither built yet* — 2026-08-20.
- **Sell the Originals and keep the clones free** — a rights holder objects to the copy, not to the
  wrapper, so a bundle does not protect a clone; free clones cannot be leveraged into a claim for
  damages the way a sale can — 2026-08-20.
- **Nothing clone-specific enters the shared layer** — the moment shelf-specific code reaches
  `arcade.js`, `audio.js`, or the launcher, dropping a shelf stops being a one-line change —
  2026-08-20.
- **The fonts are self-hosted and subset in-house** — a wrapped application cannot depend on a font
  host at launch — 2026-08-20.
- **Freshness comes from a network-first fetch, not from a cache version** — a cache name that must
  be bumped by hand is a step that gets missed — *the exception is the asset list, which is
  generated* — before 2026-08-23.
- **The packer builds from a whitelist, not from the folder** — four instrumented debug builds once
  reached the public zip because cleanup was tacked onto the end of shell lines that sometimes never
  ran. A whitelist cannot fail that way — before 2026-08-23.
- **The corner cap in the driving engine is a renderer limit** — past about 90 degrees the road
  leaves the frame. It is not a taste decision and it is not tunable — before 2026-08-23.
- **Curvature depends on radius and nothing else:** `k = 1 / (R * CURVE_K)`. Several days of work
  went into the rediscovery of this — before 2026-08-23.
- **The car painters stay duplicated** — each body's proportions were tuned against screenshots over
  many sessions, and one parameterized painter would be elegant and would lose the tuning —
  before 2026-08-23.
- **`paintProfile` and `paintQuarter` stay in the code although nothing calls them** — they are the
  groundwork for a kart racer — before 2026-08-23.
- **One driving engine, two games, joined by named seams** — the two games were 96.5% identical, and
  every fix had to be applied twice — before 2026-08-23.
- **A machine is one self-contained HTML file** — it is what makes a new game a drop-in rather than
  a project — before 2026-08-23.
- **Every sound is synthesized at runtime** — the arcade weighs almost nothing and needs no network
  — before 2026-08-23.
- **Saves are local and namespaced per machine, and a `label` prints on the cabinet card** — high
  scores belong on the arcade floor — before 2026-08-23.
- **Pause works by a gate on `requestAnimationFrame`** — the shell then needs to know nothing about
  a machine's internals, and a turn-based machine gets pause for free — before 2026-08-23.

---

## 13. Implementation Readiness Checklist

- [x] The pitch, the success criteria, and the non-goals exist and agree with each other.
- [x] Every flow in section 5 has its states and edge cases.
- [x] Every technology appears in section 7 with a reason.
- [x] The never-commit list exists.
- [x] Module boundaries exist and no two modules own one concern.
- [x] Every performance target has a metric, a threshold, and a workload.
- [x] The first slice is defined tightly enough to build with no further question.
- [x] Every open question is resolved into section 12 or parked in section 11.
- [x] No section is skipped without a reason.
- [ ] **The owner has read section 3's non-goals and section 12's decision log and agrees they are
      right.** This is the one open box, and it is open because this document was reconstructed
      rather than interviewed.

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **Clean room** | A take on a published game that copies no presentation: no sprite shapes, no palette, no layout, no name. |
| **PWA** | Progressive web app. A web page that installs to a home screen and runs offline. |
| **Attract loop** | The idle animation an arcade cabinet plays when nobody is at it. |
| **Seam** | See section 4. A callback that lets one game differ from another on one engine. |
| **Walking skeleton** | The smallest end-to-end build that proves the riskiest assumption. Tiny Arcade is past it. |

---

## 15. Change Log

- **[1.0 — 2026-08-23]** — First version. Written at the Code Continuum standup by distillation from
  `docs/reference/DESIGN.md`, `DRIVING.md`, `REFACTOR.md`, `README.md`, `SHIPPING.md`,
  `START-HERE.md`, from `games.js`, and from the source. No decision in it is new except the four
  standup decisions dated 2026-08-23 at the top of section 12.
