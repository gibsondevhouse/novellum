---
title: Lifecycle Operation Map
slug: part-001-lifecycle-operation-map
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-lifecycle-operation-map
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Make draft/review/accept/reject transitions consistent where possible and intentionally different where necessary.

## Scope

**In scope:**

- Transition table for each family.
- Expected HTTP status/error codes.
- Idempotency and invalid transition behavior.

**Out of scope:**

- Forcing all families into one schema if product needs differ.
- Changing data persistence format without need.

## Implementation Steps

1. Document allowed lifecycle transitions by family.
2. Compare current service behavior and route responses.
3. Choose final error/status behavior for stale/invalid/not-found cases.
4. Save lifecycle map evidence.

## Files

**Create:**

- `evidence/lifecycle-operation-map-evidence-2026-06-09.md`

**Update:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`

**Reference:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`

## Acceptance Criteria

- [ ] Transition behavior is documented and testable.
- [ ] Error codes are stable for client branching.
- [ ] Invalid legacy operations have deliberate responses.

## Edge Cases

- Some accept operations are idempotent while reject-after-accept is not.
- Stale checkpoint behavior differs from invalid transition.

## Notes

Keep this part scoped to Pipeline Checkpoint Contract Reconciliation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
