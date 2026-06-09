---
title: Failing Spec Classification
slug: part-001-failing-spec-classification
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-003-failing-spec-classification
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Prevent stale tests from driving accidental compatibility while still catching real regressions.

## Scope

**In scope:**

- Run or inspect the failing e2e specs.
- Record exact status codes and failing assertions.
- Classify each failure with recommended action.

**Out of scope:**

- Blindly deleting tests.
- Changing product code before classification.

## Implementation Steps

1. Run `pnpm test:e2e --project=chromium` or the failing specs directly.
2. Capture exact failures and error contexts.
3. Classify each failure and identify target route/schema.
4. Save classification evidence.

## Files

**Create:**

- `evidence/failing-spec-classification-evidence-2026-06-09.md`

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

- [ ] Every failing spec has a classification and recommended action.
- [ ] Stale fixture failures are distinguished from product regressions.
- [ ] Next-stage API map can resolve each failure.

## Edge Cases

- Package script prepends `tests/e2e/`, so direct `pnpm exec playwright` may be needed.
- Failures may depend on previous test database state.

## Notes

Keep this part scoped to Pipeline Checkpoint Contract Reconciliation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
