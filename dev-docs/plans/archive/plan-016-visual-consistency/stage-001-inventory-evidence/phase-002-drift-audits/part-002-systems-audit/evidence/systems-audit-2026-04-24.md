# Systems Audit (2026-04-24)

## Scope

- Systems audited: density/rhythm, typography, interaction behavior, and empty/loading/error states.
- Evidence base: Stage 001 route inventory (53 routes) plus route/component CSS/markup patterns.
- This artifact feeds Stage 003, Stage 006, Stage 007, and Stage 008 convergence work.

## Density Map (Major Screens)

| Surface | Route(s) | Density read | Notes |
| --- | --- | --- | --- |
| Project Hub / Dashboard | `/projects`, `/projects/[id]/hub` | Visually balanced | Strong panel rhythm, predictable spacing |
| Editor / Writing Surface | `/projects/[id]/editor`, `/projects/[id]/editor/[sceneId]` | Slightly cramped in side rail | Primary writing lane balanced, utility rail dense |
| Outliner | `/projects/[id]/outline` | Visually balanced | Hero + metrics + hierarchy lanes are coherent |
| Arc Workspace | `/projects/[id]/arcs` | Too spacious + placeholder-heavy | Large roadmap cards with low information density |
| Act Workspace | `/projects/[id]/outline` act panels | Balanced | Embedded in outliner clarity panel system |
| Chapter Workspace | `/projects/[id]/outline` chapter panels | Balanced | Consistent with outliner detail rhythm |
| Scene Workspace | `/projects/[id]/outline`, `/projects/[id]/editor/[sceneId]` | Balanced | Scene editor has focused frame and metadata strip |
| Story Bible Root | `/projects/[id]/world-building` | Slightly spacious | Cinematic hero treatment, large explanatory blocks |
| Individuals | `/projects/[id]/world-building/characters/individuals` | Balanced | Dense but legible editor + continuity split |
| Factions | `/projects/[id]/world-building/factions` | Balanced | Dossier rhythm consistent |
| Lineages | `/projects/[id]/world-building/lineages` | Balanced | Dossier rhythm consistent |
| Realms | `/projects/[id]/world-building/locations/realms` | Balanced | Dossier pane spacing consistent |
| Landmarks | `/projects/[id]/world-building/locations/landmarks` | Balanced | Dossier pane spacing consistent |
| Myths | `/projects/[id]/world-building/lore/myths` | Balanced | Dossier pane spacing consistent |
| Technology | `/projects/[id]/world-building/lore/technology` | Balanced | Dossier pane spacing consistent |
| Traditions | `/projects/[id]/world-building/lore/traditions` | Balanced | Dossier pane spacing consistent |
| Consistency Engine | `/projects/[id]/continuity` | Balanced | Hero + metrics + triage lanes coherent |
| AI Assistant | `/nova` and editor AI panel | Moderate drift | `/nova` calm; editor side rail appears denser |
| Export | `/books/[id]` + export modal | Slightly document-like | Reader surface intentionally prose-heavy |
| Settings | `/settings` | Balanced | Utility cards align with shell spacing |
| Empty states | multiple routes | Mixed | Shared component + bespoke blocks coexist |
| Create-new flows | `/projects`, `/stories`, world-building forms | Mixed | Flows are split across distinct layout idioms |
| Detail panels | outliner/editor/world-building | Mixed-good | Strong in modules, inconsistent in utility routes |
| Sidebars / navigation rails | root layout + header + project layout | Balanced | Canonical shell stable |
| Modals/drawers/popovers | project layout modals, styles slide panel | Mixed | Styles drawer visual language diverges |
| Form surfaces | editor/styles/migrate/world-building forms | Mixed | Shared primitives + raw controls create drift |

## Typography Drift Findings

| Severity | Affected files | Drift | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| Medium | `src/routes/styles/+page.svelte` | Heavy uppercase labels and utility tone (`form-label`, tab labels) compared with narrative surfaces. | AI/style surface reads as admin console. | Introduce archetype typography profile for utility surfaces with softer label hierarchy. |
| Medium | `src/routes/stories/+page.svelte`, `src/routes/+page.svelte`, `src/routes/images/+page.svelte` | Large hero titles (`text-5xl`) and eyebrow usage vary across sibling collection screens. | Collection family feels split into separate products. | Normalize collection heading scale/eyebrow contract across library routes. |
| Low | `src/routes/books/[id]/+page.svelte` | Reader typography intentionally prose-forward and wider scale than app utility surfaces. | Acceptable distinction, but needs explicit rule to prevent accidental reuse elsewhere. | Keep as intentional writing/export archetype; document as exception. |
| Low | `src/routes/+error.svelte`, `src/routes/projects/[id]/+error.svelte` | Error typography is serviceable but generic compared to branded surfaces. | Error states feel detached from product voice. | Apply same heading/copy rhythm used in app shell hero contexts. |

## Interaction Pattern Matrix

| Interaction category | Evidence file(s) | Current behavior | Drift assessment | Recommendation |
| --- | --- | --- | --- | --- |
| Selected states | `src/routes/styles/+page.svelte` (`tab-btn--active`), PillNav routes | Mix of custom tab active styles and shared pill selection. | Medium | Standardize selected-state tokens across tabs/pills. |
| Hover states | `src/routes/styles/+page.svelte`, `src/routes/+page.svelte` | Local hover effects differ in intensity and border treatment. | Medium | Use shared hover token scales by archetype. |
| Active states | App sidebar/header vs local cards/buttons | Canonical nav active treatment is consistent; local route cards vary. | Low | Reuse nav/card active primitives where possible. |
| Disabled states | styles/migrate/editor buttons and inputs | Disabled logic exists but visual affordance differs by route. | Medium | Unify disabled contrast and cursor treatment. |
| Focus states | global shell + styles + arc future links | Focus-visible exists broadly; local focus rings vary. | Low | Align on focus token and offset contract. |
| Destructive actions | world-building entity pages, timeline eras | Confirm/cancel patterns present but presentation differs by module. | Low | Keep module nuance, unify button hierarchy semantics. |
| Create-new actions | `/projects`, `/stories`, styles tabs, world-building forms | Entry points differ in button placement and panel reveal style. | Medium | Converge create-entry rhythm per archetype. |
| Save actions | styles editor, entity forms, editor inline fields | Save interactions distributed across inline blur-save and explicit buttons. | Medium | Define when autosave vs explicit save is allowed. |
| Edit vs read modes | styles slide panel and world-building dossiers | Styles uses side drawer; dossiers use in-place detail panes. | Medium | Keep distinction but align visual language and transitions. |
| Inline editing | editor route (`onblur` inputs) | Fast inline edits, minimal framing. | Low | Document editor-specific inline editing as intentional. |
| Panel open/close | project layout modals, styles slide panel, editor AI panel | Multiple panel metaphors with different motion and chrome. | Medium | Converge toward shared drawer/modal primitives. |
| Tab switching | styles custom tabs, world-building/top nav pills | Tabs are custom in styles, pill nav shared elsewhere. | Medium | Migrate styles tabs to shared tab/pill primitive. |
| Navigation transitions | root/project layouts using View Transitions | Core transitions are present and coherent. | Low | Preserve; ensure new surfaces attach to same transition contract. |

## Empty, Loading, and Error State Inventory

| Route / component | State type | Current treatment | Tone fit | Recommendation |
| --- | --- | --- | --- | --- |
| `/` | Loading | `LibraryHeroCardSkeleton` list | Good | Keep; ensure skeleton rhythm reused in `/projects` and `/stories`. |
| `/` | Empty | `EmptyStatePanel` with CTA | Good | Use as baseline for gallery empties. |
| `/books` | Loading | SurfacePanel + skeleton cards | Good | Keep and align with `/projects`/`/stories`. |
| `/books` | Empty | `EmptyStatePanel` | Good | Keep as canonical empty panel. |
| `/books/[id]` | Empty content | In-line reader empty messages | Moderate | Add authored empty microcopy and guidance CTA. |
| `/stories` | Empty | bespoke `empty-state` block | Moderate | Replace with `EmptyStatePanel` variant for collection archetype. |
| `/projects/[id]/continuity` | Empty issues/styles | `EmptyStatePanel` in surface panels | Good | Keep; make copy consistently author-facing. |
| `/projects/[id]/arcs` | Incomplete/WIP | future hero and roadmap cards | Weak | Replace with standardized workspace-coming-soon panel. |
| `/projects/[id]/arcs/[arcId]` | Incomplete/WIP | future detail hero | Weak | Same as above; preserve route but converge visuals. |
| World-building notes/maps/key-events/personal-histories routes | Placeholder | `WorldBuildingPlaceholderPage` | Moderate | Keep shared placeholder, but add stronger authored task guidance. |
| `/settings/migrate` | Loading | `phase === loading` status message | Good utility tone | Keep but align typography and spacing with settings pages. |
| `/settings/migrate` | Error | explicit error status + expandable error list | Good utility tone | Keep; style error banner/card to match app shell voice. |
| `/styles` | Error | local `error-banner` in slide panel | Moderate | Move to shared error banner primitive. |
| `src/routes/+error.svelte` | Route error | generic error card with CTA | Moderate | Brand with same cinematic tone as shell hero hierarchy. |
| `src/routes/projects/[id]/+error.svelte` | Project route error | project-scoped error card | Moderate | Align with global error pattern + project context copy. |

## Consolidated System-Level Drift Priorities

1. High: replace Arc future pages with canonical planning workspace pattern.
2. High: unify empty/placeholder patterns across story bible and collection routes.
3. Medium: converge styles/admin utility typography, tabs, cards, and drawer interactions with shared primitives.
4. Medium: formalize autosave vs explicit-save interaction contract.
5. Low: refine error-state visual voice to match cinematic product identity.
