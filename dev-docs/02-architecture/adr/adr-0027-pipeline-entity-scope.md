# ADR 0027: Pipeline Entity Scope (V1.1)

## Status
Proposed (2026-05-26)

## Context
The AI Pipeline (V1.1) introduces 8 stages of generation across worldbuilding and authoring flows. Research into fiction craft and existing toolsets (fiction-pipeline-foundations-2026-05-26.md) identifies several "first-class" entities that currently lack dedicated persistence in the Novellum schema, leading to data fragmentation across `lore_entries` or `project_metadata`.

## Decision
We will extend the database schema with three new first-class tables and defer the fourth candidate (Research Provenance) to existing structures.

### 1. Factions (ACCEPTED)
- **Rationale**: Essential for worldbuilding and character affiliation. Currently, character factions are free-text strings. A dedicated table allows for shared mission, ideology, and organizational pressure across multiple characters.
- **Table**: `factions`
- **Fields**: `id`, `projectId`, `name`, `type`, `description`, `mission`, `ideology`, `createdAt`, `updatedAt`.

### 2. Themes (ACCEPTED)
- **Rationale**: Required for narrative coherence. AI generation often collapses themes into clichés; structured theme payloads (tension pairs, symbols) allow for more disciplined thematic reinforcement in prose drafts.
- **Table**: `themes`
- **Fields**: `id`, `projectId`, `title`, `description`, `tensionPair`, `imagery`, `createdAt`, `updatedAt`.

### 3. Glossary Terms (ACCEPTED)
- **Rationale**: Prevents `lore_entries` bloat. Glossary terms are frequently queried by the AI for terminology stability. Separation from general lore allows for cleaner terminology injection into prompts.
- **Table**: `glossary_terms`
- **Fields**: `id`, `projectId`, `term`, `definition`, `pronunciation`, `category`, `createdAt`, `updatedAt`.

### 4. Research Provenance (DEFERRED)
- **Rationale**: Minimal value-bearing scope compared to others. Research findings will continue to land in `lore_entries` (with a `research` category). Detailed source notes and confidence scores will be stored as JSON in the existing `lore_entries.content` or `project_metadata`.
- **Mapping**: Store in `lore_entries` where `category = 'research'`.

## Consequences
- New migrations (0004) are required.
- API endpoints (`/api/db/...`) must be scaffolded for CRUD.
- Domain types and table registries must be updated to support backup/restore.
- The AI context engine must be updated to pull these new entities into pipeline prompts.
