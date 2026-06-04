---
title: Implement Outline Generation Route
slug: part-002-implement-outline-generation-route
part_number: 2
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-provider-route-and-schema-output
started_at: 2026-06-03T14:02:00-04:00
completed_at: 2026-06-03T14:10:00-04:00
estimated_duration: 1d
---

## Objective

Add the server route/service that runs outline generation through the existing AI pipeline and persists valid output as a checkpoint.

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

1. Add route input validation for `projectId`, optional instruction, and confirmation flags.
2. Run context sufficiency before provider call.
3. Invoke PromptBuilder/ModelRouter/OpenRouter, not direct SDKs.
4. Validate output; run one repair attempt for schema-only failures.
5. Persist only valid `OutlineDraft` checkpoints.

## Files

**Create:**

- `src/routes/api/ai/outline/generate/+server.ts`
- `tests/routes/outline-generation.test.ts`

**Update:**

- `src/lib/ai/model-router.ts`
- `src/lib/ai/pipeline/index.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [ ] Missing API key returns safe provider/credential error.
- [ ] Low-context request returns prerequisite errors and no provider call.
- [ ] Valid provider response creates checkpoint only.
- [ ] Invalid provider response returns validation failure and no hierarchy write.
- [ ] Raw provider output is not leaked in production response.

## Edge Cases

- Abort/cancel during provider request.
- Provider returns partial JSON.
- Project is deleted between preflight and persistence.
- Concurrent generation requests for same project.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
