---
title: Add Generation Runner Service
slug: part-003-add-generation-runner-service
part_number: 3
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-provider-route-and-schema-output
started_at: 2026-06-03T14:11:56-04:00
completed_at: 2026-06-03T14:19:00-04:00
estimated_duration: 0.5d
---

## Objective

Create a client-side runner service for Nova that handles request state, cancellation, retry, and typed results.

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

1. Wrap the generation route with typed request/result handling.
2. Track idle/ready/running/succeeded/failed/cancelled states.
3. Support AbortSignal cancellation.
4. Normalize server errors into UI-safe failure states.

## Files

**Create:**

- `src/modules/nova/services/outline-generation-runner.ts`
- `tests/nova/outline-generation-runner.test.ts`

**Update:**

- `src/modules/nova/index.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Runner blocks duplicate active runs.
- [x] Runner reports cancellation distinctly from failure.
- [x] Runner returns checkpoint ID and review payload on success.
- [x] Tests cover success, provider error, validation error, duplicate run, and abort.

## Edge Cases

- Network error before response body.
- Malformed JSON response.
- Fast double-click on Generate.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
