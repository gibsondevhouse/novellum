---
title: World Overview and Domain Landings
slug: part-001-world-overview-and-domain-landings
part_number: 1
status: complete
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-001-world-overview
estimated_duration: 2d
---

# Part-001: World Overview and Domain Landings

## Objective

Refactor world-building overview and top-section landing pages into cinematic domain gateways.

## Scope

In scope: `/world-building`, Personae/Atlas/Archive/Threads/Chronicles landing routes, domain tiles, orientation copy, navigation.

Out of scope: entity detail form refactors.

## Implementation Steps

1. Replace heavy prose blocks with focused `SpotlightHero` and `VisualTile` domain sections.
2. Preserve the semantic meaning of each domain.
3. Use consistent sticky or glass navigation for domain jumps.
4. Ensure legacy route redirects land cleanly.
5. Validate mobile stacking and long orientation copy.

## Files

Update likely:

- `src/routes/projects/[id]/world-building/+page.svelte`
- `src/modules/bible/components/WorldBuildingTopSectionLanding.svelte`
- `src/modules/bible/components/WorldBuildingSubheaderNav.svelte`
- World-building section route pages.

## Acceptance Criteria

- [ ] Each domain has distinct visual identity within one coherent system.
- [ ] Domain routes expose obvious next actions.
- [ ] Orientation content supports authors without overwhelming the first viewport.

## Edge Cases

- Domain nav must remain usable on narrow screens without horizontal clipping.
