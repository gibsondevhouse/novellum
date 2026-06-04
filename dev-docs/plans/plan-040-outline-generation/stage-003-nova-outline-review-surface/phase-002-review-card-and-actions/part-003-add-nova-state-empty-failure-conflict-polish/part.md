---
title: Add Nova Empty, Failure, and Conflict Polish
slug: part-003-add-nova-state-empty-failure-conflict-polish
part_number: 3
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-review-card-and-actions
started_at: 2026-06-03T14:59:19-04:00
completed_at: 2026-06-03T15:04:08-04:00
estimated_duration: 0.5d
---

## Objective

Ensure all review workflow states are complete, legible, token-driven, and non-destructive.

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

1. Add precise copy for empty, loading, failure, conflict-blocked, rejected, and accepted states.
2. Use existing badge/button/tile variants where possible.
3. Add accessible labels and keyboard-reachable actions.
4. Capture visual/manual evidence.

## Files

**Create:**

- `tests/nova/outline-generation-ux-states.test.ts`

**Update:**

- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] No state leaves author without next action or explanation.
- [x] Conflict-blocked state cannot be mistaken for success.
- [x] A11y labels exist for primary actions.
- [x] Token gate remains clean.

## Edge Cases

- Screen width constrained sidepanel.
- Keyboard-only user reviews and rejects checkpoint.
- Long validation error list.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
