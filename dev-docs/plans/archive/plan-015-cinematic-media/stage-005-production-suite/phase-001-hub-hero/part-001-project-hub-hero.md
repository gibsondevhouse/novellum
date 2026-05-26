---
title: Project Hub Hero
slug: part-001-project-hub-hero
part_number: 1
status: in-progress
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-001-hub-hero
estimated_duration: 2d
---

# Part-001: Project Hub Hero

## Objective

Replace the project hub top section with a cover-led cinematic story identity hero.

## Scope

In scope: hero layout, cover/fallback art, title/genre/logline/synopsis treatment, edit affordances, responsive behavior.

Out of scope: changing project metadata persistence.

## Implementation Steps

1. Adapt `ProjectHubHero`, `ProjectHeroCover`, and `ProjectHeroContent` around `SpotlightHero`.
2. Preserve current inline edit behavior or move edit affordances into a clear drawer/action pattern.
3. Ensure cover upload remains accessible.
4. Handle missing cover, missing genre, missing logline, and missing synopsis gracefully.
5. Validate first-viewport composition at mobile and desktop widths.

## Files

Update:

- `src/routes/projects/[id]/hub/+page.svelte`
- `src/modules/project/components/ProjectHubHero.svelte`
- `src/modules/project/components/ProjectHeroCover.svelte`
- `src/modules/project/components/ProjectHeroContent.svelte`
- `src/modules/project/components/ProjectHeroSynopsis.svelte`

## Acceptance Criteria

- [ ] Hub hero communicates story identity immediately.
- [ ] Coverless projects use deterministic fallback art.
- [ ] Edit/upload actions are visible, keyboard accessible, and not visually noisy.
- [ ] Long metadata does not overlap actions.

## Edge Cases

- Missing synopsis should show a polished prompt, not a dashed utility box that breaks the hero aesthetic.
