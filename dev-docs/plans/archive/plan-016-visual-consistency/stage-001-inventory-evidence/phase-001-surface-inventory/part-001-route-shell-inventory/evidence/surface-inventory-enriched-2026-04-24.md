# Surface Inventory - Enriched (2026-04-24)

## Method

- Source of truth: all `+page.svelte` files under `src/routes/**`.
- Route count validated: 53 UI routes.
- Redirect-only routes were identified from matching `+page.ts` redirects.
- Shell usage classified from `src/routes/+layout.svelte` and `src/routes/projects/[id]/+layout.svelte`.
- Reachability classified as `Direct`, `Contextual`, `Deep-link`, or `Redirect-only`.

## Surface Inventory Table

| Surface | Route | Module | Shell pattern | Main components | Reachability | Visual fit | Drift severity | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | / | project | root-shell | CollectionRow, BookCoverCard | Direct | Integrated | Low | Landing with project collections |
| Books | /books | project | root-shell | LibraryHeroCard, ProjectCreateCard | Direct | Integrated | Low | Story-type project library |
| Book Reader | /books/[id] | project | root-shell | reader/export rendering | Deep-link | Moderate | Low | Reader-like project view |
| Images | /images | assets | root-shell | ImageGrid | Direct | Integrated | Low | Asset library |
| Nova | /nova | ai | root-shell | ChatInterface | Direct | Integrated | Low | AI assistant panel |
| Projects | /projects | project | root-shell | LibraryHeroCard, ProjectCreateCard | Direct | Integrated | Low | Main project hub |
| Project Root | /projects/[id] | project | redirect-only | n/a | Redirect-only | n/a | Low | Redirect to /hub |
| Arc Workspace | /projects/[id]/arcs | project | project-shell (+ root-shell) | future hero/cards | Contextual | Incomplete | High | Marked future/in production |
| Arc Detail | /projects/[id]/arcs/[arcId] | project | project-shell (+ root-shell) | future hero/actions | Deep-link | Incomplete | High | Detail page is placeholder |
| Bible Root (legacy) | /projects/[id]/bible | bible | redirect-only | n/a | Redirect-only | n/a | Low | Redirect to world-building |
| Bible Characters (legacy) | /projects/[id]/bible/characters | bible | redirect-only | n/a | Redirect-only | n/a | Low | Redirect to world-building |
| Bible Character Detail (legacy) | /projects/[id]/bible/characters/[charId] | bible | redirect-only | n/a | Redirect-only | n/a | Low | Redirect to world-building |
| Bible Locations (legacy) | /projects/[id]/bible/locations | bible | redirect-only | n/a | Redirect-only | n/a | Low | Redirect to world-building |
| Bible Lore (legacy) | /projects/[id]/bible/lore | bible | redirect-only | n/a | Redirect-only | n/a | Low | Redirect to world-building |
| Bible Plot Threads (legacy) | /projects/[id]/bible/plot-threads | bible | redirect-only | n/a | Redirect-only | n/a | Low | Redirect to world-building |
| Bible Timeline (legacy) | /projects/[id]/bible/timeline | bible | redirect-only | n/a | Redirect-only | n/a | Low | Redirect to world-building |
| Consistency (legacy) | /projects/[id]/consistency | consistency | redirect-only | n/a | Redirect-only | n/a | Low | Redirect to continuity |
| Continuity | /projects/[id]/continuity | consistency | project-shell (+ root-shell) | ConsistencyPanel, PromptEditor | Direct | Integrated | Low | Continuity command surface |
| Editor | /projects/[id]/editor | editor | project-shell (+ root-shell) | ManuscriptSurface, AiPanel | Direct | Integrated | Low | Primary writing workspace |
| Scene Editor | /projects/[id]/editor/[sceneId] | editor | project-shell (+ root-shell) | DocumentEditorFrame, VersionHistoryPanel | Contextual | Integrated | Low | Focused scene editing |
| Project Hub | /projects/[id]/hub | project | project-shell (+ root-shell) | ProjectHubHero, Hub cards | Direct | Integrated | Low | Dashboard for one project |
| Outliner | /projects/[id]/outline | outliner | project-shell (+ root-shell) | HierarchyNavigator, clarity panels | Direct | Integrated | Low | Planning workspace |
| World Building Root | /projects/[id]/world-building | bible | project-shell (+ root-shell) | SectionHeader, domain cards | Direct | Integrated | Low | Domain chooser |
| Personae Landing | /projects/[id]/world-building/characters | bible | project-shell (+ root-shell) | WorldBuildingTopSectionLanding | Direct | Integrated | Low | Characters top section |
| Character Detail | /projects/[id]/world-building/characters/[charId] | bible | project-shell (+ root-shell) | CharacterForm, RelationshipEditor | Contextual | Integrated | Low | Character edit/detail |
| Individuals | /projects/[id]/world-building/characters/individuals | bible | project-shell (+ root-shell) | Character panels, continuity panel | Direct | Integrated | Low | Character management workspace |
| Character Notes | /projects/[id]/world-building/characters/notes | bible | project-shell (+ root-shell) | WorldBuildingPlaceholderPage | Contextual | Incomplete | Medium | Placeholder notes surface |
| Factions | /projects/[id]/world-building/factions | bible | project-shell (+ root-shell) | Faction panels, workspace page | Direct | Integrated | Low | Faction management |
| Lineages | /projects/[id]/world-building/lineages | bible | project-shell (+ root-shell) | Lineage panels, workspace page | Direct | Integrated | Low | Lineage management |
| Atlas Landing | /projects/[id]/world-building/locations | bible | project-shell (+ root-shell) | WorldBuildingTopSectionLanding | Direct | Integrated | Low | Locations top section |
| Landmarks | /projects/[id]/world-building/locations/landmarks | bible | project-shell (+ root-shell) | LandmarkDossierPane | Direct | Integrated | Low | Landmark management |
| Maps | /projects/[id]/world-building/locations/maps | bible | project-shell (+ root-shell) | WorldBuildingPlaceholderPage | Contextual | Incomplete | Medium | Placeholder maps surface |
| Location Notes | /projects/[id]/world-building/locations/notes | bible | project-shell (+ root-shell) | WorldBuildingPlaceholderPage | Contextual | Incomplete | Medium | Placeholder notes surface |
| Realms | /projects/[id]/world-building/locations/realms | bible | project-shell (+ root-shell) | RealmDossierPane | Direct | Integrated | Low | Realm management |
| Archive Landing | /projects/[id]/world-building/lore | bible | project-shell (+ root-shell) | WorldBuildingTopSectionLanding | Direct | Integrated | Low | Lore top section |
| Myths | /projects/[id]/world-building/lore/myths | bible | project-shell (+ root-shell) | MythDossierPane | Direct | Integrated | Low | Myth management |
| Lore Notes | /projects/[id]/world-building/lore/notes | bible | project-shell (+ root-shell) | WorldBuildingPlaceholderPage | Contextual | Incomplete | Medium | Placeholder notes surface |
| Technology | /projects/[id]/world-building/lore/technology | bible | project-shell (+ root-shell) | TechnologyDossierPane | Direct | Integrated | Low | Technology management |
| Traditions | /projects/[id]/world-building/lore/traditions | bible | project-shell (+ root-shell) | TraditionDossierPane | Direct | Integrated | Low | Tradition management |
| Threads Landing | /projects/[id]/world-building/plot-threads | bible | project-shell (+ root-shell) | WorldBuildingTopSectionLanding | Direct | Integrated | Low | Plot threads top section |
| Major Arcs | /projects/[id]/world-building/plot-threads/major-arcs | bible | project-shell (+ root-shell) | ThreadSystemForm | Direct | Integrated | Low | Major arcs workspace |
| Motivations | /projects/[id]/world-building/plot-threads/motivations | bible | project-shell (+ root-shell) | ThreadSystemForm | Direct | Integrated | Low | Motivations workspace |
| Thread Notes | /projects/[id]/world-building/plot-threads/notes | bible | project-shell (+ root-shell) | WorldBuildingPlaceholderPage | Contextual | Incomplete | Medium | Placeholder notes surface |
| Sub-plots | /projects/[id]/world-building/plot-threads/sub-plots | bible | project-shell (+ root-shell) | ThreadSystemForm | Direct | Integrated | Low | Sub-plots workspace |
| Chronicles Landing | /projects/[id]/world-building/timeline | bible | project-shell (+ root-shell) | WorldBuildingTopSectionLanding | Direct | Integrated | Low | Timeline top section |
| Eras | /projects/[id]/world-building/timeline/eras | bible | project-shell (+ root-shell) | TimelineEventForm | Direct | Integrated | Low | Era management |
| Key Events | /projects/[id]/world-building/timeline/key-events | bible | project-shell (+ root-shell) | WorldBuildingPlaceholderPage | Contextual | Incomplete | Medium | Placeholder key-events surface |
| Timeline Notes | /projects/[id]/world-building/timeline/notes | bible | project-shell (+ root-shell) | WorldBuildingPlaceholderPage | Contextual | Incomplete | Medium | Placeholder notes surface |
| Personal Histories | /projects/[id]/world-building/timeline/personal-histories | bible | project-shell (+ root-shell) | WorldBuildingPlaceholderPage | Contextual | Incomplete | Medium | Placeholder histories surface |
| Settings | /settings | settings | root-shell | ApiSettings | Direct | Integrated | Low | App settings |
| Settings Migration | /settings/migrate | settings | root-shell | migration status/actions | Contextual | Moderate | Low | Utility migration route |
| Stories | /stories | project | root-shell | LibraryHeroCard, project forms | Deep-link | Moderate | Medium | Alternate collection surface |
| Styles | /styles | ai | root-shell | style/prompt editors | Direct | Moderate | Medium | Internal/admin-like editor surface |

## Coverage Summary

- Total UI routes inventoried: 53/53.
- Redirect-only routes: 9.
- Incomplete placeholder/future routes: 10.
- Canonical shell usage observed: root shell everywhere, with project shell on `/projects/[id]/**` non-redirect surfaces.

## Required Surface Mapping (Research Brief)

| Requested surface | Route(s) in codebase | Status |
| --- | --- | --- |
| Project Hub / Dashboard | /projects, /projects/[id]/hub | Present |
| Editor / Writing Surface | /projects/[id]/editor, /projects/[id]/editor/[sceneId] | Present |
| Outliner | /projects/[id]/outline | Present |
| Arc Workspace | /projects/[id]/arcs | Present (incomplete) |
| Act Workspace | /projects/[id]/outline (act panels) | Present via outliner |
| Chapter Workspace | /projects/[id]/outline (chapter panels) | Present via outliner |
| Scene Workspace | /projects/[id]/outline, /projects/[id]/editor/[sceneId] | Present |
| Story Bible | /projects/[id]/world-building (+ subsections) | Present |
| Individuals | /projects/[id]/world-building/characters/individuals | Present |
| Factions | /projects/[id]/world-building/factions | Present |
| Lineages | /projects/[id]/world-building/lineages | Present |
| Realms | /projects/[id]/world-building/locations/realms | Present |
| Landmarks | /projects/[id]/world-building/locations/landmarks | Present |
| Myths | /projects/[id]/world-building/lore/myths | Present |
| Technology | /projects/[id]/world-building/lore/technology | Present |
| Traditions | /projects/[id]/world-building/lore/traditions | Present |
| Consistency Engine | /projects/[id]/continuity | Present |
| AI Assistant Panel | /nova, editor AI panel | Present |
| Export | /books/[id] (reader/export view), project export modal | Present (split) |
| Settings | /settings | Present |
| Empty states | Many module pages and placeholders | Present |
| Create-new flows | /projects, /stories, project forms | Present |
| Detail panels | outliner/editor/world-building workspaces | Present |
| Sidebars/navigation rails | root layout sidebar/header | Present |
| Modals/drawers/popovers/dropdowns | project layout modals + module dialogs | Present |
| Form surfaces | project/editor/world-building/settings/styles | Present |
| Loading/error/fallback states | route-level and component-level | Present |

## Notable Route Risks to Validate in Visual QA

- `/projects/[id]/arcs` and `/projects/[id]/arcs/[arcId]` are clearly future placeholders.
- Multiple world-building notes/maps/timeline subroutes intentionally use placeholder pages.
- `/stories` appears functionally overlapping with `/projects` and may represent IA drift.
- `/styles` is directly linked in navigation but visually acts like a power-user/admin surface.
