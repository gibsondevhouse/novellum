---
title: World Building Route Scaffold
slug: part-001-world-building-route-scaffold
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-world-building-surface
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create the `/projects/[id]/world-building` route with a landing hub page and entity sub-routes. Create `src/modules/world-building/index.ts` as a proxy barrel for the existing Bible module. Register the World Building surface so the sidebar item is active.

## Context

- The Bible surface currently lives at `src/routes/projects/[id]/bible/` with sub-routes: `characters/`, `locations/`, `lore/`, `plot-threads/`, `timeline/`
- `src/modules/bible/` contains all Bible entity components (`CharacterCard`, `CharacterForm`, `LocationForm`, etc.)
- World Building is the product-level name for this surface; the module implementation remains in `src/modules/bible/` for now
- `ActiveProjectSection` (Stage 001) already has a World Building item at `href="{base}/world-building"` — it just needs the route to exist
- The landing page pattern: section cards grid (one card per entity type) — same visual pattern as the existing Bible landing page

## Scope

**In scope:**

- Create `src/routes/projects/[id]/world-building/+page.svelte` — section card grid hub
- Create `src/routes/projects/[id]/world-building/+page.ts` — load project data
- Create sub-route list pages for each entity type under `/world-building/`
- Create `src/modules/world-building/index.ts` — proxy barrel for Bible module

**Out of scope:**

- Entity create/edit/delete feature changes
- `src/modules/bible/` rename or restructure
- Entity detail (`[entityId]`) sub-routes — Part 002

## Implementation Steps

1. Create `src/modules/world-building/index.ts`:

   ```ts
   // src/modules/world-building/index.ts
   // Proxy barrel — re-exports all public API from the bible module.
   // World Building is the product name for the entity management surface.
   export * from '../bible/index.ts';
   ```

   Verify `src/modules/bible/index.ts` exists. If it does not, create it with re-exports of all components in `src/modules/bible/components/`.

2. Create `src/routes/projects/[id]/world-building/+page.svelte`:
   - Section cards grid: Characters, Locations, Lore, Plot Threads, Timeline
   - Each card: title, brief description, icon, link to corresponding sub-route
   - Heading: "World Building"
   - Pattern mirrors the existing Bible landing page — do not redesign, only rename routes

3. Create `src/routes/projects/[id]/world-building/+page.ts`:
   - Load function: load project data (same pattern as Bible `+page.ts`)

4. Create list sub-routes. Each can be a minimal `+page.svelte` importing the relevant list component from `src/modules/world-building/` (which proxies through to Bible components):
   - `src/routes/projects/[id]/world-building/characters/+page.svelte` — character list
   - `src/routes/projects/[id]/world-building/locations/+page.svelte` — location list
   - `src/routes/projects/[id]/world-building/lore/+page.svelte` — lore list
   - `src/routes/projects/[id]/world-building/plot-threads/+page.svelte` — plot threads list
   - `src/routes/projects/[id]/world-building/timeline/+page.svelte` — timeline view
   - Create corresponding `+page.ts` files for each

## Files

**Create:**

- `src/modules/world-building/index.ts`
- `src/routes/projects/[id]/world-building/+page.svelte`
- `src/routes/projects/[id]/world-building/+page.ts`
- `src/routes/projects/[id]/world-building/characters/+page.svelte`
- `src/routes/projects/[id]/world-building/characters/+page.ts`
- `src/routes/projects/[id]/world-building/locations/+page.svelte`
- `src/routes/projects/[id]/world-building/locations/+page.ts`
- `src/routes/projects/[id]/world-building/lore/+page.svelte`
- `src/routes/projects/[id]/world-building/lore/+page.ts`
- `src/routes/projects/[id]/world-building/plot-threads/+page.svelte`
- `src/routes/projects/[id]/world-building/plot-threads/+page.ts`
- `src/routes/projects/[id]/world-building/timeline/+page.svelte`
- `src/routes/projects/[id]/world-building/timeline/+page.ts`

## Acceptance Criteria

- [ ] `src/modules/world-building/index.ts` exists and exports full Bible module public API
- [ ] `/projects/[id]/world-building` renders a section card grid with all five entity type cards
- [ ] Each entity card links to the correct `/world-building/[entity-type]` sub-route
- [ ] All five entity list sub-routes render content (may just show an empty list at this stage)
- [ ] World Building sidebar item shows active state on all `/world-building` sub-routes
- [ ] `pnpm run check` exits clean

## Edge Cases

- If `src/modules/bible/index.ts` does not exist, scan `src/modules/bible/components/` and create a full barrel export
- If the Bible landing page uses query params or route-level data loading, carry that pattern into the World Building landing

## Notes

- Entity detail routes (e.g., `/world-building/characters/[charId]`) are handled in Part 002
- The existing `/bible` route is not yet redirected in this part; Part 002 handles the old-route redirects
