---
title: Bible & Editor Modules
slug: part-001-bible-and-editor
part_number: 1
status: draft
owner: architect
assigned_to: architect
phase: phase-001-module-docs
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Refresh `modules/story-bible.md`, `modules/editor.md`, `modules/editing-layer.md`.

## Scope

**In scope:**

- `dev-docs/modules/story-bible.md`
- `dev-docs/modules/editor.md`
- `dev-docs/modules/editing-layer.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. Compare each doc against `src/modules/bible/**` and `src/modules/editor/**`.
2. Document the unified `IndividualsWorkspaceShell` surface used across Personae + Atlas + Archive + Threads + Chronicles.
3. Run `pnpm run lint`.

## Files

**Update:**

- `dev-docs/modules/story-bible.md`
- `dev-docs/modules/editor.md`
- `dev-docs/modules/editing-layer.md`

## Acceptance Criteria

- [ ] All three docs match shipped modules.
- [ ] Unified world-building shell documented.
- [ ] `pnpm run lint` passes.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
