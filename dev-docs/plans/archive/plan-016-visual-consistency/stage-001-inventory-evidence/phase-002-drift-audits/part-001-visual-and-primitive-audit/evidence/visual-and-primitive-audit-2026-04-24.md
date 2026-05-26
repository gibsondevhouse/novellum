# Visual Language and Primitive Audit (2026-04-24)

## Scope

- Source surfaces: all 53 UI routes inventoried in Stage 001.
- Focus areas: visual language drift, page archetype expectations, and duplicate primitive structures.
- This audit is implementation-facing evidence for Stage 003 convergence work.

## Archetype Rules

| Archetype | Expected visual rules | Current conformance |
| --- | --- | --- |
| Gallery / project browsing | clear hero + collection rhythm, low cognitive load, strong create affordance | Mostly aligned on `/`, `/projects`, `/books`; duplication risk with `/stories` |
| Writing surface | calmest typography, reduced card noise, tool chrome secondary to prose | Strong in `/projects/[id]/editor` and scene editor |
| Planning workspace | hierarchical navigation + inspector rhythm, structured but non-corporate | Strong in `/projects/[id]/outline`; arc routes currently break family |
| Entity management | dossier-like cards, consistent details/edit/create lanes across entity types | Strong across factions/lineages/realms/landmarks/myths/technology/traditions |
| Review / consistency | issue triage, clear status hierarchy, concise utility styling | Strong in `/projects/[id]/continuity` |
| Export / production | focused output controls, minimal narrative chrome | Split across `/books/[id]` + modal flow; needs explicit family rule |
| Settings / configuration | utility-first but still in Novellum tone and spacing rhythm | `/settings` aligned, `/styles` drifts admin-heavy |

## Route-by-Route Visual Assessment

| Route | Visual assessment |
| --- | --- |
| / | Feels product-consistent with established shell rhythm; Landing with project collections. |
| /books | Feels product-consistent with established shell rhythm; Story-type project library. |
| /books/[id] | Partially aligned but trending utility/admin in tone; Reader-like project view. |
| /images | Feels product-consistent with established shell rhythm; Asset library. |
| /nova | Feels product-consistent with established shell rhythm; AI assistant panel. |
| /projects | Feels product-consistent with established shell rhythm; Main project hub. |
| /projects/[id] | Redirect-only route with no standalone visual surface. |
| /projects/[id]/arcs | Placeholder/WIP treatment visibly breaks cross-surface continuity; Marked future/in production. |
| /projects/[id]/arcs/[arcId] | Placeholder/WIP treatment visibly breaks cross-surface continuity; Detail page is placeholder. |
| /projects/[id]/bible | Redirect-only route with no standalone visual surface. |
| /projects/[id]/bible/characters | Redirect-only route with no standalone visual surface. |
| /projects/[id]/bible/characters/[charId] | Redirect-only route with no standalone visual surface. |
| /projects/[id]/bible/locations | Redirect-only route with no standalone visual surface. |
| /projects/[id]/bible/lore | Redirect-only route with no standalone visual surface. |
| /projects/[id]/bible/plot-threads | Redirect-only route with no standalone visual surface. |
| /projects/[id]/bible/timeline | Redirect-only route with no standalone visual surface. |
| /projects/[id]/consistency | Redirect-only route with no standalone visual surface. |
| /projects/[id]/continuity | Feels product-consistent with established shell rhythm; Continuity command surface. |
| /projects/[id]/editor | Feels product-consistent with established shell rhythm; Primary writing workspace. |
| /projects/[id]/editor/[sceneId] | Feels product-consistent with established shell rhythm; Focused scene editing. |
| /projects/[id]/hub | Feels product-consistent with established shell rhythm; Dashboard for one project. |
| /projects/[id]/outline | Feels product-consistent with established shell rhythm; Planning workspace. |
| /projects/[id]/world-building | Feels product-consistent with established shell rhythm; Domain chooser. |
| /projects/[id]/world-building/characters | Feels product-consistent with established shell rhythm; Characters top section. |
| /projects/[id]/world-building/characters/[charId] | Feels product-consistent with established shell rhythm; Character edit/detail. |
| /projects/[id]/world-building/characters/individuals | Feels product-consistent with established shell rhythm; Character management workspace. |
| /projects/[id]/world-building/characters/notes | Placeholder/WIP treatment visibly breaks cross-surface continuity; Placeholder notes surface. |
| /projects/[id]/world-building/factions | Feels product-consistent with established shell rhythm; Faction management. |
| /projects/[id]/world-building/lineages | Feels product-consistent with established shell rhythm; Lineage management. |
| /projects/[id]/world-building/locations | Feels product-consistent with established shell rhythm; Locations top section. |
| /projects/[id]/world-building/locations/landmarks | Feels product-consistent with established shell rhythm; Landmark management. |
| /projects/[id]/world-building/locations/maps | Placeholder/WIP treatment visibly breaks cross-surface continuity; Placeholder maps surface. |
| /projects/[id]/world-building/locations/notes | Placeholder/WIP treatment visibly breaks cross-surface continuity; Placeholder notes surface. |
| /projects/[id]/world-building/locations/realms | Feels product-consistent with established shell rhythm; Realm management. |
| /projects/[id]/world-building/lore | Feels product-consistent with established shell rhythm; Lore top section. |
| /projects/[id]/world-building/lore/myths | Feels product-consistent with established shell rhythm; Myth management. |
| /projects/[id]/world-building/lore/notes | Placeholder/WIP treatment visibly breaks cross-surface continuity; Placeholder notes surface. |
| /projects/[id]/world-building/lore/technology | Feels product-consistent with established shell rhythm; Technology management. |
| /projects/[id]/world-building/lore/traditions | Feels product-consistent with established shell rhythm; Tradition management. |
| /projects/[id]/world-building/plot-threads | Feels product-consistent with established shell rhythm; Plot threads top section. |
| /projects/[id]/world-building/plot-threads/major-arcs | Feels product-consistent with established shell rhythm; Major arcs workspace. |
| /projects/[id]/world-building/plot-threads/motivations | Feels product-consistent with established shell rhythm; Motivations workspace. |
| /projects/[id]/world-building/plot-threads/notes | Placeholder/WIP treatment visibly breaks cross-surface continuity; Placeholder notes surface. |
| /projects/[id]/world-building/plot-threads/sub-plots | Feels product-consistent with established shell rhythm; Sub-plots workspace. |
| /projects/[id]/world-building/timeline | Feels product-consistent with established shell rhythm; Timeline top section. |
| /projects/[id]/world-building/timeline/eras | Feels product-consistent with established shell rhythm; Era management. |
| /projects/[id]/world-building/timeline/key-events | Placeholder/WIP treatment visibly breaks cross-surface continuity; Placeholder key-events surface. |
| /projects/[id]/world-building/timeline/notes | Placeholder/WIP treatment visibly breaks cross-surface continuity; Placeholder notes surface. |
| /projects/[id]/world-building/timeline/personal-histories | Placeholder/WIP treatment visibly breaks cross-surface continuity; Placeholder histories surface. |
| /settings | Feels product-consistent with established shell rhythm; App settings. |
| /settings/migrate | Partially aligned but trending utility/admin in tone; Utility migration route. |
| /stories | Partially aligned but trending utility/admin in tone; Alternate collection surface. |
| /styles | Partially aligned but trending utility/admin in tone; Internal/admin-like editor surface. |

## Visual Drift Findings (File-Level)

| Category | Severity | Affected files | Current problem | Why it hurts consistency | Recommendation | Scope |
| --- | --- | --- | --- | --- | --- | --- |
| Workspace drift | High | `src/routes/projects/[id]/arcs/+page.svelte`, `src/routes/projects/[id]/arcs/[arcId]/+page.svelte` | Arc pages use ad-hoc `future-*` styles and roadmap cards instead of workspace primitives. | Arc workspace does not look like outliner/editor/world-building family. | Replace future shell/cards/actions with canonical planning workspace primitives and panel rhythm. | Shared component + route local |
| Entity surface drift | Medium | `src/routes/projects/[id]/world-building/*/notes/+page.svelte`, `src/routes/projects/[id]/world-building/locations/maps/+page.svelte`, `src/routes/projects/[id]/world-building/timeline/key-events/+page.svelte`, `src/routes/projects/[id]/world-building/timeline/personal-histories/+page.svelte` | Multiple entity subroutes are placeholder wrappers. | Fragmented completeness perception inside Story Bible family. | Introduce canonical under-construction variant tied to entity workspace frame, then replace incrementally. | Shared component |
| Shell/layout drift | Medium | `src/routes/stories/+page.svelte`, `src/routes/projects/+page.svelte`, `src/routes/+page.svelte` | Overlapping collection surfaces with different create/empty treatment. | Library experience feels duplicated rather than unified. | Choose one canonical collection surface; deprecate or visually converge alternate route. | IA + route local |
| AI assistant drift | Medium | `src/routes/styles/+page.svelte` | Heavy local card/panel/input implementations create admin-console look. | Surface feels detached from cinematic author product voice. | Convert local `card`, `slide-panel`, `form-*` patterns to shared primitives and tone. | Shared primitive + route local |
| Card/panel drift | Medium | `src/routes/styles/+page.svelte`, `src/routes/settings/+page.svelte`, `src/routes/images/+page.svelte` | Multiple local summary/card patterns despite shared `SurfaceCard/SurfacePanel`. | Density and visual hierarchy differ across utility surfaces. | Define canonical utility-card variant and migrate route-local cards. | Design-system-level |
| Empty-state drift | Medium | `src/routes/stories/+page.svelte`, `src/routes/+page.svelte`, world-building placeholder routes | Mixed empty-state patterns (`EmptyStatePanel`, bespoke empty blocks, placeholder pages). | Empty journeys feel authored in some areas and generic in others. | Standardize empty-state composition with optional archetype variants. | Shared component |
| Button/input drift | Medium | `src/routes/projects/[id]/editor/+page.svelte`, `src/routes/styles/+page.svelte`, `src/routes/settings/migrate/+page.svelte` | Raw `<input>`/`<textarea>` and ad-hoc button groups coexist with primitives. | Form controls vary in height, focus, and tone between adjacent screens. | Replace raw controls where practical with `Input` and shared form-field wrappers. | Shared primitive + route local |
| Hero/pill drift | Low | `src/routes/projects/[id]/world-building/+page.svelte`, `src/routes/projects/[id]/outline/+page.svelte`, `src/routes/projects/[id]/continuity/+page.svelte` | Each route uses custom hero motif and metric cards. | Family resemblance is present but not fully normalized. | Establish archetype-specific hero tokens/components before broad refactor. | Module-specific |

## Primitive Duplication Inventory

| Pattern | Representative files | Recommendation | Decision rationale |
| --- | --- | --- | --- |
| Future workspace shell (`future-shell`, `future-card`, `future-primary`) | `src/routes/projects/[id]/arcs/+page.svelte`, `src/routes/projects/[id]/arcs/[arcId]/+page.svelte` | Promote to canonical planning placeholder component | Repeated structure now and likely reused during staged rollout |
| World-building placeholder wrapper | `src/routes/projects/[id]/world-building/**/notes/+page.svelte`, `src/routes/projects/[id]/world-building/locations/maps/+page.svelte`, `src/routes/projects/[id]/world-building/timeline/key-events/+page.svelte` | Keep shared module component | Already centralized as `WorldBuildingPlaceholderPage` |
| Local utility cards (`card`, `summary-card`, `library-summary__card`) | `src/routes/styles/+page.svelte`, `src/routes/settings/+page.svelte`, `src/routes/images/+page.svelte` | Promote to shared `SurfaceCard` variants | Same semantics repeated with local styling drift |
| Local slide panel editor (`slide-panel*`) | `src/routes/styles/+page.svelte` | Promote to shared drawer/panel primitive | Pattern likely needed beyond styles screen |
| Local form controls (`form-input`, `form-textarea`, raw `input`) | `src/routes/styles/+page.svelte`, `src/routes/projects/[id]/editor/+page.svelte`, `src/routes/settings/migrate/+page.svelte` | Promote form-field wrapper; keep route-local edge cases | Repeated control styles with inconsistent focus/spacing |
| Bespoke create/empty panels (`create-story-panel`, route-local empty-state blocks) | `src/routes/stories/+page.svelte`, `src/routes/projects/+page.svelte` | Replace with shared empty/create pattern | Collection surfaces should share one authored onboarding rhythm |
| Hero banner variants (`hero-banner`, `continuity-hero`, `storyboard-hero`, world-building `hero`) | `src/routes/+page.svelte`, `src/routes/projects/[id]/continuity/+page.svelte`, `src/routes/projects/[id]/outline/+page.svelte`, `src/routes/projects/[id]/world-building/+page.svelte` | Keep module-specific, define tokenized archetype contracts | Intentional differentiation, but requires explicit rules |
| Local metric cards (`metric-card`, continuity metrics, summary cards) | `src/routes/projects/[id]/outline/+page.svelte`, `src/routes/projects/[id]/continuity/+page.svelte`, `src/routes/settings/+page.svelte` | Promote shared metric card primitive | Same information architecture appears in multiple modules |

## Recommendations for Stage 003

1. Prioritize Arc workspace convergence and utility/admin surface convergence (`/styles`, `/stories`).
2. Introduce canonical primitives for utility cards, slide drawers, and metric cards before route rewrites.
3. Keep world-building dossier distinction intentional, but standardize placeholder and empty-state treatment.
4. Establish archetype-level hero contracts so route-specific branding stays consistent in density and hierarchy.
