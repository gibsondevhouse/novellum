# Outline Generation Prompt Validation — 2026-06-03

## Scope

Implemented `src/lib/ai/pipeline/outline-generation-prompt.ts` and documented the prompt contract in `dev-docs/03-ai/prompt-system.md`.

## Contract

The prompt bundle provides:

- fixed `ROLE`, `TASK`, `CONTEXT`, `CONSTRAINTS`, and `OUTPUT FORMAT` sections
- `outlineContextPacket` JSON as scoped context
- explicit author-agency wording: generated outlines remain proposals until accepted
- constraints forbidding canonical writes, hierarchy mutation, and manuscript edits
- two-pass intent in one prompt: structure spine, then scene-intent cards
- OpenRouter/OpenAI-compatible `json_schema` response format for `OutlineDraft`
- one bounded repair prompt that reuses the same context hash and fixes schema validation issues only

The response schema requires nested `arcs[] -> acts[] -> chapters[] -> scenes[]`; every scene requires `intent.goal`, `intent.conflict`, `intent.turn`, and `intent.outcome`.

## Edge Cases Covered

- Model ignores JSON schema: bounded repair prompt asks for schema repair only.
- Prompt context includes no manuscript scene content from the context packet.
- Repair prompt does not invite new facts or new canon.
- Fixed root values use `enum` instead of `const` for provider compatibility.

## Verification

- `pnpm test tests/ai/pipeline/outline-generation-prompt.test.ts`
  - Pass, 1 file / 7 tests.
- `pnpm check`
  - Pass, 0 errors.
  - 11 pre-existing Svelte warnings in world-building components/help page.
- `pnpm lint`
  - Pass.
- `pnpm test tests/ai/pipeline/outline-generation-prompt.test.ts tests/ai/pipeline/outline-context-builder.test.ts tests/ai/pipeline/outline-context-sufficiency.test.ts tests/ai/pipeline/context-hierarchy-mapping.test.ts tests/ai/pipeline/outline-draft-contract.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts`
  - Pass, 6 files / 44 tests.

No UI/style files changed; `pnpm lint:css` and `pnpm check:tokens` were not applicable.
