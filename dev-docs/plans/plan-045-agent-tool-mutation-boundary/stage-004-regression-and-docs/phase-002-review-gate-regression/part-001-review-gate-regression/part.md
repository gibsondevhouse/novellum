---
title: Review Gate Regression
slug: part-001-review-gate-regression
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-002-review-gate-regression
started_at: 2026-06-11
completed_at: 2026-06-11
estimated_duration: TBD
---

## Objective

Verify the mutation boundary preserves existing checkpoint and proposal acceptance UX.

## Scope

**In scope:**

- Author draft checkpoint accept/reject tests.
- Worldbuild proposal accept/reject tests if touched.
- Outline checkpoint accept/reject tests if touched.

**Out of scope:**

- Full e2e suite unless required by changed routes.
- Visual-only changes.

## Implementation Steps

1. Run author draft checkpoint service and component tests.
2. Run relevant worldbuild and outline route tests.
3. Run targeted e2e if UI wiring changed.
4. Capture evidence.

## Files

**Create:**

- `evidence/review-gate-regression-evidence-2026-06-09.md`

**Update:**

- `tests/ai/pipeline/author-draft-checkpoint-service.test.ts`
- `tests/e2e/vibe-author-review-gates.spec.ts`
- `tests/e2e/outline-generation-review.spec.ts`

**Reference:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [x] Explicit UI accept can still apply valid drafts.
- [x] Model-callable paths cannot apply drafts.
- [x] Stale/dirty/force-overwrite protections remain intact.

## Edge Cases

- Some older e2e specs may be stale; classify before relying on failures.
- Route tests should distinguish unsupported legacy behavior from regressions.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
