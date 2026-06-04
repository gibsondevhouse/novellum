---
title: Recover From Materialization Failures
slug: part-003-recover-from-materialization-failures
part_number: 3
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-conflict-policy-and-audit
started_at: 2026-06-04T11:58:00-04:00
completed_at: 2026-06-04T12:07:00-04:00
estimated_duration: 0.5d
---

## Objective

Add failure handling and evidence points so materialization errors are diagnosable and non-destructive.

## Scope

**In scope:**

- Implement only the behavior described in this part.
- Keep changes bounded to the listed files unless source inspection proves a different path is required.
- Add or update tests that directly verify this part's acceptance criteria.
- Record implementation decisions and deviations in `impl.log.md`.

**Out of scope:**

- Broad UI redesign outside the affected Nova/outline surfaces.
- Direct provider SDK calls, client-side API keys, telemetry, sync, or auth.
- Silent manuscript/hierarchy mutation outside the explicit accept path.
- Opportunistic refactors unrelated to this part.

## Implementation Steps

1. Normalize DB/materialization errors into safe codes.
2. Do not mark checkpoint accepted on transaction failure.
3. Render failure recovery copy in Nova.
4. Capture test plan/evidence for forced rollback path.

## Files

**Create:**

- `dev-docs/plans/plan-040-outline-generation/stage-004-accept-materialization-and-conflict-safety/phase-002-conflict-policy-and-audit/part-003-recover-from-materialization-failures/evidence/rollback-test-plan-2026-06-03.md`

**Update:**

- `src/lib/server/outline/outline-materialization-service.ts`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Forced failure leaves zero partial hierarchy rows.
- [x] Checkpoint remains reviewable or failed-with-retry according to route contract.
- [x] User-facing error does not expose raw SQL/provider internals.
- [x] Evidence documents the rollback scenario.

## Edge Cases

- Unique constraint failure on second inserted chapter.
- Disk/database unavailable.
- JSON metadata write succeeds but hierarchy transaction fails or vice versa.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
