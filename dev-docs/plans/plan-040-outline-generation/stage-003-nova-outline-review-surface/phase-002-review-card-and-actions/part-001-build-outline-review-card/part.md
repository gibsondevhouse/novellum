---
title: Build Outline Review Card
slug: part-001-build-outline-review-card
part_number: 1
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-review-card-and-actions
started_at: 2026-06-03T14:37:19-04:00
completed_at: 2026-06-03T14:44:00-04:00
estimated_duration: 0.5d
---

## Objective

Render the proposed Arc → Act → Chapter → Scene structure with per-scene intent fields and source context metadata.

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

1. Render hierarchical outline summary with collapsible sections where appropriate.
2. Show scene goal/conflict/turn/outcome fields.
3. Show source context summary and generated timestamp.
4. Label every item as proposed/pending until accepted.

## Files

**Create:**

- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `tests/nova/NovaOutlineDraftCheckpointCard.test.ts`

**Update:**

- `src/modules/nova/index.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] All required hierarchy levels render from a valid checkpoint.
- [x] Scene intent fields are visible and readable.
- [x] Accepted/rejected lifecycle variants render correctly.
- [x] Source-contract tests protect expected copy and actions.

## Edge Cases

- Large outline with many chapters/scenes.
- Long scene intent text.
- Checkpoint payload version is unknown.
- Checkpoint has validation warnings but is still reviewable.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
