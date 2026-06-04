# Sufficiency Gate Validation — 2026-06-03

## Scope

Implemented `src/lib/ai/pipeline/outline-context-sufficiency.ts` as a pure, deterministic outline-generation readiness gate.

## Contract

Required bands:

- `project_identity`: project id and title.
- `primary_story_premise`: project premise, logline, story-frame premise, accepted premise checkpoint, or synopsis.
- `character_or_plot_thread`: at least one canonical or accepted-checkpoint character / plot thread source.

Enriching bands counted but not required:

- locations
- factions
- lore entries
- timeline events
- themes

UI-safe missing codes:

- `project_identity_missing`
- `story_premise_missing`
- `story_source_missing`

Warnings:

- `malformed_legacy_json` ignores unreadable legacy JSON without exposing raw payload content.

## Edge Cases Covered

- Empty project is blocked.
- Project with only identity is blocked.
- Project with premise plus character is allowed.
- Project with premise plus plot thread is allowed.
- Story-frame premise metadata can satisfy the premise requirement.
- Accepted checkpoints can satisfy premise and story-source requirements when canonical rows are absent.
- Accepted personae checkpoints can satisfy character-source requirements.
- Non-accepted checkpoints do not satisfy required story-source context.
- Very long synopsis is summarized and hash/length referenced.
- Malformed legacy JSON is ignored with a safe warning.

## Verification

- `pnpm test tests/ai/pipeline/outline-context-sufficiency.test.ts`
  - Initial run failed on one test expectation because the gate trims text before length reporting.
  - Expectation corrected to assert trimmed length.
  - Final result: pass, 1 file / 8 tests.
- `pnpm check`
  - Pass, 0 errors.
  - 11 pre-existing Svelte warnings in world-building components/help page.
- `pnpm lint`
  - Pass.
- `pnpm test tests/ai/pipeline/outline-context-sufficiency.test.ts tests/ai/pipeline/outline-draft-contract.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts`
  - Final result after coverage additions: pass, 3 files / 24 tests.

No UI/style files changed; `pnpm lint:css` and `pnpm check:tokens` were not applicable.
