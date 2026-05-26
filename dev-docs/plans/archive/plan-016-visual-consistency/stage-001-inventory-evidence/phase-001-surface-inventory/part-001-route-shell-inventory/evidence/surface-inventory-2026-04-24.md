# Surface Inventory - 2026-04-24 (Kickoff Snapshot)

## Scope

- Generated from file-system route definitions under src/routes/**.
- Includes all UI page routes (+page.svelte) and inferred shell usage.
- API routes excluded from this table; tracked separately for backend surface context.

## Route Catalog (UI Pages)

| Route | Page Component | Shell Pattern | Notes |
| --- | --- | --- | --- |
| / | `src/routes/+page.svelte` | root-shell |  |
| /books | `src/routes/books/+page.svelte` | root-shell |  |
| /books/[id] | `src/routes/books/[id]/+page.svelte` | root-shell |  |
| /images | `src/routes/images/+page.svelte` | root-shell |  |
| /nova | `src/routes/nova/+page.svelte` | root-shell |  |
| /projects | `src/routes/projects/+page.svelte` | root-shell |  |
| /projects/[id] | `src/routes/projects/[id]/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/arcs | `src/routes/projects/[id]/arcs/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/arcs/[arcId] | `src/routes/projects/[id]/arcs/[arcId]/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/bible | `src/routes/projects/[id]/bible/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/bible/characters | `src/routes/projects/[id]/bible/characters/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/bible/characters/[charId] | `src/routes/projects/[id]/bible/characters/[charId]/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/bible/locations | `src/routes/projects/[id]/bible/locations/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/bible/lore | `src/routes/projects/[id]/bible/lore/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/bible/plot-threads | `src/routes/projects/[id]/bible/plot-threads/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/bible/timeline | `src/routes/projects/[id]/bible/timeline/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/consistency | `src/routes/projects/[id]/consistency/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/continuity | `src/routes/projects/[id]/continuity/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/editor | `src/routes/projects/[id]/editor/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/editor/[sceneId] | `src/routes/projects/[id]/editor/[sceneId]/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/hub | `src/routes/projects/[id]/hub/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/outline | `src/routes/projects/[id]/outline/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building | `src/routes/projects/[id]/world-building/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/characters | `src/routes/projects/[id]/world-building/characters/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/characters/[charId] | `src/routes/projects/[id]/world-building/characters/[charId]/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/characters/individuals | `src/routes/projects/[id]/world-building/characters/individuals/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/characters/notes | `src/routes/projects/[id]/world-building/characters/notes/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/factions | `src/routes/projects/[id]/world-building/factions/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/lineages | `src/routes/projects/[id]/world-building/lineages/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/locations | `src/routes/projects/[id]/world-building/locations/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/locations/landmarks | `src/routes/projects/[id]/world-building/locations/landmarks/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/locations/maps | `src/routes/projects/[id]/world-building/locations/maps/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/locations/notes | `src/routes/projects/[id]/world-building/locations/notes/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/locations/realms | `src/routes/projects/[id]/world-building/locations/realms/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/lore | `src/routes/projects/[id]/world-building/lore/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/lore/myths | `src/routes/projects/[id]/world-building/lore/myths/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/lore/notes | `src/routes/projects/[id]/world-building/lore/notes/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/lore/technology | `src/routes/projects/[id]/world-building/lore/technology/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/lore/traditions | `src/routes/projects/[id]/world-building/lore/traditions/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/plot-threads | `src/routes/projects/[id]/world-building/plot-threads/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/plot-threads/major-arcs | `src/routes/projects/[id]/world-building/plot-threads/major-arcs/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/plot-threads/motivations | `src/routes/projects/[id]/world-building/plot-threads/motivations/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/plot-threads/notes | `src/routes/projects/[id]/world-building/plot-threads/notes/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/plot-threads/sub-plots | `src/routes/projects/[id]/world-building/plot-threads/sub-plots/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/timeline | `src/routes/projects/[id]/world-building/timeline/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/timeline/eras | `src/routes/projects/[id]/world-building/timeline/eras/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/timeline/key-events | `src/routes/projects/[id]/world-building/timeline/key-events/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/timeline/notes | `src/routes/projects/[id]/world-building/timeline/notes/+page.svelte` | project-shell (+ root-shell) |  |
| /projects/[id]/world-building/timeline/personal-histories | `src/routes/projects/[id]/world-building/timeline/personal-histories/+page.svelte` | project-shell (+ root-shell) |  |
| /settings | `src/routes/settings/+page.svelte` | root-shell |  |
| /settings/migrate | `src/routes/settings/migrate/+page.svelte` | root-shell | Utility/migration surface; validate reachability from nav. |
| /stories | `src/routes/stories/+page.svelte` | root-shell | Legacy/alternate index surface; verify active IA placement. |
| /styles | `src/routes/styles/+page.svelte` | root-shell | Likely internal visual test surface; validate production intent. |

## API Route Count (Non-UI)

- +server.ts files: 57

## Next Enrichment Pass

- Add module owner, purpose, major child components, reachable-from-navigation flag, and visual-fit rating.
- Cross-map each row to the 26 required surfaces in the research brief.
- Confirm broken/unreachable routes by runtime navigation checks.
