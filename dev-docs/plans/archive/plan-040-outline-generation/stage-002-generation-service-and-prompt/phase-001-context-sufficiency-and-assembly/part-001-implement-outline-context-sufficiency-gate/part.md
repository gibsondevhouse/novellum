---
title: Implement Outline Context Sufficiency Gate
slug: part-001-implement-outline-context-sufficiency-gate
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-context-sufficiency-and-assembly
started_at: 2026-06-03T13:38:00-04:00
completed_at: 2026-06-03T13:46:00-04:00
estimated_duration: 0.5d
---

## Objective

Define the minimum worldbuilding and project metadata required before outline generation can run.

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

1. Define required and enriching context bands.
2. Require at minimum project identity plus primary story premise and at least one character or plot thread source.
3. Return structured missing-prerequisite codes for UI rendering.
4. Keep thresholds deterministic and testable.

## Files

**Create:**

- `src/lib/ai/pipeline/outline-context-sufficiency.ts`
- `tests/ai/pipeline/outline-context-sufficiency.test.ts`

**Update:**

- `dev-docs/03-ai/context-engine.md`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [ ] Empty project is blocked.
- [ ] Project with only title is blocked.
- [ ] Project with premise plus character/plot thread is allowed.
- [ ] Missing prerequisite messages are user-safe and specific.

## Edge Cases

- Worldbuilding exists only as accepted checkpoints, not canonical rows.
- Synopsis is very long and must be summarized/hash-referenced.
- Context source contains malformed legacy JSON.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
