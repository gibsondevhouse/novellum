---
title: Outline Diff Engine Service
slug: part-001-outline-diff-engine-service
part_number: 1
status: complete
owner: Planner Agent
assigned_to: —
phase: phase-001-diff-calculator
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: undefined
---

## Objective

Develop server-side diff calculation logic comparing checkpoint outline structures to database entries.

## Scope

**In scope:**

- Parse generated checkpoints and existing arcs/acts/chapters/scenes.
- Output list of insertions, modifications, and deletions.

**Out of scope:**

- Writing changes to database (handled in Stage 003).

## Implementation Steps

1. Write outline-diff-engine.ts.
2. Support deep comparisons on hierarchical IDs.

## Files

**Create:**

- `src/lib/server/outline/outline-diff-engine.ts`
- `tests/server/outline/outline-diff-engine.test.ts`

**Update:**

- _(none)_

## Acceptance Criteria

- [x] Diff engine detects added nodes.
- [x] Diff engine lists deleted elements correctly.

## Edge Cases

- Identical structure input: returns empty difference lists.

## Notes

> Part-level context for Outline Diff Engine Service.
