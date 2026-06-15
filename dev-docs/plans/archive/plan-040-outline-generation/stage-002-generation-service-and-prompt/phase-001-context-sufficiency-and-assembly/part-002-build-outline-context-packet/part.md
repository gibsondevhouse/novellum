---
title: Build Outline Context Packet
slug: part-002-build-outline-context-packet
part_number: 2
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-context-sufficiency-and-assembly
started_at: 2026-06-03T13:48:00-04:00
completed_at: 2026-06-03T13:57:00-04:00
estimated_duration: 0.5d
---

## Objective

Assemble the scoped context packet used by the outline generation prompt without sending the full manuscript.

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

1. Collect project title, genre, logline, synopsis summary/hash, and relevant planning notes.
2. Collect accepted worldbuilding canon and accepted worldbuild checkpoints.
3. Add deterministic source references for traceability.
4. Trim and rank context by relevance before prompt construction.

## Files

**Create:**

- `src/lib/ai/pipeline/outline-context-builder.ts`
- `tests/ai/pipeline/outline-context-builder.test.ts`

**Update:**

- `src/lib/ai/context-engine.ts`
- `src/lib/ai/pipeline/index.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [ ] Context packet is deterministic for stable inputs.
- [ ] Full manuscript text is never included.
- [ ] Context packet includes source references for review/audit.
- [ ] Tests cover canonical rows, accepted checkpoints, and mixed-source projects.

## Edge Cases

- Context exceeds token budget.
- Conflicting worldbuilding facts appear in canon and checkpoint history.
- Project metadata is missing optional fields.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
