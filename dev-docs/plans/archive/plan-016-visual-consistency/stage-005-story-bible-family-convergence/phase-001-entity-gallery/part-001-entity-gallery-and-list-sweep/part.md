---
title: Entity Gallery & List Sweep
slug: part-001-entity-gallery-and-list-sweep
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-entity-gallery
started_at: 2026-04-25 19:30 EDT
completed_at: 2026-04-25 19:40 EDT
estimated_duration: 2d
---

## Objective

Unify gallery / list surfaces across Individuals, Factions, Lineages, Realms, Landmarks, Myths, Technology, Traditions.

## Scope

**In scope:**

- Promote (or confirm) `EntityGallery` layout and `EntityCard`.
- Unify list / grid toggle affordance and filter treatment.
- Migrate all eight entity surfaces.

**Out of scope:**

- Detail / form surfaces (phase 002).

## Implementation Steps

1. Confirm / promote gallery and card primitives.
2. Migrate per-entity gallery routes.
3. Unify list/grid toggle and filter UI.
4. Screenshot evidence for at least three entity types.

## Files

**Update:**

- Gallery/list routes under `src/routes/app/bible/**` and `src/modules/bible/**`.

## Acceptance Criteria

- [x] One `EntityGallery` and one `EntityCard` in use everywhere.
- [x] Filter / toggle treatments identical.

## Edge Cases

- Entities with images (e.g., landmarks) keep image affordance via card slots, not local layout.

## Notes

- Follow `.github/skills/story-bible/SKILL.md`.
