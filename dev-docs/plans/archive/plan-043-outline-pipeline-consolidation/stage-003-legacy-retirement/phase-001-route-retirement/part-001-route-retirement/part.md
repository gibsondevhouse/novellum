---
title: Route Retirement
slug: part-001-route-retirement
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-001-route-retirement
started_at: 2026-06-12
completed_at: 2026-06-12
estimated_duration: TBD
---

## Objective

Retire `/api/nova/outline/apply` so generated outlines cannot replace hierarchy outside checkpoint acceptance.

## Scope

**In scope:**

- Delete the route and tests or replace with a stable unsupported response.
- Remove imports and service wrappers that only serve the retired route.
- Document the retirement decision.

**Out of scope:**

- Removing checkpoint accept routes.
- Deleting current outline data from projects.

## Implementation Steps

1. Apply the disposition chosen in the risk map to `/api/nova/outline/apply`.
2. Update or remove route tests that assert retired behavior.
3. Run targeted route tests and outline e2e.
4. Save evidence explaining the final route behavior.

## Files

**Create:**

- `evidence/route-retirement-evidence-2026-06-12.md`

**Update:**

- `src/routes/api/nova/outline/apply/+server.ts`
- `src/modules/nova/services/outline-artifact-apply.ts`
- `tests/routes/nova-outline-apply-route.test.ts`

**Reference:**

- `src/routes/api/ai/outline/generate/+server.ts`
- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`
- `src/lib/server/outline/outline-materialization-service.ts`
- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `src/modules/nova/stores/outline-generation-state.svelte.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [x] Legacy route no longer performs hierarchy replacement.
- [x] No active caller expects the retired route.
- [x] Failure behavior is explicit if the route remains as unsupported.

## Edge Cases

- Deleting route files can require import cleanup in barrels.
- Unsupported responses should not leak old payload details.

## Notes

Keep this part scoped to Outline Pipeline Consolidation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
