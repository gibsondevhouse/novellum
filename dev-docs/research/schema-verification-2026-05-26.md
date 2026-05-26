# Schema Verification — 2026-05-26

> Verified `src/lib/server/db/schema.ts` against table-name claims in
> [`fiction-pipeline-foundations-2026-05-26.md`](./fiction-pipeline-foundations-2026-05-26.md)
> and [`novellum-orientation-2026-05-26.md`](./novellum-orientation-2026-05-26.md).

## Tables that exist (25)

`acts`, `app_preferences`, `arcs`, `beats`, `chapters`,
`character_relationships`, `characters`, `chat_instructions`,
`consistency_issues`, `export_settings`, `locations`, `lore_entries`,
`milestones`, `plot_threads`, `project_metadata`, `projects`,
`scene_snapshots`, `scenes`, `schema_migrations`, `stages`,
`story_frames`, `system_prompts`, `templates`, `timeline_events`,
`writing_styles`.

## Research claims — all accurate

Every table name cited in the research files exists in `schema.ts`:
`projects`, `story_frames`, `project_metadata`, `lore_entries`,
`locations`, `characters`, `character_relationships`,
`timeline_events`, `plot_threads`, `consistency_issues`,
`scene_snapshots`, `arcs`, `acts`, `chapters`, `scenes`, `beats`,
`writing_styles`, `system_prompts`, `chat_instructions`,
`app_preferences`, `schema_migrations`.

## Tables the research missed — must inform plan-027

### `stages` — sub-beat unit

```sql
CREATE TABLE stages (
  id TEXT PRIMARY KEY,
  beatId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

This is **not** a pipeline-stage table. It's a granular outline unit
nested under `beats`. Note: `stages.status` already supports a
lifecycle (`'planned'` default), which is relevant for staged-generation
review/accept gates.

### `milestones` — sub-act unit

```sql
CREATE TABLE milestones (
  id TEXT PRIMARY KEY,
  actId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL,
  chapterIds TEXT NOT NULL DEFAULT '[]',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

Sits between `acts` and `chapters`. `chapterIds` is a JSON array of
chapter IDs that belong to the milestone. This is the natural
persistence target for Save-the-Cat-style turning points (Catalyst,
Midpoint, All-Is-Lost, etc.) and Story-Grid act-level beats.

### `templates`

```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

Per-project reusable content templates. Potential home for stored
prompt templates, scene-brief scaffolds, or world-bible entry
templates referenced by the staged pipeline.

### `export_settings`

Mentioned in orientation as "table(s)" but not detailed. Exists; not
directly relevant to staged generation.

## Corrected outline hierarchy

The research assumed `arc → act → chapter → scene → beat`. **Actual
canonical hierarchy is:**

```text
arcs → acts → milestones → chapters → scenes → beats → stages
```

`milestones` and `stages` are real, persisted, structural layers.
plan-027 must either:

1. Map Save-the-Cat-style turning points onto `milestones` and
   sub-scene narrative beats onto `stages`, **or**
2. Justify ignoring them (e.g., V1 of the staged pipeline emits only
   the layers ChatGPT covered and leaves milestones/stages for a later
   stage).

## Confirmed extension candidates (research was right)

The research flagged these as **clean** persistence gaps that would
need schema extension to be first-class:

- **Factions / organizations** — no dedicated table. Today they leak
  into `characters.faction` and `locations.factionIds`.
- **Themes / motifs** — `story_frames.theme` is single-field; relational
  theme→scene/arc payoff modeling absent.
- **Glossary** — no dedicated table; would currently piggyback on
  `lore_entries`.
- **Research provenance / sources** — no dedicated table; the research
  flagged `project_metadata` as a plausible but uncertain home.

These remain valid extension candidates for plan-027 to scope.

## Things still unverified

The research file self-flagged 20 repo unknowns. Of those, only the
schema table names have been verified in this pass. Still open before
implementation work begins:

- Exact `src/lib/ai/` file layout and `Orchestrator` implementation
  depth.
- Whether OpenRouter is enforced everywhere or has provider remnants.
- Whether structured-output / JSON schema validation is consistent.
- Whether `/api/db/*` is the only live SQLite access path.
- CI pass/fail state and visual-test flakiness around Nova.

These should be checked by whichever agent (Codex / Claude Code)
picks up plan-027 scaffolding.
