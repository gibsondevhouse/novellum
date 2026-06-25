---
title: Outline Merge Transaction Logic
slug: part-001-outline-merge-transaction
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-preflight-validations
started_at: ~
completed_at: ~
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

## Acceptance Criteria

- [ ] Db transaction rollbacks cleanly on writing error.
- [ ] Unsaved editor text displays conflict warning dialog.

## Edge Cases

- Duplicate scene names: append sequence numbering to prevent constraints error.

## Notes

> Part-level context for Outline Merge Transaction Logic.
