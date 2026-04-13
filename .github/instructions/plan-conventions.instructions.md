---
applyTo: 'dev-docs/plans/**'
---

# Plan Authoring Conventions

Rules for creating and maintaining plan artifacts in `dev-docs/plans/`.

## File Naming

- Plan directory: `dev-docs/plans/<plan-slug>/`
- Plan file: `plan.md`
- Stage directory: `stage-NNN-<slug>/` (three-digit zero-padded number)
- Stage file: `stage.md`
- Phase directory: `phase-NNN-<slug>/`
- Phase file: `phase.md`
- Part directory: `part-NNN-<slug>/`
- Part files: `part.md`, `checklist.md`, `impl.log.md`, `evidence/`

## Placeholder Syntax

Templates use `[[PLACEHOLDER]]` notation. Replace all placeholders before a file is considered active.

## Status Transitions

Parts follow this lifecycle: `draft` → `in-progress` → `review` → `complete` (or `blocked`).

- Only move to `in-progress` when work has actually started.
- Only move to `review` after the checklist is fully checked.
- Only move to `complete` after a Reviewer Agent sign-off.
- If a part is `blocked`, add a note in `impl.log.md` explaining the blocker.

Stages and phases inherit their status from their children — a stage is `complete` only when all its phases are `complete`.

## Part Execution Rules

1. Before starting a part: complete the **Pre-Implementation** section of `checklist.md`.
2. After finishing: complete the **Post-Implementation** section, add at least one artifact to `evidence/`, and record a final entry in `impl.log.md`.
3. `impl.log.md` is **append-only**. Never edit or delete existing log entries.
4. Evidence files should be named descriptively with a date: `test-output-2026-04-11.txt`.

## MASTER-PLAN.md

Update `dev-docs/plans/MASTER-PLAN.md` whenever:

- A new plan is created (add to Active Plans table)
- A plan reaches `complete` (move to Completed Plans)
- A plan is cancelled or superseded (move to Archived Plans)

## Templates

All templates live in `dev-docs/plans/_templates/`. Copy and rename the appropriate template when creating a new artifact; never edit the templates directly.
