# Instruction Changelog

The dated audit trail of amendments to **how we work** — the instructions in `CLAUDE.md`, the design
document, and this project's deviations from the shared process docs (`<env-root>/Process/`) and the
trigger phrases. The operative rules live in those documents; this file records *when* and *why*
each instruction changed, and *where* it now lives. Newest on top.

**Rule for this file:** when an instruction changes, add an entry here **and** update the operative
document it points to in the same unit of work.

**Stack-specific gotchas go elsewhere:** browser, PWA and Playwright lessons belong in the shared
Knowledge Base (`<env-root>/Process/Knowledge_Base/`), not here. This log is only for changes to
*how we work*.

---

## 2026-08-23

### The public front page lives at `docs/README.md`, and the root stays clean

- **Instruction:** the repository's public README is `docs/README.md`. It is a live document: keep
  it current with what the product is and how it is run and built. The root keeps one Markdown file
  and it is `CLAUDE.md`. The old root `README.md` stays frozen in `docs/reference/`.
- **Why:** the process permits exactly one Markdown file at the repository root, and this repository
  is also a public front page and the deployed GitHub Pages site. Those two facts looked like a
  conflict that needed a project amendment, and they do not: **GitHub renders a README from the root,
  from `.github/`, or from `docs/`.** Putting it in `docs/` satisfies the process rule and the front
  page at the same time, with no rule bent.
- **Why it is a new document and not the moved one:** the old `README.md` is a frozen ancestor and
  describes a folder layout and a workflow that no longer exist - a root full of documents, and a
  `sync.sh` that pushes from a folder that was not a repository. A frozen document must not be
  edited, and a stale front page is worse than none.
- **Encoded in:** `docs/README.md`; `CLAUDE.md` → the root Markdown rule is unchanged.
- Agent, 2026-08-23.

### The writing standard governs new prose only; the existing corpus is not rewritten

- **Instruction:** write all new output in Simplified Technical English with American spelling, as
  `Writing_Standard.md` requires. **Do not rewrite the existing source comments or the frozen
  documents in `docs/reference/` to match it.** Where a British spelling is already in an
  identifier, a filename, or a comment, leave it and use it consistently.
- **Why:** the project holds about 21,000 lines of code and six documents written before it entered
  the process, and they are British-spelled throughout ("behaviour", "catalogue", "colour",
  "artefact", "tyre"). A sweep would touch every file, would produce a diff that says nothing about
  behavior, and would break every quotation and every cross-reference into the frozen documents. The
  standard exists for consistency in what this environment writes; a rewrite of what it inherited
  buys none.
- **Note:** `tyre` and `tire` both appear in the codebase already. **New prose uses `tire`; the
  identifiers keep whatever they are.** Renaming an identifier is a code change, and it needs its
  own fragment.
- **Encoded in:** `CLAUDE.md` → the `Writing_Standard.md` bullet.
- Agent, 2026-08-23.

### The six pre-standup documents are frozen reference ancestors

- **Instruction:** `docs/reference/DESIGN.md`, `DRIVING.md`, `README.md`, `REFACTOR.md`,
  `SHIPPING.md`, and `START-HERE.md` are **read-only records**. Read them for the reasoning behind
  what exists. Never add to them, and never correct them. When one of them disagrees with
  `docs/core/tiny_arcade_design.md`, the design document wins, and the disagreement is a defect in
  the design document until its Decision Log records the answer.
- **Why:** they are the only account of how the arcade was built, and they were written in reverse
  date order as a running log rather than as a specification. Two live authorities is how a project
  gets two answers to one question. Freezing them keeps the reasoning and removes the ambiguity.
  Each file now opens with a banner that says so, because a document that looks live and is not is
  worse than no document.
- **Encoded in:** the banner at the top of each of the six files; `CLAUDE.md` → the `docs/reference/`
  bullet; the design document's section 0.
- Agent, 2026-08-23.

### The work record is the fragment store, and this project keeps no `tracker.md`

- **Instruction:** every unit of work is an `RLG-NNN` fragment in `docs/fragments/`, written with
  `<env-root>/Commands/fragment.py` and never by hand. The view over the store is the dashboard.
  **Do not generate `docs/core/tracker.md` for this project.**
- **Why, first half:** owner decision at the standup. The store is the live system in this
  environment, and a project that starts on it carries no migration debt.
- **Why, second half — and this part is a finding, not a preference.** `Commands/tracker.py` was
  written to serve one document: the environment's own `roadmap.md`, which cites tracker anchors 159
  times. It hardcodes that purpose. Pointed at this project's store it produced a file whose header
  says "GENERATED from `Environment/docs/fragments/`", cites `roadmap.md` by name, counts 159
  anchors that belong to another repository, and describes a frozen succession line that this
  project does not have. **A generated file that misdescribes its own source is worse than no
  file**, because a future session will believe the header. The generated file was deleted rather
  than committed.
- **What this does not change:** the store is still the record, and the dashboard still reads it.
  Nothing is lost except a second view that nothing here needs. If `tracker.py` learns to describe
  the store it was pointed at, this entry is superseded.
- **Encoded in:** `CLAUDE.md` → the work-record bullet.
- Owner and agent, 2026-08-23.
