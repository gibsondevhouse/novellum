# Routing Context

> Last updated: 2026-05-02

## File-Based Routing

Novellum uses SvelteKit 2 filesystem routing. The directory structure under `src/routes/` defines every URL.

## Top-Level Routes

- `src/routes/+layout.svelte` / `+layout.ts` — persistent app shell (sidebar, top bar, active-project wiring).
- `src/routes/+page.svelte` / `+page.ts` — landing/home.
- `src/routes/books/` — Books library views.
- `src/routes/stories/` — Stories library views.
- `src/routes/projects/` — Project-scoped workspace (dynamic `[id]`).
- `src/routes/images/` — Asset library.
- `src/routes/nova/` — Nova AI surface.
- `src/routes/settings/` — Settings surfaces (includes migration UI).
- `src/routes/styles/` — Writing styles.
- `src/routes/api/` — Server endpoints (REST + AI proxies).

## Project-Scoped Routes

Under `src/routes/projects/[id]/`:

- `+layout.svelte` / `+layout.ts` — project shell, resolves the active project from the URL.
- `+page.svelte` / `+page.ts` — landing / redirect for the project.
- `hub/` — **Project Hub** dashboard. Powered by `$modules/project`.
- `outline/` — **Outline** surface. Powered by `$modules/outline` (formerly `$modules/outliner`).
- `arcs/` — Arc-level planning. Drilldown: `arcs/[arcId]` → `arcs/[arcId]/acts/[actId]` → `arcs/[arcId]/acts/[actId]/chapters/[chapterId]`. Use the literal segment `unassigned` for arc/act values when an entity has no parent (e.g. `arcs/unassigned` lists acts with `arcId === null`).
- `editor/` — **Manuscript Editor**. Multi-pane writing surface (Story Compass + manuscript pane + AI panel). Renders [`ManuscriptEditorPane`](../src/modules/editor/components/ManuscriptEditorPane.svelte) (formerly `ManuscriptSurface`). This is the primary writing route most navigation links into.
- `editor/[sceneId]/` — **Scene Editor**. Focused single-scene editor with breadcrumbs, version history, and the RecoveryPrompt for unsaved drafts. Renders [`SceneEditorFrame`](../src/modules/editor/components/SceneEditorFrame.svelte) (formerly `DocumentEditorFrame`). Reached from the Outline, the Project Hub scene list, and arc/act/chapter drilldown links.
- `world-building/` — **World-Building** shell. Personae / Atlas / Archive / Threads / Chronicles navigation. Powered by `$modules/world-building`.
- `continuity/` — **Continuity Command** — consistency-pass results and triage. Powered by `$modules/continuity` (which absorbed the former `$modules/consistency` internals).

### Legacy redirect stubs

The following segments exist only as 307 redirects so external bookmarks and historical in-app links keep working. They have no UI of their own and must not be linked to from new code:

- `bible/` → `world-building/` (legacy alias retained indefinitely).
- `consistency/` → `continuity/` (legacy alias retained indefinitely).

Active-project resolution is handled by `src/lib/stores/active-project.svelte.ts`, which reads `page.params.id` reactively from `$app/state`.

## API Routes

- `src/routes/api/db/*` — REST endpoints for all server-side SQLite entities. One route per resource with collection (`+server.ts`) and item (`[id]/+server.ts`) handlers. Current resources: acts, arcs, beats, chapters, character_relationships, characters, chat_instructions, consistency_issues, export_settings, locations, lore_entries, milestones, plot_threads, projects, scene_snapshots, scenes, stages, story_frames, system_prompts, templates, timeline_events, writing_styles.
- `src/routes/api/ai/*` — OpenRouter proxy endpoints (keys stay server-side).
- `src/routes/api/local-files/*` — Local asset handling.
- `src/routes/api/projects/*` — Project-level helpers.

## Data Flow

1. A client navigates to `/projects/[id]/…`.
2. The `[id]` layout resolves active-project state from the URL.
3. Child routes call module services, which hit `/api/db/*` via `src/lib/api-client.ts`.
4. The SvelteKit server reads/writes the SQLite file (`novellum.db`) through `better-sqlite3`.
5. Dexie is used only for `.novellum.zip` portability (browser-side).
