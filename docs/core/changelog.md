# Changelog

The append-only index of what shipped and when, keyed to version. One short dated entry per feature
commit. Newest on top. **An entry is never edited after the fact.**

Each entry links to the fragment that holds the full record. This project keeps no `tracker.md`, so
a link points at the fragment file itself: `[RLG-018](../fragments/RLG-018.md)`. Both directions
must resolve, and that is verified at every milestone.

The history before this file begins is in the git log: 220 commits, made before the project entered
the development process. See `docs/core/tiny_arcade_design.md` section 0.

---

<a id="v0-9-0"></a>
## [0.9.0] — 2026-08-23 20:41:31
- Added: the project version — `Arcade.version` in `arcade.js` is the one authoritative copy, and
  the git tag mirrors it ([RLG-001](../fragments/RLG-001.md)).
- Changed: the project entered the Code Continuum development process. The version starts at 0.9.0
  rather than at 0.0.0 because the codebase already ships eighteen machines; 0.0.0 would be a false
  statement about maturity. See the design document section 12.
