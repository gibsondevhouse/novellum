---
title: Wire Outline Generation State to Nova
slug: part-002-wire-outline-generation-state-to-nova
part_number: 2
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-trigger-and-state-shell
started_at: 2026-06-03T14:31:32-04:00
completed_at: 2026-06-03T14:38:00-04:00
estimated_duration: 0.5d
---

## Objective

Connect the generation runner to Nova state, progress, retry, and cancellation UX.

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

1. Create Svelte 5 runes state for current request/checkpoint/error.
2. Expose retry and cancel actions.
3. Reset state safely when project changes.
4. Persist enough state to recover after route refresh if checkpoint exists.

## Files

**Create:**

- `src/modules/nova/stores/outline-generation-state.svelte.ts`
- `tests/nova/outline-generation-state.test.ts`

**Update:**

- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] State uses Svelte 5 runes, not legacy stores in components.
- [x] Abort path returns to a usable state without phantom checkpoint.
- [x] Reload can rediscover pending checkpoint list.
- [x] Tests cover project switch and retry after failure.

## Edge Cases

- Abort races with success response.
- Pending checkpoint exists from previous session.
- Multiple Nova instances are mounted during development.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
