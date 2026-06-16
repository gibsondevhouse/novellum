# Data Model

> Last verified: 2026-06-16 (plan-053 worldbuilding/outline review-flow closure)

The single source of truth is the SQLite schema in [src/lib/server/db/schema.ts](../../src/lib/server/db/schema.ts). The Dexie mirror in [src/lib/db/](../../src/lib/db/) (currently schema **v11**) is used **only** for `.novellum.zip` portability — never for live reads/writes.

## Tables (28 shipped + auxiliary)

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
| `stages` | Outline stages (leaf of the seven-layer hierarchy: Arc → Act → Milestone → Chapter → Scene → Beat → Stage). Pipeline run targets. | `projectId`, `beatId`, `position`. |
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

### AI Agent Runtime (Hardened Runtime, Plan-049)

| Table | Purpose |
| --- | --- |
| `agent_runs` | Durable record of an AI execution (family, intent, status). |
| `agent_run_steps` | Granular steps within a run (kind, input/output hashes). |
| `agent_tool_calls` | Individual tool invocations by an agent. |
| `agent_artifacts` | Reviewable artifacts produced by a run (proposals, drafts). |
| `agent_usage` | Token usage and cost estimates (estimated vs provider). |
| `agent_run_errors` | Detailed, redacted error logs for failed runs. |
| `agent_jobs` | SQLite-backed job queue for background agent tasks. |
| `agent_trace_events` | Fine-grained execution traces (logs, metadata). |
| `agent_trace_redactions` | Redaction rules applied to trace metadata. |

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
| `assets` | Project assets (images, files) for export and Nova. |

### Auxiliary key-value tables

These are not in the core count but are first-class:

- **`app_preferences`** — typed user preferences keyed by string.
- **`project_metadata`** — per-project flexible metadata (scoped by `projectId`/`scope`/`ownerId`/`key`). Supported scopes: `'scene' | 'chapter' | 'project' | 'pipeline'`.
- **`schema_migrations`** — tracking of applied database migrations.

The complete count is **28 shipped narrative + AI tables + auxiliary** — see [schema.ts](../../src/lib/server/db/schema.ts) for the canonical list.

## Hierarchy
...

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

### Outline Draft Materialization Map

Plan-040 outline checkpoints use [`buildOutlineMaterializationMap`](../../src/lib/server/outline/outline-materialization-map.ts) before any accept transaction writes hierarchy rows. The mapper is pure and deterministic: it emits row-shaped data for `arcs`, `acts`, default `milestones`, `chapters`, and `scenes`, plus scene metadata sidecars; it does not import the database or execute writes.

V1 outline drafts generate Arc → Act → Chapter → Scene. To preserve seven-layer compatibility without inventing weak leaf work:

- `arcs`, `acts`, `chapters`, and `scenes` preserve the generated node ids as canonical row ids.
- One default milestone bucket is emitted per act with `chapterIds` for the act's generated chapters.
- No beat or stage rows are invented by the mapper. Later contracts may add generated beats explicitly; until then `beats` and `stages` remain empty.
- Scene intent is stored as scene-scoped `project_metadata` sidecars for plan-038 draft compatibility:
  - key `quickIntent` and compatibility alias `quick-intent`: `{ goal, obstacle, conflict, turn, outcome }`
  - key `clarity`: `{ sceneGoal, immediateObstacle, turningPoint, outcome }`

The accept route owns conflict checks, stale preconditions, transaction boundaries, JSON encoding, and lifecycle mutation. The mapper only defines what would be written. Accept is blocked when existing hierarchy rows are present; plan-040 does not merge or overwrite existing outlines.

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
