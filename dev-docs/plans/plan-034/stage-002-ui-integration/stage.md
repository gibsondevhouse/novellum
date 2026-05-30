---
title: UI Integration
slug: stage-002-ui-integration
stage_number: 2
status: complete
owner: Planner Agent
plan: plan-034
phases:
  - phase-001-domain-tiles-refactor
  - phase-002-generate-buttons
estimated_duration: 4d
risk_level: low
---

## Goal

Refactor worldbuilding domain tiles to surface action trio (open/help/generate), add readiness badges and completion counts, and wire generate buttons to open Nova with prefilled section-specific prompts.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Domain Tiles Refactor](phase-001-domain-tiles-refactor/phase.md) | `complete` | 2d |
| 002 | [Generate Buttons](phase-002-generate-buttons/phase.md) | `complete` | 2d |

## Entry Criteria

- Stage 001 (Foundation Refactor) is complete
- `src/modules/world-building/worldbuilding-workflow.ts` exports `WORLDBUILDING_DOMAIN_SEQUENCE` with all five domains
- `src/lib/ai/pipeline/prompt-library-seeds.ts` includes all five domain prompt seeds
- `src/routes/projects/[id]/world-building/+page.svelte` has `startWorldbuildWithNova()` (renamed from stage-001-phase-003)

## Exit Criteria

- All phases complete
- Domain tiles surface open/help/generate actions
- Readiness badges display correctly based on dependencies
- Generate buttons open Nova with prefilled prompts
- Buttons are disabled when context is missing
- All tests pass
- Visual design matches system

## Notes

**Risk:** Very low. This stage does not introduce new AI behavior or database writes. Generate buttons are **read-only UI actions** that only open Nova with prefilled text. No mutations occur on this stage.

**User experience:** By the end of this stage, users see a visibly reorganized, action-rich worldbuilding hub with clear affordances for generation without feeling disruptive.

**Sequencing:** This stage validates that users engage with Nova via prefilled prompts before the pipeline stage attempts to automate artifact creation.

**Key files delivered by this stage:**

- `src/routes/projects/[id]/world-building/+page.ts` (new)
- `src/modules/world-building/components/WorldbuildingDomainTile.svelte` (new, if tile is extracted)
- `src/modules/world-building/components/WorldbuildingReadinessBadge.svelte` (new)
- `src/modules/world-building/worldbuilding-generate-actions.ts` (new)
- `src/modules/world-building/worldbuilding-readiness.ts` (new)
