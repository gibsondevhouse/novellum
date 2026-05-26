---
title: Outliner / Consistency / Export / Hub
slug: part-002-outliner-consistency-export-hub
part_number: 2
status: draft
owner: architect
assigned_to: architect
phase: phase-001-module-docs
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Refresh `modules/outliner.md`, `modules/consistency-engine.md`, `modules/export.md`, `modules/project-hub.md`.

## Scope

**In scope:**

- `dev-docs/modules/outliner.md`
- `dev-docs/modules/consistency-engine.md`
- `dev-docs/modules/export.md`
- `dev-docs/modules/project-hub.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. Compare each doc against the corresponding `src/modules/<name>/` directory.
2. Check public surface via each module's `index.ts` barrel.
3. Run `pnpm run lint`.

## Files

**Update:**

- `dev-docs/modules/outliner.md`
- `dev-docs/modules/consistency-engine.md`
- `dev-docs/modules/export.md`
- `dev-docs/modules/project-hub.md`

## Acceptance Criteria

- [ ] All four docs match shipped modules.
- [ ] Public surfaces correctly documented.
- [ ] `pnpm run lint` passes.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
