# Data Model

> Last verified: 2026-05-26

The single source of truth is the SQLite schema in [src/lib/server/db/schema.ts](../../src/lib/server/db/schema.ts). The Dexie mirror in [src/lib/db/](../../src/lib/db/) (currently schema **v11**) is used **only** for `.novellum.zip` portability — never for live reads/writes.

## Tables (19 shipped + auxiliary)

### Core narrative entities

| Table | Purpose | Notable fields |
| --- | --- | --- |
| `projects` | Top-level book project. | `name`, `description`, `createdAt`, `updatedAt`. |
| `arcs` | Optional top-level grouping per project. | `projectId`, `arcType`, `purpose`, `position`. |
| `acts` | Mid-level structural unit. | `arcId` (nullable → "unassigned"), `position`. |
| `chapters` | Chapter-level unit. | `actId` (nullable), `position`, `title`. |
| `scenes` | Editable narrative scene. | `chapterId` (nullable), `position`, TipTap JSON content. |
| `beats` | Sub-scene story beats. | `sceneId`, `position`, `summary`. |
| `scene_snapshots` | Versioned scene snapshots for restore. | `sceneId`, `createdAt`, snapshot blob. |
| `story_frames` | Per-project story frames / templates. | `projectId`, frame data. |
| `stages` | Outline stages (above arcs in some flows). | `projectId`, `position`. |
| `milestones` | Project milestones. | `projectId`, `dueDate`. |

### World-building entities

| Table | Purpose |
| --- | --- |
| `characters` | Personae. |
| `character_relationships` | Edges between characters. |
| `locations` | Atlas. |
| `lore_entries` | Archive. |
| `plot_threads` | Threads. |
| `timeline_events` | Chronicles. |
| `factions` | Organizations and affiliations. |
| `themes` | Narrative themes and motifs. |
| `glossary_terms` | Terminology and lexicon. |

### AI / quality

| Table | Purpose |
| --- | --- |
| `consistency_issues` | ContinuityAgent output and triage state. |
| `chat_instructions` | Saved Nova chat instructions. |
| `system_prompts` | User-customizable system prompts. |
| `templates` | Project / outline templates. |
| `writing_styles` | StyleAgent presets. |

### Settings / export

| Table | Purpose |
| --- | --- |
| `export_settings` | Per-project export configuration. |

### Auxiliary key-value tables

These are not in the "16 core" count but are first-class:

- **`preferences`** — typed user preferences keyed by string. Foundation for [plan-022-settings-ia](../plans/plan-022-settings-ia/plan.md). REST under `/api/db/preferences/[key]`.
- **`project_metadata`** — per-project flexible metadata (scoped by `projectId`/`scope`/`ownerId`/`key`). REST under `/api/db/project-metadata/...`. Supported scopes: `'scene' | 'chapter' | 'project' | 'pipeline'`. The `'pipeline'` scope stores `WorldbuildCheckpointRecord` JSON keyed by checkpoint id (owner `'vibe-worldbuild'`); accepted populated-bible checkpoints atomically project into `factions`, `characters`, `locations`, `themes`, `glossary_terms`, `lore_entries`, `plot_threads`, and `timeline_events`. See [ADR-0027](./adr/adr-0027-pipeline-entity-scope.md) and [pipeline.md](../03-ai/pipeline.md).

The complete count, including auxiliary tables, is **16 shipped narrative + AI tables + 5 auxiliary** (preferences, project-metadata, etc.) — see [schema.ts](../../src/lib/server/db/schema.ts) for the canonical list.

## Hierarchy

```text
Project
└── Arc           (arcs.projectId)            optional grouping
    └── Act       (acts.arcId, nullable)      acts with arcId=null → "unassigned"
        └── Milestone (milestones.actId)      narrative beats anchoring chapters
            └── Chapter (chapters.actId, nullable)
                └── Scene (scenes.chapterId, nullable) → opens in editor
                    └── Beat (beats.sceneId)
                        └── Stage (stages.beatId, status: planned|in_progress|completed)
```

`null` parent ID denotes **unassigned** content and is rendered explicitly in the workspace under a dedicated `unassigned` segment so orphaned content stays discoverable.

### Seven-layer AI context traversal

The full seven-layer narrative spine (`arcs → acts → milestones → chapters → scenes → beats → stages`) is normalized for AI consumption by [`normalizeSevenLayerOutline`](../../src/modules/outline/services/seven-layer-outline.ts). The helper deterministically sorts every layer by `order` then `title`, and resolves `Milestone.chapterIds` into canonical chapter order so model output stays stable across runs.

- `AiContext.outlineHierarchy` is populated whenever the active pipeline task is in the `vibe-author` family OR the `contextPolicy` is `outline_scope`.
- `filterOutlineByStageStatus` enforces the `Stage` lifecycle (`planned | in_progress | completed`) at retrieval time so author-stage tasks only see the slices they should act on.
- `getSevenLayerOutline(projectId)` in [`outline-data-service.ts`](../../src/modules/outline/services/outline-data-service.ts) is the public traversal entry point for non-AI consumers (export, telemetry, etc.).

## Repositories

Client-side repository services wrap the API client:

- [src/modules/project/services/arc-repository.ts](../../src/modules/project/services/) — `getArcsByProjectId`, `getArcById`, CRUD, `reorderArcs`.
- [src/modules/project/services/act-repository.ts](../../src/modules/project/services/) — `getActsByArcId(arcId | null)`, CRUD, `reorderActs`.
- [src/modules/project/services/chapter-repository.ts](../../src/modules/project/services/) — `getChaptersByActId(actId | null)`, CRUD, `reorderChapters`.
- [src/modules/editor/services/scene-repository.ts](../../src/modules/editor/services/) — `getScenesByChapterId`, `getScenesByProjectId`, CRUD.

## Hierarchy selection state

Held in [src/modules/project/stores/hierarchy-store.svelte.ts](../../src/modules/project/stores/) using `SvelteMap` keyed by `projectId`. Selecting a higher level clears downstream selections (selecting an arc clears act + chapter selection; selecting an act clears chapter).

## Conventions

- **IDs** are string ULIDs generated client-side ([src/lib/utils.ts](../../src/lib/utils.ts)).
- **JSON columns** are TEXT; encode/decode via [src/lib/server/db/serialize.ts](../../src/lib/server/db/serialize.ts).
- **Timestamps** are `INTEGER` UNIX milliseconds.
- **Foreign keys are enforced.** `PRAGMA foreign_keys = ON` is set in [client.ts](../../src/lib/server/db/client.ts).
- **WAL mode** is on for safe concurrent readers + single writer.
- **Indexes:** 22 in total. Most join columns and timestamp columns are indexed.

## Migrations

Versioned, applied on startup by [migrations.ts](../../src/lib/server/db/migrations.ts). Migrations are forward-only. Rollback is via backup restore.

When adding a new schema change:

1. Add a new migration function with the next version number.
2. Update `schema.ts` to reflect the final shape.
3. If the change touches portability, bump the Dexie mirror version too.
4. Add a regression test under [tests/sqlite/](../../tests/sqlite/) or [tests/db/](../../tests/db/).

## See also

- [backend.md](./backend.md) — endpoint surface that wraps each table.
- [05-workflow/portability-runbook.md](../05-workflow/portability-runbook.md) — backup/restore data flow.
