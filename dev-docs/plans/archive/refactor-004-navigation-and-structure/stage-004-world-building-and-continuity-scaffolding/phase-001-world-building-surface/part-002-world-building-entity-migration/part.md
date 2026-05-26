---
title: World Building Entity Migration
slug: part-002-world-building-entity-migration
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-world-building-surface
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create entity detail sub-routes under `/world-building/` for all five entity types (characters, locations, lore, plot-threads, timeline). Add SvelteKit redirects from all `/bible/**` routes to their `/world-building/**` equivalents. Verify full CRUD flow for one entity type.

## Context

- Bible entity detail routes: `characters/[charId]/`, `locations/[locId]/`, `lore/[loreId]/`, `plot-threads/[threadId]/`, `timeline/[eventId]/`
- Bible entity components: `CharacterCard`, `CharacterForm`, `LocationForm`, `LoreEntryForm`, `PlotThreadForm`, `TimelineEventForm` — all in `src/modules/bible/components/`
- Old routes (`/bible/**`) must redirect to new routes (`/world-building/**`) — use the same 307 redirect pattern as previous route migrations

## Scope

**In scope:**

- Create entity detail sub-routes under `/world-building/[entity-type]/[entityId]/`
- Add redirects from `/bible/` and all sub-routes to `/world-building/` equivalents
- Verify one full CRUD flow (Characters)

**Out of scope:**

- Redesigning entity forms or card layouts
- Adding new entity types
- `src/modules/bible/` rename

## Implementation Steps

1. Create entity detail routes for each type:
   - `src/routes/projects/[id]/world-building/characters/[charId]/+page.svelte` — renders `CharacterForm` or character detail from `src/modules/world-building/`
   - `src/routes/projects/[id]/world-building/characters/[charId]/+page.ts` — load character data
   - Repeat for `locations/[locId]`, `lore/[loreId]`, `plot-threads/[threadId]`, `timeline/[eventId]`

2. Add redirects from Bible routes to World Building routes:
   - `src/routes/projects/[id]/bible/+page.ts`: redirect to `/world-building`
   - `src/routes/projects/[id]/bible/characters/+page.ts`: redirect to `/world-building/characters`
   - `src/routes/projects/[id]/bible/characters/[charId]/+page.ts`: redirect to `/world-building/characters/${params.charId}`
   - Repeat pattern for all entity sub-routes and detail routes

3. Check for hardcoded `/bible` path strings in any component file:
   - Run: `grep -r '"/bible' src/modules/bible/` and `grep -r '"/bible' src/routes/` to find any router.push or href strings referencing the old path
   - Update any found to use `/world-building` equivalents

4. Verify Characters CRUD:
   - Navigate to `/projects/[id]/world-building/characters` — list renders
   - Click a character — detail page at `/world-building/characters/[charId]` renders
   - Edit works (if edit form is in the detail page)
   - Navigate to old URL `/projects/[id]/bible/characters` — redirects to `/world-building/characters`

## Files

**Create:**

- Entity detail `+page.svelte` and `+page.ts` for each of: `characters/[charId]`, `locations/[locId]`, `lore/[loreId]`, `plot-threads/[threadId]`, `timeline/[eventId]`

**Update:**

- Bible route `+page.ts` files — add redirects to world-building equivalents
- Any Bible module component files with hardcoded `/bible` paths

## Acceptance Criteria

- [ ] All five entity types have detail route pages under `/world-building/`
- [ ] Navigating to `/projects/[id]/bible/` and all sub-routes redirects to `/world-building/` equivalents
- [ ] Characters full CRUD verified on new route
- [ ] No hardcoded `/bible` path strings in component files
- [ ] `pnpm run check` exits clean

## Edge Cases

- If entity detail pages contain `goto('/bible/...')` calls or similar programmatic navigation, update to world-building paths
- `+page.svelte` files at Bible routes that existed only as empty shells (for the SvelteKit route to work) must still exist (or be preserved) to avoid route errors; the redirect is in `+page.ts`

## Notes

- `src/modules/bible/` is not deleted — it remains as the implementation source; `src/modules/world-building/` is the product-level proxy
- The entity forms and cards are used as-is; this is a route migration, not a component redesign
