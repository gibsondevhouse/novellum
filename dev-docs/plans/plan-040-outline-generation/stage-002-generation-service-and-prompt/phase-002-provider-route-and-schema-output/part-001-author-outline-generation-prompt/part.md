---
title: Author Outline Generation Prompt
slug: part-001-author-outline-generation-prompt
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-002-provider-route-and-schema-output
started_at: 2026-06-03T13:59:00-04:00
completed_at: 2026-06-03T14:02:00-04:00
estimated_duration: 0.5d
---

## Objective

Create the ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT prompt and JSON schema used for outline generation.

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

1. Write prompt builder with explicit author-agency and no-manuscript-mutation constraints.
2. Encode two-pass intent: structure spine then scene-intent cards, even if executed in one route.
3. Attach JSON schema/response format expected by ModelRouter/OpenRouter.
4. Add repair-prompt copy for one bounded retry.

## Files

**Create:**

- `src/lib/ai/pipeline/outline-generation-prompt.ts`
- `tests/ai/pipeline/outline-generation-prompt.test.ts`

**Update:**

- `dev-docs/03-ai/prompt-system.md`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [ ] Prompt includes ROLE, TASK, CONTEXT, CONSTRAINTS, OUTPUT sections.
- [ ] Prompt forbids direct canon writes and manuscript mutation.
- [ ] Output schema requires arcs, acts, chapters, scenes, and scene intent.
- [ ] Tests snapshot structural prompt sections without overfitting full prose.

## Edge Cases

- Model ignores JSON schema.
- Prompt becomes too long with source context.
- Repair prompt accidentally invites new content not grounded in context.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
