---
title: Route Inventory
slug: part-001-route-inventory
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-001-route-inventory
started_at: 2026-06-12
completed_at: 2026-06-12
estimated_duration: TBD
---

## Objective

Create a route ownership map across generic metadata, worldbuild proposals, author draft checkpoints, and outline checkpoints.

## Scope

**In scope:**

- List current API routes and client helpers.
- Record supported HTTP methods and request shapes.
- Identify duplicate or legacy route responsibilities.

**Out of scope:**

- Changing route behavior during inventory.
- Fixing tests before classification.

## Implementation Steps

1. Search `src/routes/api` for pipeline, checkpoint, proposal, outline, and author-draft routes.
2. Map each route to pipeline family and lifecycle operations.
3. Identify client helpers and tests for each route.
4. Save route inventory evidence.

## Files

**Create:**

- `evidence/route-inventory-evidence-2026-06-12.md`

**Update:**

- None

**Reference:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`

## Acceptance Criteria

- [x] Every pipeline-related route is mapped.
- [x] Generic metadata route responsibilities are explicit.
- [x] Tests and clients are linked to route owners.

## Edge Cases

- Some lifecycle mutations live in generic metadata route.
- Outline acceptance intentionally uses a dedicated materialization route.

## Notes

Route inventory evidence identifies one follow-up compatibility risk: the worldbuilding proposal client omits `projectId` while the new-style proposal route only loads persisted proposal records when `projectId` is present.
