---
title: Context Builder Overrides Service
slug: part-001-context-builder-overrides
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-context-metadata-api
started_at: ~
completed_at: ~
estimated_duration: undefined
---

## Objective

Extend context API schemas to support manual client override lists.

## Scope

**In scope:**

- Verify pin/exclude ID lists.
- Filter out excluded entities.

**Out of scope:**

- Modifying RAG query calculations.

## Implementation Steps

1. Update context-builder.ts.
2. Add Zod parser parameters.

## Files

**Create:**

- _(none)_

**Update:**

- `src/lib/ai/context-builder.ts`
- `src/lib/ai/types.ts`

## Acceptance Criteria

- [ ] Context builder filters matching override lists.
- [ ] Pinned files are positioned correctly.

## Edge Cases

- Pinning non-existent IDs: drop silently without throwing errors.

## Notes

> Part-level context for Context Builder Overrides Service.
