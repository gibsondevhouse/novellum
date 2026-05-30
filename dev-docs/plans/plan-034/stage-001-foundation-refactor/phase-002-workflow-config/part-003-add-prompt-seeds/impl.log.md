## 2026-05-30

Added five new prompt seeds to `PROMPT_SEEDS` in `src/lib/ai/pipeline/prompt-library-seeds.ts`: `worldbuilding.generate.personae`, `worldbuilding.generate.atlas`, `worldbuilding.generate.archive`, `worldbuilding.generate.threads`, `worldbuilding.generate.chronicles`. Each has ROLE, TASK, five CONSTRAINTS, and `outputFormat: 'json_worldbuild_populated_bible'`. Added `promptSeedKey` field to `WorldbuildingDomainConfig` with values filled for all five domains. `pnpm check` passes.
