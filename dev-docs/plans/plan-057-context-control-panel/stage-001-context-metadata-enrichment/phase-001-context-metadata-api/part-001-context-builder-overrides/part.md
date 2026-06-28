---
title: Context Builder Overrides Service
slug: part-001-context-builder-overrides
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-context-metadata-api
started_at: 2026-06-28
completed_at: 2026-06-28
estimated_duration: 2d
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

1. Update the Nova context request contract.
2. Add HTTP parser parameters for pin/exclude arrays.
3. Apply server-side exclusion filtering before context rendering.
4. Render pinned entities before implicit context.

## Files

**Create:**

- _(none)_

**Update:**

- `src/lib/ai/nova-context-types.ts`
- `src/lib/server/nova/context.ts`
- `src/lib/server/nova/context-renderers.ts`
- `src/routes/api/nova/context/http.ts`
- `dev-docs/03-ai/context-engine.md`
- `tests/ai/nova-context.test.ts`
- `tests/sqlite/nova-context-route.test.ts`

## Acceptance Criteria

- [x] Context builder filters matching override lists.
- [x] Pinned entities are positioned correctly.

## Edge Cases

- Pinning non-existent IDs: drop silently without throwing errors.

## Notes

> Part-level context for Context Builder Overrides Service.
