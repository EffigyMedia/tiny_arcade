# Changelog

The append-only index of what shipped and when, keyed to version. One short dated entry per feature
commit. Newest on top. **An entry is never edited after the fact.**

Each entry links to the fragment that holds the full record. This project keeps no `tracker.md`, so
a link points at the fragment file itself: `[RLG-018](../fragments/RLG-018.md)`. Both directions
must resolve, and that is verified at every milestone.

The history before this file begins is in the git log: 220 commits, made before the project entered
the development process. See `docs/core/tiny_arcade_design.md` section 0.

---

<a id="v0-9-8"></a>
## [0.9.8] — 2026-08-24 23:29:18
- Changed: Phalanx's title card draws the game's own medusa, crab and louse instead of the generic
  pixel space-invader, which the clone posture forbids ([RLG-054](../fragments/RLG-054.md)).

<a id="v0-9-7"></a>
## [0.9.7] — 2026-08-24 23:27:32
- Fixed: Swarm and Aegis ran easier on high-refresh screens — their spawn odds were proportional to
  dt squared ([RLG-053](../fragments/RLG-053.md)).
- Fixed: pausing Ribbit while riding a pad could drown you on resume ([RLG-053](../fragments/RLG-053.md)).
- Fixed: Burrow's fire-breathing drake was built and unreachable; it spawns from level 3
  ([RLG-053](../fragments/RLG-053.md)).
- Fixed: Coil's turn buffer kept the wrong turn of a fast double ([RLG-053](../fragments/RLG-053.md)).
- Fixed: Popshot could serve a colour no longer on the board ([RLG-053](../fragments/RLG-053.md)).

<a id="v0-9-6"></a>
## [0.9.6] — 2026-08-24 23:24:45
- Fixed: **Aegis could not be played on a keyboard or a gamepad at all** — it has a driven
  crosshair now ([RLG-051](../fragments/RLG-051.md)).
- Fixed: Vector's gamepad could fire but never turn or thrust ([RLG-051](../fragments/RLG-051.md)).
- Changed: Burrow's pad holds the pump instead of toggling it ([RLG-051](../fragments/RLG-051.md)).
- Added: `Arcade.menu` — a keyboard and gamepad cursor for every cabinet's menus, so OPTIONS,
  CONTROLS and QUIT stop being pointer-only ([RLG-052](../fragments/RLG-052.md)).
- Changed: a `pad.onPress` subscriber can swallow a press by returning `true`
  ([RLG-052](../fragments/RLG-052.md)).

<a id="v0-9-5"></a>
## [0.9.5] — 2026-08-24 23:18:57
- Fixed: a dead click handler answered every cabinet tap alongside the live one, playing a second
  coin jingle and scheduling a navigation to `null` ([RLG-050](../fragments/RLG-050.md)).
- Added: `smoke-test.py` opens the launcher, opens a shelf and taps a cabinet — the Must-flow that
  had no coverage — and asserts one tap schedules one launch ([RLG-050](../fragments/RLG-050.md)).
- Fixed: launching a cabinet with the space key also scrolled the rack ([RLG-050](../fragments/RLG-050.md)).

<a id="v0-9-4"></a>
## [0.9.4] — 2026-08-24 22:27:01
- Fixed: a wrong address under the site now opens the arcade instead of a host 404 page. Every
  cabinet link shared before the games moved into shelf folders was dead
  ([RLG-049](../fragments/RLG-049.md)).
- Added: `404.html`, which computes the way home rather than hardcoding it, so it names no
  repository and is already correct on a host that serves at the root
  ([RLG-049](../fragments/RLG-049.md)).
- Added: `.nojekyll`, so GitHub Pages never runs the site through Jekyll
  ([RLG-049](../fragments/RLG-049.md)).

<a id="v0-9-3"></a>
## [0.9.3] — 2026-08-23 23:57:56
- Added: `tools/harness.py` — what the two test harnesses need from the machine they run on: a
  browser that exists, a `node` that resolves, and a console that takes the characters they print
  ([RLG-042](../fragments/RLG-042.md)).
- Fixed: `subprocess` could not find `node` on Windows — CreateProcess does not apply PATHEXT, so a
  bare `node` misses `node.cmd` and `node.exe` ([RLG-042](../fragments/RLG-042.md)).
- Fixed: the reports raised `UnicodeEncodeError` on a cp1252 console **after every check had
  passed** — the harness did the work, threw the answer away, and exited non-zero
  ([RLG-042](../fragments/RLG-042.md)).
- Changed: the test environment is a project-local `.venv`, because the environment's Python is
  uv-managed and refuses package installs ([RLG-042](../fragments/RLG-042.md)).

<a id="v0-9-2"></a>
## [0.9.2] — 2026-08-23 22:49:54
- Added: `LICENSE` — an all-rights-reserved notice. The repository stays public, because that is
  what GitHub Pages needs, and the notice grants no rights rather than relying on the repository
  being closed ([RLG-022](../fragments/RLG-022.md)).
- Changed: the packer's whitelist ships `LICENSE`, so a downloaded build carries its terms beside
  the font licenses ([RLG-022](../fragments/RLG-022.md)).

<a id="v0-9-1"></a>
## [0.9.1] — 2026-08-23 22:00:49
- Added: `pack.sh` — the whitelist build, the four validation gates, and the generator of the
  offline cache lists. It is a **recreation**, not the lost original, and the file says so
  ([RLG-018](../fragments/RLG-018.md)).
- Fixed: the catalog cross-check compared `path.join` output against forward-slash catalog entries,
  so on Windows all eighteen machines were reported as unlisted ([RLG-018](../fragments/RLG-018.md)).
- Fixed: `fonts/.gitkeep` reached both regenerated cache lists, while the staging copy does not
  carry it — one 404 fails the whole precache ([RLG-018](../fragments/RLG-018.md)).
- Added: a PowerShell fallback for the archive step, because Git Bash on Windows ships `unzip` and
  not `zip` ([RLG-018](../fragments/RLG-018.md)).

<a id="v0-9-0"></a>
## [0.9.0] — 2026-08-23 20:41:31
- Added: the project version — `Arcade.version` in `arcade.js` is the one authoritative copy, and
  the git tag mirrors it ([RLG-001](../fragments/RLG-001.md)).
- Changed: the project entered the Code Continuum development process. The version starts at 0.9.0
  rather than at 0.0.0 because the codebase already ships eighteen machines; 0.0.0 would be a false
  statement about maturity. See the design document section 12.
