# Search Memory Baseline — Implementation Evidence

**Date:** 2026-06-14
**Plan:** plan-049-agent-runtime-stack-hardening
**Stage:** 004 — Model, Budget & Memory Capabilities
**Phase:** 002 — Search Memory Baseline
**Part:** 001 — Search Memory Baseline

## Files Shipped

| File | Action |
| --- | --- |
| `src/lib/server/db/migrations/0007_project_search_fts.ts` | Created |
| `src/lib/server/db/migration-registry.ts` | Updated |
| `src/lib/server/search/project-search-index.ts` | Created |
| `src/lib/server/search/project-search-service.ts` | Created |
| `src/lib/server/backup/table-registry.ts` | Updated |
| `tests/sqlite/migrations/0007-project-search-fts.test.ts` | Created |
| `tests/search/project-search-index.test.ts` | Created |
| `tests/search/project-search-service.test.ts` | Created |

## What Was Built

### Migration 0007

SQLite FTS5 virtual tables for 8 entity kinds: scenes, characters, locations, lore, plot_threads, timeline_events, outline_items, artifacts. Porter stemmer + ASCII tokenizer. All use `projectId UNINDEXED` for project isolation.

### `project-search-index.ts`

Low-level upsert/delete operations per entity kind. FTS5 upsert pattern: DELETE + INSERT (FTS5 has no UPDATE). All functions accept an optional `db` parameter for test injection.

`clearProjectSearchIndex(projectId)` removes all FTS rows for a project across all tables (used before restore or on deletion).

### `project-search-service.ts`

`searchProject(projectId, query, opts)` — ranked cross-kind search. Uses `bm25()` for scoring, `snippet()` for match highlighting. Results sorted ascending by BM25 (lower = more relevant in SQLite FTS5). Supports `limitPerKind` and `kinds` filters.

`searchProjectKind(projectId, query, kind, opts)` — single-kind search.

### Backup Table Registry

All 9 FTS virtual tables and their 5 shadow tables each (`_config`, `_content`, `_data`, `_docsize`, `_idx`) registered as `include: false` with clear justification. Agent runtime tables (migration 0006) also registered (they were missing before this part).

## Quality Gates (2026-06-14)

```text
pnpm check        — 0 errors, 0 warnings
pnpm lint         — clean
pnpm lint:css     — clean
pnpm test         — 258 files / 1887 tests PASS
pnpm check:tokens — 348 files / 0 violations
```

## Acceptance Criteria Status

- [x] SQLite FTS indexes cover manuscript (scenes), outline summaries (outline_items), characters, locations, lore, plot threads, timeline events, and accepted generated artifacts.
- [x] Context builders can request ranked local search results without sending the full manuscript (`searchProject` returns entityIds for canonical record resolution).
- [x] Tests prove indexing, updates, deletes, ranking, and project isolation (see `project-search-index.test.ts` and `project-search-service.test.ts`).
