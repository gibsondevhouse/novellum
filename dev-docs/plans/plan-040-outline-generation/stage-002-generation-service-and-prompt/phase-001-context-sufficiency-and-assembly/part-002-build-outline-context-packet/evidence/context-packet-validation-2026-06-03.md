# Context Packet Validation — 2026-06-03

## Scope

Implemented `src/lib/ai/pipeline/outline-context-builder.ts` and wired `outline_scope` contexts to attach an `outlineContextPacket`.

## Contract

The packet includes:

- project id, title, genre, logline, target word count, status, project type, and synopsis summary/hash metadata
- story-frame and outline planning-note summaries
- ranked canonical worldbuilding entries
- ranked accepted-checkpoint worldbuilding entries
- checkpoint summaries
- deterministic source references for traceability
- sufficiency gate result from Part 001
- context hash and budget metadata

The packet intentionally excludes scene manuscript content. `outline_scope` continues to strip scene content, and packet tests assert that deliberately seeded manuscript text is absent from serialized output.

## Edge Cases Covered

- Stable inputs produce deterministic packet output and context hash.
- Canonical rows are represented with source references.
- Accepted checkpoints are represented with source references and checkpoint summaries.
- Accepted checkpoint-only projects can satisfy the packet readiness path.
- Mixed canonical and checkpoint sources are included together.
- Lower-priority sources are trimmed when the configured budget is exceeded.
- `buildOutlineContextPacketFromAiContext()` excludes scene content even when the input context has scenes.
- `buildContext()` attaches `outlineContextPacket` for `outline_scope` and loads accepted worldbuild checkpoints through project metadata.

## Verification

- `pnpm test tests/ai/pipeline/outline-context-builder.test.ts`
  - Pass, 1 file / 6 tests.
- `pnpm test tests/ai/pipeline/context-hierarchy-mapping.test.ts`
  - Pass, 1 file / 7 tests.
- `pnpm check`
  - Initial run found two new type issues:
    - `createOutlineContextTextReference()` default parameter inferred as literal `1200`.
    - domain `Project` was not assignable to a generic `JsonRecord`.
  - Both fixed.
  - Final result: pass, 0 errors.
  - 11 pre-existing Svelte warnings in world-building components/help page.
- `pnpm lint`
  - Pass.
- `pnpm test tests/ai/pipeline/outline-context-builder.test.ts tests/ai/pipeline/outline-context-sufficiency.test.ts tests/ai/pipeline/context-hierarchy-mapping.test.ts tests/ai/pipeline/outline-draft-contract.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts`
  - Pass, 5 files / 37 tests.

No UI/style files changed; `pnpm lint:css` and `pnpm check:tokens` were not applicable.
