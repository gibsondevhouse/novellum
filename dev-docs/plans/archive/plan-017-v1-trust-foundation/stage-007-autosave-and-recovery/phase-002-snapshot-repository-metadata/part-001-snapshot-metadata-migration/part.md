---
title: Snapshot Metadata Migration
slug: part-001-snapshot-metadata-migration
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-002-snapshot-repository-metadata
started_at: 2026-04-29
completed_at: 2026-04-29
estimated_duration: 0.5d
---

## Objective

Migration 0003 adds metadata columns to `scene_snapshots`, the
`SceneSnapshot` type and the repository expose them, and the POST
endpoint enforces near-duplicate suppression.

## Files

**Create:**

- `src/lib/server/db/migrations/0003_scene_snapshot_metadata.ts`
- `tests/sqlite/migrations/0003-snapshot-metadata.test.ts`

**Modify:**

- `src/lib/server/db/migration-registry.ts`
- `src/lib/server/db/schema.ts`
- `src/lib/db/domain-types.ts`
- `src/modules/editor/services/snapshot-repository.ts`
- `src/routes/api/db/scene_snapshots/+server.ts`

## Acceptance Criteria

- [x] `scene_snapshots` gains `wordCount`, `label`, `source`, `reason`
      columns (nullable / defaulted; idempotent ALTER).
- [x] Repository attaches `source: 'autosave' | 'manual' |
      'pre-restore' | 'pre-migration'` and `wordCount` automatically.
- [x] Identical consecutive autosave snapshots collapse — the second
      attempt does not insert a new row.
- [x] `pnpm run check && pnpm run lint && pnpm run test` green.
