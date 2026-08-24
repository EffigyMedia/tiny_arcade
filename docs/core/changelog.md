# Changelog

The append-only index of what shipped and when, keyed to version. One short dated entry per feature
commit. Newest on top. **An entry is never edited after the fact.**

Each entry links to the fragment that holds the full record. This project keeps no `tracker.md`, so
a link points at the fragment file itself: `[RLG-018](../fragments/RLG-018.md)`. Both directions
must resolve, and that is verified at every milestone.

The history before this file begins is in the git log: 220 commits, made before the project entered
the development process. See `docs/core/tiny_arcade_design.md` section 0.

---

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
