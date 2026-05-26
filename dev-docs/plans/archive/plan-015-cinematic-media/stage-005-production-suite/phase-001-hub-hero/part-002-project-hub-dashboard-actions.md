---
title: Project Hub Dashboard and Actions
slug: part-002-project-hub-dashboard-actions
part_number: 2
status: in-progress
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-001-hub-hero
estimated_duration: 2d
---

# Part-002: Project Hub Dashboard and Actions

## Objective

Refactor project hub metrics, details, and utility actions into a cohesive production dashboard.

## Scope

In scope: structural metrics carousel, progress card, next-step card, details panel, export/delete action bar.

Out of scope: changing metric calculations or export behavior.

## Implementation Steps

1. Convert word/progress metrics to `StatusRing` or a documented premium progress primitive.
2. Refactor structural metrics to align with visual instrumentation and rail/card rules.
3. Move export/delete actions into `CommandDock` or `GlassBar`.
4. Ensure details editing uses shared form/action styling.
5. Test planning, drafting, completed, archived, zero target count, and high progress states.

## Files

Update:

- `src/modules/project/components/StructuralMetricsCarousel.svelte`
- `src/modules/project/components/StructuralMetricCard.svelte`
- `src/modules/project/components/HubProgressCard.svelte`
- `src/modules/project/components/HubNextStepCard.svelte`
- `src/modules/project/components/HubDetailsPanel.svelte`
- `src/modules/project/components/HubActionBar.svelte`

## Acceptance Criteria

- [ ] Dashboard metrics are readable by text and visual form.
- [ ] Action surface is clear and not dominant.
- [ ] Hub grid remains stable across viewport sizes.
- [ ] Destructive action remains clearly separated from primary creative actions.

## Edge Cases

- Target word count of zero/null must not break progress math or visual indicators.
