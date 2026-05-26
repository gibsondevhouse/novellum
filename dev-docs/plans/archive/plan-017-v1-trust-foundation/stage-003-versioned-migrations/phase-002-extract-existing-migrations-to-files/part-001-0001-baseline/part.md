---
title: 0001 Baseline
slug: part-001-0001-baseline
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-002-extract-existing-migrations-to-files
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Author migration `0001_baseline.ts` that brings any SQLite database — fresh or legacy — to the current canonical schema in a single ordered, transactional step.

## Scope

**In scope:**

- New file `src/lib/server/db/migrations/0001_baseline.ts` exporting `{ version: 1, name: '0001_baseline', checksum, up }`.
- `up()` runs (in order):
  1. `SCHEMA_SQL` (CREATE TABLE IF NOT EXISTS for all canonical tables).
  2. PRAGMA-guarded `ensure*Column` helpers, lifted as-is from `migrations.ts`.
  3. Data backfills (`backfillIndividualsFromNotesEnvelope`, `backfillRelationshipStatusFromDescriptionEnvelope`, `normalizeAndDedupeCharacterRelationships`).
  4. `INDEX_SQL`.
- Register in `migration-registry.ts`.

**Out of scope:**

- `backup_snapshots` (part-002).
- Removing the legacy bridge from `client.ts` (part-003).

## Implementation Steps

1. Create `src/lib/server/db/migrations/` directory.
2. Move helpers verbatim from `migrations.ts` into `0001_baseline.ts` as file-local functions.
3. Use a stable checksum literal (`'baseline-v1'`).
4. Add to `MIGRATION_REGISTRY`.

## Files

**Create:**

- `src/lib/server/db/migrations/0001_baseline.ts`

**Update:**

- `src/lib/server/db/migration-registry.ts`

## Acceptance Criteria

- [ ] On a fresh `:memory:` DB the runner applies migration 1 and the resulting schema matches `SCHEMA_SQL`.
- [ ] Re-running on a DB already at head is a no-op.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
