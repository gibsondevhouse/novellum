# Novellum Plan Authoring Method

> Upload this file to your ChatGPT project (or hand it to any planning
> agent) when you want it to produce a plan that drops cleanly into
> this repository. It is the distilled, self-contained version of
> [.github/instructions/plan-conventions.instructions.md](.github/instructions/plan-conventions.instructions.md)
> plus the templates under [dev-docs/plans/_templates/](dev-docs/plans/_templates/).

If you also need product/architecture context, pair this with
[context.md](context.md).

---

## What you are producing

A directory tree under `dev-docs/plans/<plan-slug>/` that the human
will commit verbatim. Output it as a fenced list of files with their
full contents (one fenced block per file), so it can be pasted into
the repo with no edits.

Never describe the plan in prose alone. The deliverable is **files**.

---

## The 4-tier hierarchy

Every plan decomposes into the same shape:

```text
Plan          → dev-docs/plans/<plan-slug>/plan.md
  Stage       → stage-NNN-<slug>/stage.md
    Phase     → phase-NNN-<slug>/phase.md
      Part    → part-NNN-<slug>/
                  part.md          (the work order)
                  checklist.md     (pre/impl/post boxes)
                  impl.log.md      (append-only journal)
                  evidence/        (artifacts produced during work)
```

Rules of thumb for sizing:

- **Part** = one focused unit of work assignable to a single agent in
  one sitting. Touches a bounded set of files. Has clear acceptance
  criteria. If a part needs more than ~5 acceptance criteria, split it.
- **Phase** = a coherent slice of behavior (e.g. "wire the API",
  "build the UI", "add tests"). Usually 2–5 parts.
- **Stage** = a deliverable milestone of the plan. Usually 2–4 phases.
- **Plan** = the whole initiative. Usually 3–8 stages.

If something is a single-file change, it does not need a plan. Just
do it.

---

## Naming conventions

| Element | Pattern | Example |
| --- | --- | --- |
| Plan slug | `plan-NNN-<kebab>` | `plan-027-v1.1-scoping` |
| Plan dir | `dev-docs/plans/<plan-slug>/` | `dev-docs/plans/plan-027-v1.1-scoping/` |
| Stage dir | `stage-NNN-<kebab>/` | `stage-001-discovery/` |
| Phase dir | `phase-NNN-<kebab>/` | `phase-001-research/` |
| Part dir | `part-NNN-<kebab>/` | `part-001-survey-modules/` |

- `NNN` is zero-padded three digits, sequential within its parent.
- Slugs are kebab-case, lowercase, no spaces.
- Next plan number: look at `dev-docs/plans/MASTER-PLAN.md` for the
  highest existing `plan-NNN` and add one.

---

## Status lifecycle

```text
draft → in-progress → review → complete
                    ↘ blocked (with note in impl.log.md)
```

Rules (enforced by the Reviewer agent):

1. Only flip a Part to `in-progress` when work actually starts.
2. Only flip to `review` after the **Implementation** checklist is
   fully checked.
3. Only flip to `complete` after a Reviewer sign-off entry exists in
   `impl.log.md`.
4. A Phase is `complete` only when all its Parts are `complete`. Same
   rule rolls up Stage → Plan.
5. `impl.log.md` is **append-only**. Never edit or remove entries.
6. Every completed Part must drop at least one artifact into
   `evidence/` (test output, screenshot, diff, log snippet, etc.).

When you scaffold a fresh plan, every status starts at `draft`.

---

## Templates (use these verbatim, just fill the placeholders)

`[[PLACEHOLDER]]` is the placeholder syntax. Replace every one before
considering a file final. Dates are ISO `YYYY-MM-DD`.

### `plan.md`

```markdown
---
title: [[Plan Title]]
slug: [[plan-slug]]
version: 1.0.0
status: draft
owner: Planner Agent
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
target_completion: YYYY-MM-DD
stages:
  - stage-001-[[slug]]
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
---

## Objective

> What this plan achieves and why it matters.

## Scope

**In scope:**

- ...

**Out of scope:**

- ...

## Stages

| #   | Stage                                     | Status  | Est. Duration |
| --- | ----------------------------------------- | ------- | ------------- |
| 001 | [Stage Name](stage-001-[[slug]]/stage.md) | `draft` | Xd            |

## Quality Gates

- [ ] **lint** — zero lint errors
- [ ] **typecheck** — zero type errors
- [ ] **tests** — all tests pass
- [ ] **docs_sync** — relevant docs updated

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| ...  | low/med/hi | ...        |

## Notes

> Cross-cutting context, decisions, constraints.
```

### `stage.md`

```markdown
---
title: [[Stage Title]]
slug: stage-NNN-[[slug]]
stage_number: N
status: draft
owner: Planner Agent
plan: [[plan-slug]]
phases:
  - phase-001-[[slug]]
estimated_duration: Xd
risk_level: low
---

## Goal

> One or two sentences.

## Phases

| #   | Phase                                     | Status  | Est. Duration |
| --- | ----------------------------------------- | ------- | ------------- |
| 001 | [Phase Name](phase-001-[[slug]]/phase.md) | `draft` | Xd            |

## Entry Criteria

- ...

## Exit Criteria

- All phases complete
- All quality gates passed

## Notes

> Stage-level context.
```

### `phase.md`

```markdown
---
title: [[Phase Title]]
slug: phase-NNN-[[slug]]
phase_number: N
status: draft
owner: Planner Agent
stage: stage-NNN-[[slug]]
parts:
  - part-001-[[slug]]
estimated_duration: Xd
---

## Goal

> One or two sentences.

## Parts

| #   | Part                                   | Status  | Assigned To | Est. Duration |
| --- | -------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Part Name](part-001-[[slug]]/part.md) | `draft` | —           | Xd            |

## Acceptance Criteria

- [ ] All parts reach `complete`
- [ ] ...

## Notes
```

### `part.md`

```markdown
---
title: [[Part Title]]
slug: part-NNN-[[slug]]
part_number: N
status: draft
owner: [[Agent]]
assigned_to: [[Agent]]
phase: phase-NNN-[[slug]]
started_at: ~
completed_at: ~
estimated_duration: Xd
---

## Objective

> What this part achieves; tie to the parent phase goal.

## Scope

**In scope:**

- ...

**Out of scope:**

- ...

## Implementation Steps

1. ...
2. ...

## Files

**Create:**

- `path/to/new-file`

**Update:**

- `path/to/existing-file`

## Acceptance Criteria

- [ ] ...
- [ ] ...

## Edge Cases

- ...

## Notes
```

### `checklist.md`

```markdown
---
part: [[part-slug]]
last_updated: YYYY-MM-DD
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] All declared dependencies are `complete`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] All files listed in `part.md > Files > Create` have been created
- [ ] All files listed in `part.md > Files > Update` have been updated
- [ ] Each acceptance criterion in `part.md` is satisfied
- [ ] Edge cases addressed

## Post-Implementation

- [ ] Lint passes with zero errors
- [ ] Type-check passes with zero errors
- [ ] Tests pass (if applicable)
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
```

### `impl.log.md`

```markdown
---
part: [[part-slug]]
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---
```

---

## Repo-aware authoring rules

A plan is "repo-consistent" only if it respects these. Skim
[context.md](context.md) for the full set; the critical ones for
planning:

1. **Module-aware file paths.** New product features live under
   `src/modules/<domain>/`. Cross-module references go through the
   barrel `src/modules/<domain>/index.ts`. Don't propose imports that
   reach into a sibling module's internals.
2. **Server data goes through `/api/db/*`.** The client never opens
   SQLite directly. A "Files > Create" entry that puts
   `better-sqlite3` in a client module is wrong.
3. **Svelte 5 Runes only.** Never plan tasks that introduce `$:`,
   `writable()` stores in `.svelte` files, or Svelte 4 lifecycle
   hooks for new code.
4. **Tokens, not pixels.** Any styling task must reference tokens in
   `src/styles/tokens.css`. If a needed token doesn't exist, the plan
   includes a step to add it.
5. **Tests mirror source.** A part that creates
   `src/modules/foo/bar.ts` should create
   `tests/foo/bar.test.ts`.
6. **AI work follows ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT**
   and stays inside the existing pipeline
   `ContextEngine → PromptBuilder → ModelRouter → OpenRouter`. New
   agents go under `src/lib/ai/<name>-agent.ts` with a Vitest suite.
7. **No silent manuscript edits.** Plans that auto-apply AI output to
   the manuscript must be rewritten to emit suggestions.
8. **Quality gates are part of the Definition of Done.** Every Plan's
   `quality_gates` frontmatter lists at minimum `lint`, `typecheck`,
   `tests`. Add `tokens` for styling work, `e2e` / `visual` for UI
   shipped to users, `boundaries` for cross-module refactors.

Available `pnpm` scripts for gates (verbatim names — use these in the
`quality_gates` block and in checklists):

- `pnpm check` (svelte-check + tsc)
- `pnpm lint`
- `pnpm lint:css`
- `pnpm test`
- `pnpm check:tokens`
- `pnpm test:e2e`
- `pnpm test:visual`

---

## Bookkeeping you must do alongside the plan tree

A new plan is only "filed" when these are also touched:

1. **`dev-docs/plans/MASTER-PLAN.md`** — add a row to the **Active
   Plans** table. On completion, move it to **Completed Plans
   (Archived)**. On cancellation, move to **Archived Plans**.
2. **`dev-docs/plans/ACTIVE-PLAN.md`** — if this plan becomes the
   focus, update the `Current` section. Move the previous current
   plan into `Recently completed` if it's done, or note it as paused.

Both files live at the top of `dev-docs/plans/`. Produce updated
versions of them as part of your output when you create a plan.

---

## Output format the human expects from you

When the user asks "produce a plan for X", reply with:

1. A 3–6 line **plan summary**: title, slug, why now, top risks.
2. The **file tree** you'll create, e.g.

   ```text
   dev-docs/plans/plan-027-v1.1-scoping/
     plan.md
     stage-001-survey/
       stage.md
       phase-001-inventory/
         phase.md
         part-001-list-deferred-work/
           part.md
           checklist.md
           impl.log.md
           evidence/.gitkeep
   ```

3. One fenced code block per file, with a header line stating the
   path, e.g.

   ````markdown
   ### `dev-docs/plans/plan-027-v1.1-scoping/plan.md`

   ```markdown
   ---
   title: V1.1 Scoping
   ...
   ```
   ````

4. The updated `MASTER-PLAN.md` and `ACTIVE-PLAN.md` rows/sections.

Do not ask the user to confirm before producing the files — produce
them, then list the open questions at the end so the user can amend.

---

## Self-check before you hand the plan over

Run this checklist mentally before you finalize:

- [ ] Every directory name matches `(plan|stage|phase|part)-NNN-<kebab>`.
- [ ] Every file's frontmatter has every required key from the template.
- [ ] All `status:` values are `draft`.
- [ ] Every Part has `part.md`, `checklist.md`, `impl.log.md`, and an
      `evidence/` directory (use a `.gitkeep` so it commits).
- [ ] No Part proposes work that violates the repo-aware rules above.
- [ ] `quality_gates` in `plan.md` includes the right gates for the
      work type.
- [ ] `MASTER-PLAN.md` and (if relevant) `ACTIVE-PLAN.md` are updated.
- [ ] File paths in `part.md > Files` exist or are clearly new — no
      vague placeholders like `src/foo.ts`.
- [ ] Acceptance criteria are testable, not aspirational.

If any box would be unchecked, fix the plan before delivering it.
