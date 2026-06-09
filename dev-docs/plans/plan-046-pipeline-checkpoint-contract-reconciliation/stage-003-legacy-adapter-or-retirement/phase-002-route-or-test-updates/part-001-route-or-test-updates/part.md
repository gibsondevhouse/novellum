---
title: Route or Test Updates
slug: part-001-route-or-test-updates
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-route-or-test-updates
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Update product code or test fixtures so supported contracts pass and retired contracts fail deliberately.

## Scope

**In scope:**

- Route handler changes selected by compatibility decision.
- E2e fixture updates to current schemas.
- Route tests for unsupported legacy behavior.

**Out of scope:**

- Expanding product capabilities beyond contract reconciliation.
- Worldbuilding merge/diff behavior from plan 047.

## Implementation Steps

1. Update route handlers or fixtures according to the decision record.
2. Replace stale assertions with current contract assertions.
3. Add unsupported behavior tests where routes intentionally reject legacy payloads.
4. Run targeted e2e specs.

## Files

**Create:**

- None

**Update:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `tests/e2e/vibe-author-review-gates.spec.ts`
- `tests/e2e/hierarchical-pipeline-run-and-review.spec.ts`
- `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts`

**Reference:**

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`

## Acceptance Criteria

- [ ] Supported checkpoint contracts pass tests.
- [ ] Retired contracts have explicit failure tests or no longer appear as supported specs.
- [ ] No tests depend on malformed current fixtures.

## Edge Cases

- Changing generic metadata route can affect outline checkpoint review/reject.
- Fixture updates should not bypass real validators.

## Notes

Keep this part scoped to Pipeline Checkpoint Contract Reconciliation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
