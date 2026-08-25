# Handoff — 2026-08-25 — the successor project

Written immediately before a context clear, at the owner's request. **This is not a milestone**
(the environment retired those); it is a handoff, and its job is to let the next session open the
migration discussion with the full picture instead of from nothing.

## Where Tiny Arcade stands

`v0.9.10`, clean tree, pushed, `github.com/EffigyMedia/tiny_arcade`, live at
`https://effigymedia.github.io/tiny_arcade/`.

The first audit (`docs/audits/audit_260824_225019.md`) was run and then fully remediated across
v0.9.5–v0.9.10: fourteen findings fixed, one deferred to the owner (`RLG-057`, the Tetris-Guideline
features in Soviet Blocks), and one — AUD-001 — **downgraded and its central claim withdrawn** when
the fix disproved it. Read that correction before trusting anything else in the report.

Gates green at the time of writing: build gate, 19/19 smoke (18 cabinets + the launcher flow),
21/21 drive.

## What the owner has decided

- **A new product, in a new repository.** Not a branch of this one, and not a v2 of this design
  document. The premise changes: Tiny Arcade is *eighteen small machines on three shelves, each a
  drop-in*; the successor is **four deep games behind one launcher**.
- **The four:** Derelict, Highway, Raceway, and a Doom-descended shooter that does not exist yet.
- **Each game is split out into its own standalone binary wrapper when it is finished.** The
  launcher is where they live during development, not necessarily where they ship.
- **GitHub Pages, public, while the work is in progress.** The Cloudflare/private question stays
  parked (`RLG-043`) rather than being forced now.
- **Tiny Arcade is parked, not abandoned.** It keeps its repository, keeps its Pages site, keeps
  serving. Development stops. Moving it to `Projects/Parked/` is the mechanical part and has not
  been done yet.

## Still open — ask, do not assume

1. **The name.** "Tiny Arcade" signals *small*, and four substantial games are not that. The
   successor needs its own identity before its repository is created, because the repository name
   should match the project name (`Project_Identity.md`).
2. **Is it meant to be sold?** This decides the licence, the hosting question, and item 3.
3. **The Doom clone against the commercial posture.** It is the only one of the four that descends
   from a property its owner actively licenses and monetises today. The standing posture
   (`RLG-023`) is *sell the Originals, keep the clones free*. If the successor is the sellable one,
   this game breaks that rule and the way out is a decision, not a workaround.

## What migrates, and one thing already half-built

Carry over: `arcade.js` (the shell), `audio.js`, `fonts/` and its licences, both Playwright
harnesses, `pack.sh`, and `road.js` — which **is** Highway and Raceway, 9,849 lines serving both
through a `CFG` seam.

**Copy it and let it diverge. Do not build a sharing mechanism between the two repositories.** Tiny
Arcade is frozen, so there is no two-way drift to manage, and the house rule is to build the shared
thing when the second caller genuinely arrives.

**`pack.sh --standalone <id>` already does most of what the owner described.** It emits ONE
self-contained HTML file with every `<script src>` inlined — including the fix for the literal
`</script>` inside `arcade.js` and `audio.js`, which had booted a standalone to a black screen.
That is precisely the "split it out on its own" step; the binary wrapper around it is Capacitor or
Tauri, both already assessed in the frozen `SHIPPING.md`. **The successor should keep that command
working from day one rather than rediscovering it.**

What does **not** carry: the three-shelf structure, the eighteen-entry catalogue, and the "a game is
one self-contained file" rule — which the Doom-descended game will break the moment it needs level
data. The successor's design document has to answer that rather than inherit it.

## The trap this project has already paid for twice

Its own frozen documents disagree with each other by age, and the code settles it. The successor
starts clean; keep it that way by writing decisions down when they are made, not afterwards.

## Instruction correction owed

This project's `CLAUDE.md` still lists **"Perform milestone"** as a trigger phrase, inherited from
the project template. **The environment retired milestones.** Correct it when the file is next
touched, and do not carry the trigger into the successor's `CLAUDE.md`.
