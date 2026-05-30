---
title: Workflow Config
slug: phase-002-workflow-config
phase_number: 2
status: complete
owner: Architect Agent
stage: stage-001-foundation-refactor
parts:
  - part-001-create-worldbuilding-sequence
  - part-002-define-domain-taxonomy
  - part-003-add-prompt-seeds
estimated_duration: 1.5d
---

## Goal

Define the worldbuilding order-of-operations as a static, testable config object. Create domain taxonomy and per-section prompt seeds that are reusable by both the UI layer and the generation pipeline.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Create Worldbuilding Sequence](part-001-create-worldbuilding-sequence/part.md) | `draft` | — | 0.5d |
| 002 | [Define Domain Taxonomy](part-002-define-domain-taxonomy/part.md) | `draft` | — | 0.5d |
| 003 | [Add Prompt Seeds](part-003-add-prompt-seeds/part.md) | `draft` | — | 0.5d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] `src/modules/world-building/worldbuilding-workflow.ts` exports a typed sequence config
- [ ] Each domain entry includes: `id`, `label`, `sequenceNumber`, `dependencyIds`, `generationReadiness`, `promptSeed`, `targetEntities`
- [ ] Prompt seed constants defined for all 5 domains (personae, atlas, archive, threads, chronicles)
- [ ] No hardcoded sequence logic remains in `+page.svelte` or `worldbuilding-navigation.ts`
- [ ] Config is unit-testable (no Svelte/DOM dependencies)
- [ ] `pnpm check` and `pnpm test` pass

## Notes

The sequence is: Personae → Atlas → Archive → Threads → Chronicles.

This config is the single source of truth referenced by:

- Stage 002 UI tiles (readiness badges, dependency copy)
- Stage 003 pipeline (context grounding, missing-context checks)
- Future agents that need to know generation order

Anchor point: `src/modules/world-building/worldbuilding-navigation.ts` already centralizes domain config. The new workflow file extends that pattern rather than replacing it.
