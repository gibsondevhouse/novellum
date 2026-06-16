# Routing

> Last verified: 2026-06-16

SvelteKit file-based routing under [src/routes/](../../src/routes/).

## Top-level

| Path | File(s) | Purpose |
| --- | --- | --- |
| `/` | `+page.svelte`, `+page.ts` | Editorial homepage / projects library. |
| `/books` | `books/` | Books library view. |
| `/stories` | `stories/` | Stories library view. |
| `/images` | `images/` | Asset library. |
| `/nova` | `nova/` | Nova AI workspace (full-screen). |
| `/onboarding` | `onboarding/` | First-run onboarding flow (conditional render). |
| `/settings` | `settings/` | App settings shell (Appearance, Defaults, Shortcuts, AI, Data). |
| `/projects/[id]/...` | `projects/[id]/` | Project workspace shell — see below. |

The root layout ([src/routes/+layout.svelte](../../src/routes/+layout.svelte)) provides the persistent app sidebar and resolves the active project, scene, and chapter from `$page` reactively.

## Active Context Resolution

Plan-044 introduced a centralized `activeContext` store (`src/lib/stores/active-context.svelte.ts`) that resolves the current project, scene, and chapter IDs from:
1.  **Query Parameters** (`?sceneId=`, `?chapterId=`): Highest priority for deep linking.
2.  **Route Parameters** (`[id]`, `[sceneId]`, `[chapterId]`): Canonical route context.
3.  **Page Data** (`page.data.scene`, `page.data.chapter`): Fallback for deep routes where IDs are loaded but not in the path.

Nova components ([src/modules/nova/](../../src/modules/nova/)) use this store via the root layout's prop-drilling to ensure AI grounding stays in sync with the user's location.

## Project workspace (`/projects/[id]/...`)

Project-scoped routes inside [src/routes/projects/[id]/](../../src/routes/projects/%5Bid%5D/):

| Path | Purpose |
| --- | --- |
| `/projects/[id]` | Lands and redirects (typically to `/hub`). |
| `/projects/[id]/hub` | Project Hub dashboard — trust cards, word counts, recent activity. |
| `/projects/[id]/outline` | Outline / story-planning workspace. |
| `/projects/[id]/arcs` | Arc index workspace. |
| `/projects/[id]/arcs/[arcId]` | Arc detail. |
| `/projects/[id]/arcs/[arcId]/acts/[actId]` | Act detail. |
| `/projects/[id]/arcs/[arcId]/acts/[actId]/chapters/[chapterId]` | Chapter detail (drilldown). |
| `/projects/[id]/editor` | Multi-pane manuscript editor. |
| `/projects/[id]/editor/[sceneId]` | Single-scene focused editor. |
| `/projects/[id]/world-building` | World-building shell (Personae, Atlas, Archive, Threads, Chronicles). |
| `/projects/[id]/continuity` | Continuity / consistency check UI. |
| `/projects/[id]/story-bible` | **Legacy redirect** → `/projects/[id]/world-building`. |
| `/projects/[id]/consistency` | **Legacy redirect** → `/projects/[id]/continuity`. |

The project layout ([src/routes/projects/[id]/+layout.svelte](../../src/routes/projects/%5Bid%5D/+layout.svelte)) loads the active project via the API client (not Dexie — see the gotcha note at the bottom).

## Page conventions

- Pages are **thin**: load data via `+page.ts` / `+layout.ts`, render module components, no business logic inline.
- Module imports go through barrels: `import { OutlineWorkspace } from '$modules/outline'`.
- Cross-module composition happens in routes, not inside modules.

## API routes

See [backend.md](./backend.md) for the full API surface. Quick map:

```text
src/routes/api/
├── ai/                  # OpenRouter proxy + key validation
├── backup/              # /backup/projects/[id]
├── db/                  # 22 entity routes (acts, arcs, beats, chapters, …)
├── local-files/         # image upload + path normalization
├── nova/                # nova/context
├── projects/            # per-project helpers (character scratchpad)
├── restore/             # restore preview + apply
└── settings/            # about, ai-key, ai-status, storage-location
```

## Active-project detection (gotcha)

Do **not** infer the "active editable project" from `$page.params.id` alone. Any route with `[id]` (e.g. `/books/[id]`) will trigger that param. Gate edit-only sidebar sections by a pathname check like `$page.url.pathname.startsWith('/projects/')` before linking to `/projects/${id}/...`.

## Layout loader gotcha

Project route layout loaders must use the same data source the rest of the app uses. Shelves read projects from `/api/db/projects` — so [src/routes/projects/[id]/+layout.ts](../../src/routes/projects/%5Bid%5D/+layout.ts) does too. Reading Dexie directly there can cause false 404s (`Project "..." not found`) even when sidebar links are correct.

## Endpoint export gotcha

In `+server.ts` files, do **not** export helper functions with arbitrary names (e.g. `buildSomethingResponse`). Postbuild validation only permits endpoint handlers, `config`, and `_`-prefixed extras. Keep helpers in sibling modules (e.g. `http.ts`) and import them.

## See also

- [system.md](./system.md) — overall architecture.
- [backend.md](./backend.md) — full API endpoint list.
- [04-modules/](../04-modules/) — what each module surfaces in routes.
