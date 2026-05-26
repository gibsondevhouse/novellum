---
title: Table Registry
slug: part-001-table-registry
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-001-table-registry-and-manifest
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Create the single source of truth for which SQLite tables belong inside a `.novellum` project backup, with explicit include / exclude reasons for every table that exists in `SCHEMA_SQL`.

## Scope

**In scope:**

- New `src/lib/server/backup/table-registry.ts`.
- A guardrail test that fails when a new table is added to `SCHEMA_SQL` without being classified.

**Out of scope:**

- Reading or writing any table data (phase-002).
- Manifest construction (sibling part-002).

## Implementation Steps

1. Add `src/lib/server/backup/table-registry.ts` that exports:
   - `BackupTableEntry = { name: string; scope: 'project' | 'global' | 'system'; include: boolean; reason: string; projectIdColumn?: string }`.
   - `BACKUP_TABLE_REGISTRY: readonly BackupTableEntry[]` covering every table in `SCHEMA_SQL`.
   - `getProjectBackupTables(): readonly BackupTableEntry[]` — returns entries where `include === true`.
2. Classify each table from `SCHEMA_SQL`:
   - `include: true` for project-scoped data tables (projects, chapters, scenes, beats, characters, character_relationships, locations, lore_entries, plot_threads, timeline_events, consistency_issues, scene_snapshots, story_frames, acts, arcs, milestones, stages, export_settings, writing_styles, templates, system_prompts, chat_instructions).
   - `include: false` for `schema_migrations` (reason: "schema metadata; reconstructed by migrations on import"), `backup_snapshots` (reason: "machine-local snapshot registry"), and any global / cross-project tables.
3. Add `tests/backup/table-registry.test.ts`:
   - Parses `SCHEMA_SQL` for `CREATE TABLE IF NOT EXISTS \w+` and asserts every table appears in the registry with a non-empty `reason`.
   - Asserts `schema_migrations` and `backup_snapshots` are present and `include: false`.
   - Asserts every entry with `scope: 'project'` and `include: true` declares a `projectIdColumn` (except the root `projects` row itself).

## Files

**Create:**

- `src/lib/server/backup/table-registry.ts`
- `tests/backup/table-registry.test.ts`

## Acceptance Criteria

- [ ] All tables in `SCHEMA_SQL` are accounted for (test enforces this).
- [ ] No string-list of tables exists in any other backup file once later phases land — they all import from this registry.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- A future migration creates a new table → guardrail test must fail loudly until the engineer classifies it.
- Tables that currently live in `SCHEMA_SQL` but should not be backed up (e.g. caches) must be `include: false` with a documented reason, not silently omitted.

## Notes

- This part is intentionally pure (no DB handle, no I/O) so it can be imported by both server and test contexts.
