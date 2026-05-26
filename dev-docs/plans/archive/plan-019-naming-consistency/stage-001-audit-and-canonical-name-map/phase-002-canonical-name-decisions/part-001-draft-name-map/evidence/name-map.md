# Canonical Name Map (plan-019 stage-001 phase-002 part-001)

> Drafted 2026-05-02 by Planner Agent.
> Awaiting user sign-off in part-002 before stages 002+ may begin.
> Scope: routes under `src/routes/projects/[id]/`, all top-level
> modules under `src/modules/`, and conflicted component file names
> inside the editor module.

## Tie-breaker rules used

When resolving a conflict the following priority list was applied:

1. **The user-facing label in the rendered UI** (page `<title>`,
   `PageHeader.title`, sidebar nav copy). Whatever the user reads
   on screen is what the URL and module folder should be called.
2. **The current URL segment** that is actually reachable today
   (i.e. *not* a legacy redirect stub). Stable URLs are user-
   visible artefacts.
3. **Module exports actually consumed by routes** (the module that
   has live consumers wins over the module that is empty / stubbed).
4. Fall back to the clearer English noun if 1–3 tie.

## Project-scoped routes

| Path                                          | Current name        | Canonical name        | Rationale                                                                                                                | Redirect required?                                |
| --------------------------------------------- | ------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `routes/projects/[id]/hub/`                   | `hub/`              | `hub/`                | Matches the "Project Hub" UI label.                                                                                      | No                                                |
| `routes/projects/[id]/outline/`               | `outline/`          | `outline/`            | URL is the user-facing artefact; module gets renamed to match (see below).                                               | No                                                |
| `routes/projects/[id]/arcs/...`               | `arcs/...`          | `arcs/...`            | Already canonical end-to-end (route + breadcrumb + plan-013).                                                            | No                                                |
| `routes/projects/[id]/editor/`                | `editor/`           | `editor/`             | Renders the multi-pane "Manuscript Editor" — keeps the route shape, only inner files renamed (stage-005).                | No                                                |
| `routes/projects/[id]/editor/[sceneId]/`      | `editor/[sceneId]/` | `editor/[sceneId]/`   | Renders the focused single-scene editor (with RecoveryPrompt). Route shape stays nested.                                 | No                                                |
| `routes/projects/[id]/world-building/`        | `world-building/`   | `world-building/`     | Matches the SectionHeader label and the worldbuilding shell composition.                                                 | No                                                |
| `routes/projects/[id]/continuity/`            | `continuity/`       | `continuity/`         | Page title is "Continuity — Novellum" and PageHeader reads "Continuity Command".                                         | No                                                |
| `routes/projects/[id]/bible/`                 | `bible/`            | **(legacy stub)**     | Already a 307 redirect to `world-building/`. Keep as a redirect stub — do not promote, do not delete (external bookmarks). | Yes — keep the existing 307 redirect stub        |
| `routes/projects/[id]/consistency/`           | `consistency/`      | **(legacy stub)**     | Already a 307 redirect to `continuity/`. Keep as a redirect stub.                                                        | Yes — keep the existing 307 redirect stub        |

## Top-level routes

No top-level route segments need renaming. The routing-context doc
just needs to stop listing the project-scoped legacy stubs as live
routes.

## Modules

| Path                                  | Current name        | Canonical name      | Rationale                                                                                                                                              |
| ------------------------------------- | ------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modules/ai/`                         | `ai/`               | `ai/`               | No conflict.                                                                                                                                           |
| `modules/assets/`                     | `assets/`           | `assets/`           | No conflict (note: no public `index.ts` — separate cleanup).                                                                                           |
| `modules/editor/`                     | `editor/`           | `editor/`           | No conflict.                                                                                                                                           |
| `modules/export/`                     | `export/`           | `export/`           | No conflict.                                                                                                                                           |
| `modules/project/`                    | `project/`          | `project/`          | Powers the Project Hub. No conflict.                                                                                                                   |
| `modules/reader/`                     | `reader/`           | `reader/`           | No conflict.                                                                                                                                           |
| `modules/settings/`                   | `settings/`         | `settings/`         | No conflict.                                                                                                                                           |
| `modules/world-building/`             | `world-building/`   | `world-building/`   | Already canonical.                                                                                                                                     |
| `modules/outliner/`                   | `outliner/`         | **`outline/`**      | Match the route segment `routes/projects/[id]/outline/` and the user-facing nav copy "Outline".                                                        |
| `modules/consistency/`                | `consistency/`      | **`continuity/`**   | The continuity route already imports from this module; the user-facing label is "Continuity". Folded into `modules/continuity/` — see merge note below. |
| `modules/continuity/`                 | `continuity/`       | **`continuity/`**   | Receiver of the merge from `modules/consistency/`. Becomes the single source for the Continuity Command surface.                                       |
| `modules/bible/`                      | `bible/`            | **(retire)**        | World-building shell already supersedes it. Public exports either dead or duplicated by `modules/world-building/`. Inlined / removed in stage-004.      |

### Module-merge notes

- **`consistency/` → `continuity/`:** the rename is a verbatim
  folder move plus a barrel update. `modules/continuity/` today is
  near-empty (`components/` + `index.ts`). Nothing in
  `modules/consistency/` has another consumer, so the merge is
  one-way (`consistency` becomes the new internals of
  `continuity`). Public re-exports from `continuity/index.ts` keep
  their existing names; only the internal `from '$modules/consistency/...'`
  paths change.
- **`bible/` → retire:** every export in `modules/bible/index.ts`
  must be checked against `modules/world-building/` for a peer.
  Where a peer exists, switch the import; where it doesn't,
  promote the export into `modules/world-building/`. Stage-004
  blocks `bible/` deletion until grep confirms zero remaining
  consumers.

## Editor module — component file rename map

The editor route split (`editor/` vs `editor/[sceneId]/`) is real
and must be preserved. What needs to be unambiguous is which
component renders which screen. Today both names contain
"Editor"/"Frame"/"Surface" with no signposting.

| File                                                       | Current name            | Canonical name              | Renders                                                            |
| ---------------------------------------------------------- | ----------------------- | --------------------------- | ------------------------------------------------------------------ |
| `modules/editor/components/ManuscriptSurface.svelte`       | `ManuscriptSurface`     | **`ManuscriptEditorPane`**  | The multi-pane writing surface used by `routes/.../editor/+page`. |
| `modules/editor/components/DocumentEditorFrame.svelte`     | `DocumentEditorFrame`   | **`SceneEditorFrame`**      | The focused single-scene editor used by `routes/.../editor/[sceneId]/+page`. |

Other editor components (`SaveStatus`, `RecoveryPrompt`,
`VersionHistoryPanel`) are already screen-shaped names and stay.

## Open questions for user

1. **Legacy stub retention:** `bible/` and `consistency/` route
   stubs currently 307 to their canonical successors. Recommendation
   is to **keep them indefinitely** as redirects so external links
   never 404. Confirm or specify a deprecation date.
2. **`modules/bible/` retirement:** if any export turns out to be
   a unique surface (no peer in `world-building/`), should we
   migrate that export into `world-building/` (preferred) or move
   it to `$lib/`? Default = migrate to `world-building/`.
3. **Editor component names:** the proposed pair is
   `ManuscriptEditorPane` (multi-pane) and `SceneEditorFrame`
   (focused). Acceptable, or do you want a different vocabulary
   (e.g. "Workspace" / "Focus")?
