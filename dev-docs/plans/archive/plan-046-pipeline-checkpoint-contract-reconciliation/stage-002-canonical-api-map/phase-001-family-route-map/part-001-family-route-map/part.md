---
title: Family Route Map
slug: part-001-family-route-map
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-001-family-route-map
started_at: 2026-06-12
completed_at: 2026-06-12
estimated_duration: TBD
---

## Objective

Decide which route handles each lifecycle operation for worldbuild checkpoints, proposals, author drafts, and outlines.

## Scope

**In scope:**

- Canonical route table by family and operation.
- Generic metadata route compatibility decision points.
- Client helper ownership.

**Out of scope:**

- Implementing route changes before the map is accepted.
- Changing UI flows unrelated to route ownership.

## Implementation Steps

1. Use inventories to draft a family route table.
2. Mark each route as canonical, compatibility, internal, or retired.
3. Review route ownership with tests and UI callers.
4. Save API map evidence.

## Files

**Create:**

- `evidence/family-route-map-evidence-2026-06-12.md`

**Update:**

- `dev-docs/03-ai/agents-map.md`

**Reference:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`

## Acceptance Criteria

- [x] Each family has exactly one canonical lifecycle path per operation.
- [x] Generic metadata route support is explicitly scoped.
- [x] Client helpers are assigned to canonical routes.

## Edge Cases

- Outline accept must stay dedicated because it materializes hierarchy.
- Proposal accept differs from checkpoint accept.

## Notes

Canonical route ownership is documented in `dev-docs/03-ai/agents-map.md`. Stage 003 should update stale callers/tests to this map.
