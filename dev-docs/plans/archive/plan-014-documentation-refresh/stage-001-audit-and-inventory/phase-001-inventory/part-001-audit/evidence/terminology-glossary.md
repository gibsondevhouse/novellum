# Terminology Glossary — plan-014

**Established:** 2026-04-20
**Scope:** All documentation refreshed under plan-014.

## Canonical Product Terminology

Use these terms consistently across refreshed docs.

- **Project Hub** — per-project dashboard (`/projects/[id]/hub`). Legacy: Dashboard.
- **Personae** — world-building sub-section for individuals / factions / lineages. Uses `IndividualsWorkspaceShell`. Legacy: Characters (module).
- **Atlas** — world-building sub-section for realms / landmarks / maps / notes. Uses `IndividualsWorkspaceShell`. Legacy: Locations.
- **Archive** — world-building sub-section for myths / technology / traditions / notes. Uses `IndividualsWorkspaceShell`. Legacy: Lore.
- **Threads** — world-building sub-section for major-arcs / sub-plots / motivations / notes. Uses `IndividualsWorkspaceShell`. Legacy: Plot Threads.
- **Chronicles** — world-building sub-section for eras / key-events / personal-histories / notes. Uses `IndividualsWorkspaceShell`. Legacy: Timeline.
- **Workspace** — structural planning surface (Arc → Act → Chapter → Scene). Legacy: Outliner.
- **Editor** — TipTap-based long-form prose editor. Legacy: Drafting Editor / Manuscript Writer.
- **Consistency** — `src/modules/consistency/` powers analysis passes. `src/modules/continuity/` is the UI wrapper.
- **Export** — DOCX / ePub / JSON exporters.
- **Portability** — `.novellum.zip` export/import. Legacy: Backup & Restore.

## Technical Stack Terminology

- **SvelteKit 2** — always include the major version.
- **Svelte 5 Runes** — `$state`, `$derived`, `$effect`; never `export let` or `$:`.
- **SQLite (server primary)** — via `better-sqlite3`; file: `novellum.db`.
- **Dexie (browser portability)** — current schema: **v11**.
- **OpenRouter** — external AI model routing.
- **TipTap 3** — rich text editor.
- **Runtime Agents** — shipped: `ContinuityAgent`, `EditAgent`, `RewriteAgent`, `StyleAgent`.
- **Aspirational Agents** — `AGENTS.md` lists but not yet implemented: `BrainstormAgent`, `OutlineAgent`, `DraftAgent`, `SummaryAgent`.
- **Meta-Agents** — `.github/agents/*` (planner, reviewer, architect, stylist, backend, ai).

## Data Model Terminology

Table names are snake_case; entity names in prose are PascalCase.

- `projects` → Project
- `chapters` → Chapter
- `scenes` → Scene
- `beats` → Beat
- `characters` → Character
- `character_relationships` → CharacterRelationship
- `locations` → Location
- `lore_entries` → LoreEntry
- `plot_threads` → PlotThread
- `timeline_events` → TimelineEvent
- `consistency_issues` → ConsistencyIssue (schema v4)
- `export_settings` → ExportSettings (schema v5)
- `scene_snapshots` → SceneSnapshot (schema v6)
- `story_frames` → StoryFrame (schema v7)
- `acts` → Act (schema v7)
- `arcs` → Arc (schema v8)
- `assets` → Asset (schema v9)
- `milestones` → Milestone (schema v10)
- `acts.arcId` indexed (schema v11)

## Writing Rules

- Never use `export let` or `$:` in prose describing Svelte 5.
- Use relative links for intra-doc navigation.
- Avoid bare URLs (MD034) — wrap with `<…>`.
- Prefer bulleted lists over wide tables (MD060).
- Code fences must declare a language (MD040).
