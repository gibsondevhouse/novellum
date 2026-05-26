---
title: Snapshot Restore Endpoint
slug: part-002-snapshot-restore-endpoint
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-002-snapshot-repository-metadata
started_at: 2026-04-29
completed_at: 2026-04-29
estimated_duration: 0.5d
---

## Objective

Ship `POST /api/db/scene_snapshots/[id]/restore` so the editor can
restore a previous snapshot via a single round-trip while guaranteeing
a "pre-restore" snapshot is taken first. Wire the repository helper
through the editor's existing version history panel.

## Files

**Create:**

- `src/routes/api/db/scene_snapshots/[id]/restore/+server.ts`
- `tests/editor/snapshot-restore.test.ts`

**Modify:**

- `src/modules/editor/services/snapshot-repository.ts`

## Behaviour

```text
POST /api/db/scene_snapshots/{snapshotId}/restore
→ 200 { restoredText: string, preRestoreSnapshotId: string }
→ 404 if the target snapshot does not exist
```

The route reads the target snapshot, captures a fresh snapshot of the
scene's current `content` with `source='pre-restore'` and the target
snapshot id in `reason`, then returns the target text for the editor
to apply via the existing autosave pipeline.

## Acceptance Criteria

- [ ] Restore endpoint creates exactly one `pre-restore` snapshot
      before returning.
- [ ] Restore endpoint returns 404 when the snapshot id is unknown.
- [ ] The `pre-restore` snapshot's `reason` contains the target
      snapshot id.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
