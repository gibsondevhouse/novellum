---
title: Add Prompt Seeds
slug: part-003-add-prompt-seeds
part_number: 3
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-workflow-config
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Add five domain-scoped worldbuilding generation prompt seeds to `src/lib/ai/pipeline/prompt-library-seeds.ts` following the existing `PROMPT_SEEDS` object structure, and add a `promptSeedKey` field to each domain entry in `worldbuilding-workflow.ts`.

## Scope

**In scope:**

- Five new keys in `PROMPT_SEEDS`: `worldbuilding.generate.personae`, `worldbuilding.generate.atlas`, `worldbuilding.generate.archive`, `worldbuilding.generate.threads`, `worldbuilding.generate.chronicles`
- Each seed must have `role`, `task`, `constraints[]`, and `outputFormat` fields matching the existing `PromptScaffold` type
- Add `promptSeedKey: string` field to `WorldbuildingDomainConfig` and fill in each domain

**Out of scope:**

- Wiring seeds to Nova (stage-002-phase-002)
- Changes to the pipeline's generation flow

## Implementation Steps

1. Read `src/lib/ai/pipeline/prompt-library-seeds.ts` — verify `PROMPT_SEEDS` type and existing entry format.
2. Add five new entries to `PROMPT_SEEDS` with appropriate ROLE/TASK/CONSTRAINTS/OUTPUT for each domain.
3. For outputFormat, use the existing `json_worldbuild_populated_bible` or define a new domain-specific output format string (document the decision).
4. Open `src/modules/world-building/worldbuilding-workflow.ts`, add `promptSeedKey` to `WorldbuildingDomainConfig`, and fill in each domain's key.
5. Run `pnpm check`.
6. Save the new seed entries as a code snippet in `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/lib/ai/pipeline/prompt-library-seeds.ts` (add five domain seeds)
- `src/modules/world-building/worldbuilding-workflow.ts` (add `promptSeedKey` field)

## Acceptance Criteria

- [ ] All five seeds present in `PROMPT_SEEDS` with correct structure
- [ ] Each seed has ROLE, TASK, at least two CONSTRAINTS, and an outputFormat
- [ ] `promptSeedKey` field on all five domains in `WORLDBUILDING_DOMAIN_SEQUENCE`
- [ ] `pnpm check` passes
- [ ] Seed entries in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
