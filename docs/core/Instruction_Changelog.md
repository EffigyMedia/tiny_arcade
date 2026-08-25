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

## 2026-08-24

### Milestones and handoffs are retired; the thread fragment replaces both

- **Instruction:** this project performs no milestone and writes no handoff. Re-entry after a
  context clear is the **thread fragment**, `docs/fragments/THR-001.md`, read with
  `<env-root>/Commands/thread.py show --store docs/fragments` and written only with that same tool.
  The `docs/milestones/` folder is deleted and is not recreated.
- **Why:** the environment retired both ceremonies when it built the thread. The owner said so
  directly, twice, and was right both times. The reason the replacement is better is a difference in
  *when* the writing happens: a milestone and a handoff are both written **at the threshold**, which
  means the record is produced by the session that is already out of room, and it is only as good as
  what that session can still remember. The thread is **maintained continuously**, so it is never
  composed under that pressure, and a clear becomes cheap rather than expensive.
- **What this cost, and it is the reason this entry exists.** A handoff document was written and
  committed on 2026-08-25, at the owner's request and immediately before a clear, by a session that
  had not noticed the retirement. Its content was correct; its form was obsolete. It was converted
  into the thread and deleted. **The stale trigger was sitting in `CLAUDE.md` the whole time**,
  inherited from the project template at the standup and never checked against the environment it
  claimed to summarize. A trigger table that is copied rather than verified will keep a retired
  ceremony alive for as long as nobody reads it against the source.
- **What this does not change:** audits stay, and `docs/audits/` stays. An audit is a piece of work
  with a finding, not a ceremony at a boundary.
- **Encoded in:** `CLAUDE.md` → the trigger table and the note below it; `docs/fragments/THR-001.md`.
- Owner and agent, 2026-08-25.

### Check a frozen document's age before planning from it, and settle it against the code

- **Instruction:** before any item is queued from `docs/reference/`, check which document is newest
  and confirm the claim in the source. **The top of `DESIGN.md` is the newest record in this
  repository** — it was appended to after the other five frozen documents were written. `DRIVING.md`
  and `START-HERE.md` describe a "what is next" that has partly shipped. **The code settles any
  disagreement.**
- **Why:** the standup seeded the fragment store and the delivery plan from `DRIVING.md` and
  `START-HERE.md`, and queued four items that were already built — the corner work, qualifying,
  sector times with the live delta, and the per-biome skyline. It also carried a 15% braking target
  from a note written before the corner work, against circuits that measure 7% to 10%. **A plan for
  work that is done is worse than no plan**: it sends the next session to build a thing twice and it
  makes the tracker lie about where the project is.
- **The narrower lesson, which is the one that generalizes:** a reverse-chronological log has no
  visible age. Every other document announces when it was written; that one announces it only at the
  top of each entry, and the file's own modification date says nothing about which entry is current.
- **Corollary, found the same day:** a comment is not evidence either. `raceway.html:984` reads
  *"once COMPOUNDS.grip is finally wired into cornerG"* and a fast reader takes it as done. It is
  not wired. `cornerG()` reads the body and the weather and nothing else.
- **Encoded in:** `CLAUDE.md` → the `docs/reference/` bullet; the design document's section 0 and
  its Decision Log.
- Agent, 2026-08-24.

## 2026-08-23

### Two environment tools were fixed from this project, and it is recorded in both places

- **Instruction:** none changed here. This entry exists because work done for this project was
  committed to **another repository**, and `Agent_Scope.md` requires that to be stated rather than
  done quietly.
- **What was written elsewhere:** two fixes in the Code Continuum environment repository, each with
  its own fragment, changelog entry, and version.
  - `RLG-153`, environment v1.60.0 — `Commands/tracker.py` described this environment's own store
    whatever store it was pointed at, and its `default_out()` would have overwritten the
    environment's `tracker.md` with a project's items had `--out` been omitted. This project found
    it and chose to keep no `tracker.md`; the tool is now correct for any project that wants one.
  - `RLG-154`, environment v1.61.0 — the POSIX `node` shim looked for the executable in
    `Runtime/node/bin`, which is the macOS and Linux layout. On Windows it sits at
    `Runtime/node/node.exe`, so Git Bash was told Node was not installed. **`pack.sh` needs `node`
    on PATH**, so this project's build could not run without a manual workaround. The workaround was
    written into `CLAUDE.md` and has now been removed, because the shim is fixed and verified.
- **Why it was done rather than only reported:** the owner asked for the first one directly, and the
  second blocked this project's build command. Both are one-file fixes with the environment's own
  view regenerating byte-identical, which is the property that says nothing else moved.
- **Encoded in:** the environment repository, at `Environment/docs/fragments/RLG-153.md` and
  `RLG-154.md`; here, only the removal of the PATH workaround from `CLAUDE.md`.
- Agent, 2026-08-23.

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
