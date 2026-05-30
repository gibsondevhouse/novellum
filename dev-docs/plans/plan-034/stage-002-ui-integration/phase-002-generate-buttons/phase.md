---
title: Generate Buttons
slug: phase-002-generate-buttons
phase_number: 2
status: draft
owner: Architect Agent
stage: stage-002-ui-integration
parts:
  - part-001-wire-generate-to-nova-prefill
  - part-002-add-idle-disabled-states
  - part-003-add-section-readiness-checks
estimated_duration: 2d
---

## Goal

Wire the Generate action on each domain tile to open Nova with a section-specific prefilled prompt. Add idle/disabled states and readiness checks so that buttons are correctly gated when upstream context is absent.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Wire Generate to Nova Prefill](part-001-wire-generate-to-nova-prefill/part.md) | `draft` | — | 0.75d |
| 002 | [Add Idle & Disabled States](part-002-add-idle-disabled-states/part.md) | `draft` | — | 0.5d |
| 003 | [Add Section Readiness Checks](part-003-add-section-readiness-checks/part.md) | `draft` | — | 0.75d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Clicking Generate on each domain tile opens Nova with the correct section-specific prompt seed
- [ ] Nova opens in `write` or `agent` mode (not chat)
- [ ] Buttons are disabled when the project has no premise or outline
- [ ] Buttons for dependent domains are disabled until upstream domains have records (e.g. Atlas disabled until Personae has at least one entry)
- [ ] Disabled state shows a tooltip/message explaining what's missing
- [ ] `startWorldbuildWithNova()` function uses prompt seeds from the workflow config (not inline strings)
- [ ] No DB writes occur at this stage
- [ ] `pnpm check`, `pnpm lint`, `pnpm test` pass

## Notes

**Depends on stage-001-phase-002** for prompt seed constants.
**Depends on phase-001** for the tile action wiring.

The existing `startWritingWithNova()` function in the current page is the mechanical anchor. This phase renames and extends it into per-domain functions using the prompt seeds from the workflow config.

**Key files touched:**

- `src/modules/world-building/worldbuilding-generate-actions.ts` (new)
- `src/modules/world-building/worldbuilding-readiness.ts` (new)
- `src/routes/projects/[id]/world-building/+page.ts` (new)
- `src/routes/projects/[id]/world-building/+page.svelte` (updated)

**Non-goals for this phase:** artifact creation, review cards, DB writes, state machine. Those belong in stage-003.
