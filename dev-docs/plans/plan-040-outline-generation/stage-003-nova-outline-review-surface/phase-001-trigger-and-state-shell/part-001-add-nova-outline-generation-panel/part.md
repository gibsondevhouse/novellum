---
title: Add Nova Outline Generation Panel
slug: part-001-add-nova-outline-generation-panel
part_number: 1
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-trigger-and-state-shell
started_at: 2026-06-03T14:20:43-04:00
completed_at: 2026-06-03T14:31:00-04:00
estimated_duration: 0.5d
---

## Objective

Add the Nova surface for outline generation readiness, prerequisites, and trigger controls.

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

1. Render readiness based on context sufficiency result.
2. Show missing-prerequisite checklist when blocked.
3. Add generate button with duplicate-run prevention.
4. Use design tokens and existing Nova layout primitives only.

## Files

**Create:**

- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
- `tests/nova/NovaOutlineGenerationPanel.test.ts`

**Update:**

- `src/modules/nova/components/NovaAuthorDraftEngine.svelte`
- `src/modules/nova/index.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Empty/blocked/ready states render with distinct copy.
- [x] Generate is disabled when prerequisites are missing or a run is active.
- [x] No hardcoded colors/spacing are introduced.
- [x] Tests cover blocked, ready, running, and failed trigger states.

## Edge Cases

- Project changes while panel is mounted.
- Context sufficiency response is stale.
- User opens Nova without active project.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
