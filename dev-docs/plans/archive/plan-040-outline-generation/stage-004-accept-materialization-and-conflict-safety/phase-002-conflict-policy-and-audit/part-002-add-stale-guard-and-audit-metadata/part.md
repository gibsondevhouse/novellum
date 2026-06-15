---
title: Add Stale Guard and Audit Metadata
slug: part-002-add-stale-guard-and-audit-metadata
part_number: 2
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-conflict-policy-and-audit
started_at: 2026-06-04T11:52:00-04:00
completed_at: 2026-06-04T11:57:00-04:00
estimated_duration: 0.5d
---

## Objective

Ensure checkpoint accept/reject decisions include stale guards and audit metadata sufficient for later debugging.

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

1. Add checkpoint hash/version precondition if not already present.
2. Store acceptedAt/acceptedBy/note/materialization summary on success.
3. Store rejectedAt/rejectedBy/reason on reject.
4. Return conflict/stale errors without modifying lifecycle.

## Files

**Create:**

- `tests/routes/outline-checkpoint-audit.test.ts`

**Update:**

- `src/lib/ai/pipeline/outline-checkpoint-contract.ts`
- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Stale checkpoint accept is rejected.
- [x] Audit metadata includes materialized counts and hierarchy root IDs.
- [x] Reject path includes reason and no hierarchy writes.
- [x] Tests cover stale and audit metadata cases.

## Edge Cases

- Clock skew in generated timestamps.
- User identity unavailable in local-first single-user app.
- Checkpoint payload hash differs due to legacy serialization.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
