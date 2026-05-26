---
title: Migration Strategy
slug: part-002-migration-strategy
part_number: 2
status: complete
owner: Backend Agent
phase: phase-001-full-entity-schema-and-migrations
estimated_duration: 1d
---

## Objective

Define and implement the Dexie `versionchange` upgrade handler that migrates any existing v1 database to the v2 schema. Ensure no data loss for tables that existed in v1.

## Context

- `src/lib/db/db.ts` — add `.upgrade()` callbacks to the version 2 declaration
- `dev-docs/data-model.md` — authoritative field list for each entity

## Migration Requirements

### v1 → v2 Changes

| Table                     | Action               | Detail                                                                                                                |
| ------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `projects`                | existing — no change | id, name, createdAt already present                                                                                   |
| `scenes`                  | add fields           | Add `projectId`, `wordCount`, `updatedAt` if missing; populate `projectId` by looking up parent chapter's `projectId` |
| `beats`                   | existing or new      | If existed in v1, add `projectId`; else create table                                                                  |
| `chapters`                | new table            | Safe — just declare                                                                                                   |
| `characters`              | new table            | Safe — just declare                                                                                                   |
| `character_relationships` | new table            | Safe — just declare                                                                                                   |
| `locations`               | new table            | Safe — just declare                                                                                                   |
| `lore_entries`            | new table            | Safe — just declare                                                                                                   |
| `plot_threads`            | new table            | Safe — just declare                                                                                                   |
| `timeline_events`         | new table            | Safe — just declare                                                                                                   |

## Acceptance Criteria

- [ ] `db.ts` has a `.version(2).upgrade(tx => ...)` block that populates `projectId` on existing `scenes` and `beats`
- [ ] No data from v1 `projects` or `scenes` is lost after migration
- [ ] A manual test procedure is documented: open app with old DB, verify migration ran, verify data is intact
- [ ] Dev-only `resetDb()` utility function available (exported from `db.ts`; only callable in dev/test environments) that drops and recreates the DB for clean testing
- [ ] `pnpm run check` exits with zero errors

## Out of Scope

- Automated regression test for migration (→ part-001-repository-tests will exercise v2 schema from clean state)
