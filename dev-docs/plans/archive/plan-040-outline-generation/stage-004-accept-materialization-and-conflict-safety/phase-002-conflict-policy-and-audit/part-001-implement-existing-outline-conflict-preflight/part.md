---
title: Implement Existing Outline Conflict Preflight
slug: part-001-implement-existing-outline-conflict-preflight
part_number: 1
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-conflict-policy-and-audit
started_at: 2026-06-04T11:41:00-04:00
completed_at: 2026-06-04T11:50:00-04:00
estimated_duration: 0.5d
---

## Objective

Detect populated outlines and block accept/materialization unless a future non-destructive mode is explicitly implemented.

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

1. Define populated-outline query against current hierarchy tables.
2. Expose safe conflict result for generate/review UI.
3. Block destructive accept when existing hierarchy would be overwritten or duplicated.
4. Keep generated checkpoint reviewable even when accept is blocked.

## Files

**Create:**

- `src/lib/server/outline/outline-conflict-preflight.ts`
- `tests/server/outline/outline-conflict-preflight.test.ts`

**Update:**

- `src/routes/api/ai/outline/generate/+server.ts`
- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] Empty hierarchy allows accept.
- [x] Populated hierarchy blocks accept with structured conflict code.
- [x] Generate route can warn/confirm review-only generation when applicable.
- [x] Tests cover empty, partial, and populated hierarchy states.

## Edge Cases

- Hierarchy contains only orphaned legacy rows.
- A user manually edits outline after generation but before accept.
- Two tabs race accept against manual creation.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
