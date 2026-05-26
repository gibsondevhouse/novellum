---
title: Location & Lore CRUD
slug: part-002-location-and-lore-crud
part_number: 2
status: complete
owner: Frontend Agent
phase: phase-002-story-bible-ui
estimated_duration: 1d
---

## Objective

Build Location and Lore Entry sections of the Story Bible. Locations are browsable by name; Lore Entries are filterable by `category`. Both support full CRUD.

## Context

- `dev-docs/data-model.md` §Location, §LoreEntry
- `src/modules/bible/services/location-repository.ts` and `lore-repository.ts` (plan-002)
- `src/modules/bible/stores/bible-store.ts` — extend with location and lore actions

## Target Files

| File                                                          | Action              |
| ------------------------------------------------------------- | ------------------- |
| `src/routes/(app)/projects/[id]/bible/locations/+page.svelte` | Create (≤150 lines) |
| `src/routes/(app)/projects/[id]/bible/lore/+page.svelte`      | Create (≤150 lines) |
| `src/modules/bible/components/LocationForm.svelte`            | Create              |
| `src/modules/bible/components/LoreEntryForm.svelte`           | Create              |

## Location Form Fields

`name` (required), `description`, `tags[]`, `notes`

## Lore Entry Form Fields

`title` (required), `category` (required — e.g. "magic", "history", "faction"), `description`, `rules[]`, `relatedEntityIds[]`

## Acceptance Criteria

- [ ] Location list shows all locations for active project; supports create/edit/delete
- [ ] Lore list shows all lore entries; category filter pill buttons filter the list in real time
- [ ] `relatedEntityIds` in lore form allows multi-select from a list of project entity IDs (characters + locations + plot threads)
- [ ] Both forms validate required fields before submit
- [ ] `pnpm run check` exits clean
- [ ] All `+page.svelte` files ≤150 lines

## Out of Scope

- Location map visualization — Path 4
- Lore graph / network view — Path 4
