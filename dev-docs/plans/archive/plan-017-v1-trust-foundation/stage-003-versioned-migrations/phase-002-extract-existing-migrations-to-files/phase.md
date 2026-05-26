---
title: Extract Existing Migrations to Files
slug: phase-002-extract-existing-migrations-to-files
phase_number: 2
status: in-progress
owner: Planner Agent
stage: stage-003-versioned-migrations
parts:
  - part-001-0001-baseline
  - part-002-0002-add-backup-metadata
  - part-003-retire-legacy-ensure-column
estimated_duration: 1d
---

## Goal

Replace the inline `ensureColumn`/backfill helpers in `src/lib/server/db/migrations.ts` with discrete, ordered, versioned migration files under `src/lib/server/db/migrations/`, then retire the legacy entry point.

## Decision: collapse to a baseline + backup_metadata

The original plan called for four files (`0001_initial`, `0002_add_story_structure`, `0003_add_ai_tables`, `0004_add_backup_metadata`) reconstructing the historical evolution captured by the `ensureColumn` helpers. After review, this was rejected as archaeology with no behavioral benefit:

- The current `SCHEMA_SQL` is already the canonical union of all historical patches.
- Legacy DBs that already have every column do not need 4 separate migrations to confirm that fact; one no-op-on-current `0001_baseline` is sufficient.
- New tables introduced in this stage (`backup_snapshots` for stage-004) get a real migration of their own.

The collapsed shape is:

| Version | Name | Purpose |
| --- | --- | --- |
| 1 | `0001_baseline` | Bring any DB to current canonical schema (SCHEMA_SQL + ensureColumn ALTERs + data backfills + INDEX_SQL). |
| 2 | `0002_add_backup_metadata` | Create `backup_snapshots` table consumed by stage-004 and phase-003. |

## Parts

| #   | Part                                                                       | Status  | Assigned To | Est. Duration |
| --- | -------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [0001 Baseline](part-001-0001-baseline/part.md)                            | `draft` | backend     | 0.5d          |
| 002 | [0002 Add Backup Metadata](part-002-0002-add-backup-metadata/part.md)      | `draft` | backend     | 0.25d         |
| 003 | [Retire Legacy ensureColumn](part-003-retire-legacy-ensure-column/part.md) | `draft` | backend     | 0.25d         |

## Acceptance Criteria

- [ ] Migration files exist under `src/lib/server/db/migrations/` and are registered in `migration-registry.ts`.
- [ ] `src/lib/server/db/migrations.ts` is deleted; `runLegacyEnsureColumns` is removed from `client.ts` and `index.ts`.
- [ ] Legacy DB fixture opens cleanly with `schema_migrations` populated for versions 1 and 2.
- [ ] Fresh DB applies migrations 1 and 2 in order from empty.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Data backfills (`backfillIndividualsFromNotesEnvelope`, `normalizeAndDedupeCharacterRelationships`, `backfillRelationshipStatusFromDescriptionEnvelope`) live inside `0001_baseline` because they are idempotent and form part of the "bring DB to current canonical schema" contract.
- `backup_snapshots` is intentionally **not** added to `SCHEMA_SQL`; the migration owns it.
