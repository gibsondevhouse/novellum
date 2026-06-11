---
title: Search Memory Baseline
slug: part-001-search-memory-baseline
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-002-search-memory-baseline
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Add local full-text search as the first production memory layer for agent context retrieval.

## Scope

**In scope:**

- Add SQLite FTS-backed indexing for project-owned authoring and world-building records.
- Add search repository APIs with project isolation and ranked results.
- Integrate search results into context builders where scoped retrieval needs broader recall.
- Add rebuild and repair behavior for search indexes.

**Out of scope:**

- Embeddings, vector indexes, cloud search, or remote memory services.
- Sending full manuscript content to any model as a workaround for retrieval gaps.

## Implementation Steps

1. Define FTS tables and indexing policy for each project-owned content source.
2. Add indexing hooks or rebuild commands for create, update, delete, restore, and backup import paths.
3. Add search repository and context-builder integration.
4. Add tests for project isolation, ranking, update/delete consistency, and index rebuild.
5. Save search memory evidence under this part.

## Files

**Create:**

- `src/lib/server/search/project-search-index.ts`
- `src/lib/server/search/project-search-service.ts`
- `src/lib/server/db/migrations/0007_project_search_fts.ts`
- `tests/search/project-search-index.test.ts`
- `tests/search/project-search-service.test.ts`
- `tests/sqlite/migrations/0007-project-search-fts.test.ts`
- `evidence/search-memory-baseline-2026-06-11.md`

**Update:**

- `src/lib/server/db/migration-registry.ts`
- `src/lib/server/nova/context.ts`
- `src/modules/ai/services/nova-context.ts`
- `src/lib/ai/context-engine.ts`
- `src/lib/server/restore/restore-project.ts`
- `src/lib/server/backup/build-project-backup.ts`

**Reference:**

- `src/lib/server/nova/context-graph.ts`
- `src/lib/server/nova/context-renderers.ts`
- `src/lib/ai/context-builder.ts`
- `tests/ai/nova-context.test.ts`
- `tests/ai/nova-context-planner.test.ts`
- `tests/backup/project-restore.test.ts`

## Acceptance Criteria

- [ ] SQLite FTS indexes cover manuscript, outline summaries, characters, locations, lore, plot threads, timeline events, and accepted generated artifacts where appropriate.
- [ ] Context builders can request ranked local search results without sending the full manuscript.
- [ ] Tests prove indexing, updates, deletes, ranking, and project isolation.

## Edge Cases

- Restored projects may need full search index rebuild.
- Deleted scenes or entities must not remain in search results.

## Notes

Keep search results explainable. Context disclosure should be able to tell the user which project records were included.
