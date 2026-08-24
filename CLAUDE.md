# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What this is

**Tiny Arcade** — **an arcade cabinet that lives in a browser tab**: eighteen small games on three
shelves, offline, with no server, no build step, and no network call at launch. Built in **vanilla
JavaScript** with **no framework and no dependency**, targeting **the browser as an installed
progressive web app**, portrait first, phone and tablet and desktop alike.

Load-bearing product stances, because they decide arguments: **nothing is downloaded to play** (all
audio is synthesized at runtime, all fonts are self-hosted, all art is drawn at runtime);
**nothing leaves the device** (saves are local, there is no account and no analytics); and
**nothing clone-specific enters the shared layer**, so a commercial build can drop a whole shelf
with a one-line change.

This project runs a documentation-driven **development process**, read in place from the shared
process docs (never copied here, never edited from project work):

Process docs: `<env-root>/Process/`;
starter blanks: `<env-root>/Templates/_Project_Template/`

> **`<env-root>` is the directory that holds `.code-continuum-env-root`.** To find it, go up from
> here, parent by parent, until you find that file. Never write a drive-letter path in this file —
> see `Path_Policy.md`.

- `docs/core/tiny_arcade_design.md` *(project-local)* — the founding spec: vision, the shell
  contract, architecture, the Decision Log, and the delivery plan. **The source of *what* to
  build.** Keep it living — code and docs must never disagree. **It is a reconstruction**, written
  at the standup on 2026-08-23 from the documents that came before; its section 0 says so.
- `docs/reference/` *(project-local)* — the six documents written before the standup, **frozen**.
  `DESIGN.md` (the full decision log, newest first, 277 KB — search it, never read it end to end),
  `DRIVING.md` (what is built in the two driving games and what is not), `REFACTOR.md` (the state of
  `road.js` and what is load-bearing but invisible), `README.md`, `SHIPPING.md`, `START-HERE.md`.
  **Read them for reasoning; never add to them.**
- `Development_Process.md` — the operating manual: bootstrap, the feature loop, milestones,
  handoffs, releases, the trigger phrases below. **The source of *how*.**
- `Artifact_Formats.md` — formats for the tracker, `changelog.md`, handoffs, technical references.
- `Performance_Testing.md` / `Audit_and_Testing.md` — perf practice; the audit workflow.
- `Path_Policy.md` — how anything names a location. **This file carries no absolute path.**
- `Agent_Scope.md` — how far a session may reach. This is a **project** session.
- `Writing_Standard.md` — Simplified Technical English (ASD-STE100), American spelling. **All
  output is written in STE** — chat, every project document, source-code comments, and commit
  messages. Identifiers and code syntax are exempt. **The existing source and the frozen ancestors
  use British spelling; do not rewrite them, and do not copy it into new prose.**
- `docs/core/Instruction_Changelog.md` *(project-local)* — dated log of amendments to *how this
  project works*. A documented project amendment **wins** over the shared docs on conflict.
- **The work record is the fragment store** in `docs/fragments/`, written with
  `<env-root>/Commands/fragment.py` and never by hand. **This project keeps no `tracker.md`** — the
  view over the store is the dashboard, opened by `Dashboard.bat` / `dashboard.sh` at the root. The
  reason is in the instruction log: `Commands/tracker.py` writes a header that describes the
  environment's own store, whatever store it is pointed at.
- Core artifacts in `docs/core/`; handoffs, technical references, performance and audit documents in
  their `docs/` subfolders. **This file is the only Markdown file at the repository root.**
- **Shared Knowledge Base** — `<env-root>/Process/Knowledge_Base/`: consult it for browser, PWA and
  Playwright gotchas before stack-specific work, and **append** new lessons there.
- **Model routing** — `<env-root>/Process/Model_Routing.md`.
- **Routing posture** — `ROUTING_BIAS: 2` (quality). The product is intended for sale, the clone
  posture has money attached to it, and a defect in the 9,849-line driving engine ships to two games
  at once. Drop to efficiency only for mechanical churn.

## Trigger phrases

Summaries — the canonical procedures live in `<env-root>/Process/Development_Process.md`.

| Phrase | Meaning |
|---|---|
| **Initialize** | First run on a fresh project. *(Done: adopted at v0.9.0 on 2026-08-23. The codebase predates the process.)* |
| *(normal work)* | Feature loop: implement → `test` → fragment → changelog → **patch** bump → commit. One feature = one commit = one patch = one changelog entry = one fragment to built. |
| **Track this: …** | Write a new `RLG-NNN` fragment with status `requested`; do not start it. |
| **Perform milestone** | File audit; reconcile the store; run both harnesses; produce the distributable, or record exactly what is missing; write a timestamped handoff in `docs/milestones/`; bump **minor**; tag; push. Pace by context: suggest one at about 800k tokens on a 1M window. |
| **Handoff** | New session after a context clear — read the latest `docs/milestones/milestone_*.md`; reconstruct what shipped since from `changelog.md` and the store; **verify the working tree is clean**; resume. |
| **Perform audit** | Run `Audit_and_Testing.md`; produce a findings report; change no code. |

## Commands

There is **no toolchain to resolve and nothing to install to run the product**. It is a static site.
Python 3 with Playwright installed runs the two test harnesses; a browser runs everything else.

- `run` — serve the folder and open it: `python -m http.server 8000`, then `http://localhost:8000`.
  `index.html` also opens straight from the file system. **Neither is an on-target check** — a
  desktop browser does not verify phone layout, webview audio, or feel.
- `test` — `python tools/smoke-test.py` boots all eighteen machines and asserts a clean console and
  paint on the canvas. `python tools/drive-test.py` drives Highway and Raceway for 30 seconds with
  an autopilot and asserts speed, laps, fuel, tires, damage, the HUD, and page errors. **Run both
  before shipping anything.**
- `build` — `./pack.sh`. **The script is absent from this repository and never existed in it.**
  It is the whitelist build, the enforcement of the machine-checked list, and the generator of
  `assets.js`. Until it is rebuilt, the offline cache list cannot be regenerated. Tracked.
- `doctor` — **does not exist yet.** Tracked.
- `deploy` — `./sync.sh "message"`. **Obsolete in its current form**: it clones the remote to a
  temporary folder and copies files over the top, because the working folder used to not be a
  repository. This folder *is* the repository now. Tracked.

## Architecture (the load-bearing boundaries)

- **`index.html`** — the launcher: shelves, the rack, cabinet cards, the attract `draw` map,
  settings; **must not** hold any list of machines of its own, or any knowledge of one machine's
  rules.
- **`games.js`** — the catalog, one entry per machine; **must not** hold any code.
- **`arcade.js`** — the shell: title bar, pause, `gesture`, `pad`, `save`, `crt`, `cinema`,
  `options`, `home`, `wordmark`, and the service worker registration; **must not** contain anything
  specific to one machine or to one shelf.
- **`audio.js`** — the synthesizer and the three buses (`sfx`, `music`, `ui`) with the mute state;
  **must not** know what a game is.
- **`road.js`** — the shared driving engine, 9,849 lines, serving Highway and Raceway; **must not**
  know which of its two games is running, except through a `CFG` seam.
- **`games/<cat>/<id>.html`** — one machine, whole; **must not** reach into another machine, or
  define `--stage-h` or `--safe-top`.
- **`sw.js`** / **`assets.js`** — the cache policy, and the generated cache list. `assets.js` is
  generated; **never edit it by hand.**

**Single sources of truth.** The catalog is `games.js`. The shell owns the room (`--stage-h`,
`--safe-top`). The engine owns driving — anything in `road.js` is in both driving games
automatically. **`Arcade.version` in `arcade.js` is the version**, and the git tag mirrors it.

## Conventions that bite if ignored

- **Chat output is terse by default; records are not.** Telegraphic style is fine in conversation.
  **Exempt: commit messages, fragment bodies, changelog entries, and every document** — those are
  the permanent record and keep full deliberate prose.
- **Write every output in Simplified Technical English, American spelling.** The rules live in
  `Process/Writing_Standard.md`.
- **A static check cannot tell you the game works.** The packer has passed while it shipped a syntax
  error, a missing file, and two machines that booted to a black screen. **A green build is not
  evidence.** Run the harnesses, and check the artifact rather than the source.
- **When a check fails identically everywhere, suspect the check.** A scan once flagged every
  object-method shorthand; a selector once reported the pause button missing from all four machines;
  a test that looked for one implementation of scanlines reported the only page that had them as the
  page without them. **Test for the effect, not for your own implementation of it.**
- **Do not believe a number the driver can influence.** A harness run once reported that Raceway
  tires died in 20 seconds. The autopilot was sawing the wheel, and lateral load is what wears
  tires. Measure with a steady driver.
- **A machine must never define `--stage-h` or `--safe-top` in its own `:root`.** The shell appends
  its stylesheet during parse, so a later `:root` wins on source order and silently discards the
  shell's calculation. Use the fallback form at the point of use.
- **The launcher keeps its styles in one `<style>` block, and a stray `}` closes it early** and
  silently kills every rule below it — no error, no warning. If layout goes strange after an edit,
  check the brace balance before anything else.
- **Reskin a machine and update its attract card in the same unit of work.** Cards go stale
  otherwise, and the rack advertises art the cabinet no longer has.
- **An `attract` name with no entry in the `draw` map renders a black card, with no error.**
- **Never splice a function by a search for `var draw`.** A cut to "the next `var draw =`" once
  matched the last one in the file and deleted eight attract functions at once. Splice on the
  function's own closing brace.
- **A variable font `@font-face` is silently refused when the declared weight range excludes what is
  asked for**, and the declared range must match the file's real axes. Check with
  `TTFont(f)['fvar'].axes`. **Do not measure text width to test this** — `document.fonts` status or
  a screenshot is the ground truth.
- **The seam contract fills in two stages.** Anything a seam might touch is attached at the top of
  `ROAD()`, because `onReset` fires during setup, before the function returns. This has bitten three
  times.
- **Do not collapse the car painters, and do not delete `paintProfile` or `paintQuarter`.** The
  duplication is the record of tuning against screenshots; the two unused painters are groundwork
  for a kart racer.
- **The corner cap in the driving engine is a renderer limit, not a taste one.** Past about 90
  degrees the road leaves the frame.
- **Changes the tooling cannot observe need the owner's verdict on a real device.** Rendering,
  audio mix, on-device layout, and feel are not verified by a green harness run. Say so plainly.
- **Every tunable lives in configuration with a committed default** — never an edited-in-place code
  constant.
- **Commits are authored as the project owner** — no AI identity, no co-author trailer. One unit of
  work is one commit. The remote is `origin`, `github.com/EffigyMedia/tiny_arcade`, **public**, and
  it is also the deployed GitHub Pages site.
- **Never commit** (see `.gitignore`): the packaged zip, anything matching the scratch pattern `_*`
  (four instrumented debug builds once reached a public release that way), the generated dashboard
  and fragment index, and **any licensed or copyrighted reference material** — no sprite rips, no
  captured audio, and no artwork from the cabinets that the clones descend from. The product uses no
  keys, tokens, or credentials of any kind; if that ever changes, they go nowhere near this
  repository.
