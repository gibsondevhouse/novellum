---
title: Entity Dossiers and Collections
slug: part-002-entity-dossiers-and-collections
part_number: 2
status: complete
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-001-world-overview
estimated_duration: 3d
---

## Part-002: Entity Dossiers and Collections

## Objective

Refactor world-building entity collections and detail pages into production-grade visual dossiers.

## Scope

In scope: character/personae collections, detail headers, forms, relationship panels, location/lore/plot/timeline placeholders and real lists.

Out of scope: new entity data fields.

## Implementation Steps

1. Identify which entity collections should use posters, tiles, timelines, or dense tables.
2. Migrate collection cards to shared `EntityPoster` or domain wrappers.
3. Refactor detail pages around a visual dossier header and structured sections.
4. Align forms with shared input/action patterns.
5. Preserve save/delete/relationship behavior.
6. Validate empty, sparse, and populated entity states.

## Files

Update likely:

- `src/modules/bible/components/CharacterCard.svelte`
- `src/modules/bible/components/CharacterDetailHeader.svelte`
- `src/modules/bible/components/CharacterForm.svelte`
- `src/modules/bible/components/IndividualsDossier.svelte`
- `src/modules/bible/components/IndividualsWorkspaceShell.svelte`
- `src/modules/bible/components/WorldBuildingPlaceholderPage.svelte`
- Entity section route files under `src/routes/projects/[id]/world-building/`.

## Acceptance Criteria

- [ ] Entity details feel like dossiers, not raw forms.
- [ ] Collection pages have visual hierarchy and useful metadata.
- [ ] Delete confirmations and save states are polished.
- [ ] Dense collections remain navigable.

## Edge Cases

- Character/entity names and notes can be long; cards and dossier headers must clamp or wrap cleanly.
