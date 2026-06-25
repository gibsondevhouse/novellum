---
title: Outline Merge Transaction Logic
slug: part-001-outline-merge-transaction
part_number: 1
status: complete
owner: Planner Agent
assigned_to: —
phase: phase-001-preflight-validations
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: undefined
---

## Objective

Write database transaction logic to safely apply selected merge nodes and alert on overwrite conflicts.

## Scope

**In scope:**

- Verify edit conflicts for manual manuscript files.
- Wrap DB updates inside SQLite transaction.

**Out of scope:**

- UI element formatting changes.

## Implementation Steps

1. Extend outline-materialization-service.ts.
2. Write preflight check routines.

## Files

**Create:**

- _(none)_

**Update:**

- `src/lib/server/outline/outline-materialization-service.ts`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `tests/routes/outline-accept.test.ts`
- `tests/nova/NovaOutlineDraftCheckpointCard.test.ts`

## Acceptance Criteria

- [x] Db transaction rollbacks cleanly on writing error.
- [x] Unsaved editor text displays conflict warning dialog.

## Edge Cases

- Duplicate scene names: append sequence numbering to prevent constraints error.

## Notes

> Part-level context for Outline Merge Transaction Logic.
