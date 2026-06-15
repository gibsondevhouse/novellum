---
title: Implement Review Actions
slug: part-002-implement-review-actions
part_number: 2
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-review-card-and-actions
started_at: 2026-06-03T14:54:47-04:00
completed_at: 2026-06-03T14:58:16-04:00
estimated_duration: 0.5d
---

## Objective

Wire review, reject, and accept action entry points from the Nova card while preserving server authority for materialization.

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

1. Add action service for review/reject and accept route call.
2. Require rejection reason where route requires it.
3. Show confirmation before accept.
4. Render post-action success/failure states without assuming mutation succeeded.

## Files

**Create:**

- `src/modules/nova/services/outline-checkpoint-actions.ts`
- `tests/nova/outline-checkpoint-actions.test.ts`

**Update:**

- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Reject requires or passes a reason according to route contract.
- [x] Accept calls server materialization route, not client DB helpers.
- [x] UI updates only from returned checkpoint/materialization result.
- [x] Tests cover accept success, accept conflict, reject success, and route failure.

## Edge Cases

- User clicks accept twice.
- Accept succeeds but card refresh fails.
- Reject reason is empty/whitespace.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
