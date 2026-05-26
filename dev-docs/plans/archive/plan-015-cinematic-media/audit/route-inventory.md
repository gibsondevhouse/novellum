# Plan-015 Stage 001 Route Inventory

Date: 2026-04-20

## Inventory Method

1. Enumerated all visible route shells from `src/routes/**/+page.svelte` and `+layout.svelte`.
2. Included app-level, project-level, world-building, redirect/future-state, and shell surfaces.
3. Marked screenshot baseline status from existing `tests/visual/__screenshots__` artifacts.

## App-Level Routes

| Route | Surface type | Screenshot status | Notes |
| --- | --- | --- | --- |
| `/` | Library home | Captured | `tests/visual/.../home-library.png` exists. |
| `/projects` | Projects gallery | Captured | `tests/visual/.../projects.png` exists. |
| `/books` | Books shelf | Missing | Needs desktop + mobile baseline. |
| `/books/[id]` | Book detail | Missing | Needs seeded fixture capture. |
| `/stories` | Stories shelf | Captured | `tests/visual/.../stories.png` exists. |
| `/images` | Images gallery | Captured | `tests/visual/.../images.png` exists. |
| `/nova` | AI console | Captured | `tests/visual/.../nova.png` exists. |
| `/settings` | Settings | Captured | `tests/visual/.../settings.png` exists. |
| `/settings/migrate` | Migration flow | Missing | Needs empty + in-progress + error captures. |
| `/styles` | Writing styles | Missing | Includes undefined token references. |

## Project Shell + Project-Level Routes

| Route | Surface type | Screenshot status | Notes |
| --- | --- | --- | --- |
| `/projects/[id]` + layout | Project shell | Missing | Must include desktop + mobile nav states. |
| `/projects/[id]/hub` | Project hub | Missing | Stage 005 target surface. |
| `/projects/[id]/outline` | Outline storyboard | Missing | Dense workflow must stay scannable. |
| `/projects/[id]/editor` | Editor shell | Missing | Include empty and populated scene list. |
| `/projects/[id]/editor/[sceneId]` | Scene-focused editor | Missing | Include autosave/status chrome state. |
| `/projects/[id]/consistency` | Consistency route | Missing | Verify transition/redirect behavior. |
| `/projects/[id]/continuity` | Continuity center | Missing | Include issue triage states. |
| `/projects/[id]/arcs` | Future-state route | Missing | Needs polished placeholder baseline. |
| `/projects/[id]/arcs/[arcId]` | Arc detail future-state | Missing | Needs polished placeholder baseline. |

## World-Building and Bible Routes

| Route group | Representative routes | Screenshot status | Notes |
| --- | --- | --- | --- |
| World overview | `/projects/[id]/world-building` | Missing | Stage 006 cinematic overview entry. |
| Personae | `/world-building/characters`, `/characters/[charId]`, `/factions`, `/species`, `/characters/individuals`, `/characters/notes` | Missing | Needs dossier + collection baseline. |
| Atlas | `/world-building/locations`, `/locations/realms`, `/locations/landmarks`, `/locations/maps`, `/locations/notes` | Missing | Needs map and list fallback treatment. |
| Archive | `/world-building/lore`, `/lore/myths`, `/lore/technology`, `/lore/traditions`, `/lore/notes` | Missing | Include empty + populated states. |
| Threads | `/world-building/plot-threads`, `/major-arcs`, `/sub-plots`, `/motivations`, `/notes` | Missing | Include card and dense list states. |
| Chronicles | `/world-building/timeline`, `/eras`, `/key-events`, `/personal-histories`, `/notes` | Missing | Include chronological scannability states. |
| Legacy bible redirects | `/projects/[id]/bible` and child routes | Missing | Must capture source + destination behavior. |

## Shared Visible Surfaces

### Persistent chrome

- `src/routes/+layout.svelte`
- `src/lib/components/AppSidebar.svelte`
- `src/lib/components/AppHeader.svelte`
- `src/lib/components/SecondaryLeftSidebar.svelte`
- `src/lib/components/ActiveProjectSection.svelte`
- `src/lib/components/ToastContainer.svelte`

### Modals / dialogs / drawers

- `src/lib/components/OnboardingModal.svelte`
- `src/lib/components/rewrite-options-modal/RewriteOptionsModal.svelte`
- `src/modules/export/components/ExportModal.svelte`
- `src/modules/export/components/ImportBackupDialog.svelte`
- `src/modules/project/components/DeleteProjectDialog.svelte`

### Required state captures

- Empty collections (projects, books, stories, characters, plot threads, timeline).
- Loading skeleton states for app-level cards and project cards.
- Error states for migration, export/import, and AI/chat surfaces.
- Mobile collapsed sidebar + route transitions.
- Reduced-motion behavior for animated surfaces.

## Baseline Screenshot Location

- Existing visual snapshots: `tests/visual/__screenshots__/visual-regression.test.ts/`
- New Stage 001 captures target directory: `dev-docs/plans/plan-015-cinematic-media/evidence/baseline-screenshots/`
