---
title: Snapshot Repository Metadata
slug: phase-002-snapshot-repository-metadata
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-007-autosave-and-recovery
parts:
  - part-001-snapshot-metadata-migration
  - part-002-snapshot-restore-endpoint
estimated_duration: 1d
---

## Goal

Promote scene snapshots from a flat append-only table to a metadata-rich
trust artefact: every snapshot records how it was created and why,
runaway snapshot growth is suppressed during continuous typing, and a
restore endpoint guarantees a "pre-restore" snapshot is taken before
the previous text is overwritten.

## Parts

| #   | Part                                                                                            | Status        | Assigned To | Est. Duration |
| --- | ----------------------------------------------------------------------------------------------- | ------------- | ----------- | ------------- |
| 001 | [Snapshot Metadata Migration](part-001-snapshot-metadata-migration/part.md)                     | `in-progress` | backend     | 0.5d          |
| 002 | [Snapshot Restore Endpoint](part-002-snapshot-restore-endpoint/part.md)                         | `not-started` | backend     | 0.5d          |

## Acceptance Criteria

- [ ] Migration 0003 adds `wordCount INTEGER`, `label TEXT`, `source TEXT`,
      `reason TEXT` to `scene_snapshots` (nullable / defaulted, no
      destructive change).
- [ ] `SceneSnapshot` type and `snapshot-repository` API expose the
      new fields.
- [ ] POST `/api/db/scene_snapshots` accepts the metadata and defaults
      `source='autosave'`.
- [ ] Near-duplicate suppression: a new autosave snapshot is skipped
      when the most recent snapshot's text is identical.
- [ ] POST `/api/db/scene_snapshots/[id]/restore` takes a
      `pre-restore` snapshot of the current scene text before
      returning the target snapshot text for the editor to apply.
- [ ] Snapshot list endpoint returns newest-first (preserves existing
      behaviour).
- [ ] `tests/editor/snapshot-restore.test.ts` covers metadata, the
      pre-restore snapshot, near-duplicate suppression, and the
      newest-first ordering.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Source: [market-readiness-pt1.md §10](../../../research/market-readiness-pt1.md).
- Migration must be idempotent (CREATE … IF NOT EXISTS / ALTER TABLE …
  guarded by `PRAGMA table_info`).
- The 20-snapshot cap in `snapshot-repository.ts` stays in place.
