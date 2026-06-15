---
title: Add Outline Checkpoint Owner and Helpers
slug: part-001-add-outline-checkpoint-owner-and-helpers
part_number: 1
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-checkpoint-storage-lifecycle
started_at: 2026-06-03T17:27:00Z
completed_at: 2026-06-03T17:29:00Z
estimated_duration: 0.5d
---

## Objective

Introduce metadata helpers for upsert/list/review/accept/reject operations scoped to outline checkpoints.

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

1. Define an outline checkpoint owner constant distinct from worldbuild and draft owners.
2. Add typed wrappers around existing project metadata mutation route.
3. Keep wrappers SSR-safe where read-only defaults are needed.
4. Do not expose hierarchy materialization in client helpers.

## Files

**Create:**

- `src/lib/ai/pipeline/outline-checkpoint-contract.ts`
- `tests/ai/pipeline/outline-checkpoint-contract.test.ts`

**Update:**

- `src/lib/project-metadata.ts`
- `src/lib/ai/pipeline/index.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Outline checkpoint helper names are explicit and do not overload worldbuild helpers.
- [x] Rejected checkpoints cannot be accepted through helper type contracts without route validation.
- [x] Tests verify operation body shapes and owner defaults.

## Edge Cases

- SSR tries to mutate a checkpoint.
- Checkpoint owner collision with worldbuild/draft records.
- Consumer passes malformed checkpoint ID.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
