---
title: Restore Execution (Transactional)
slug: phase-004-restore-execution-transactional
phase_number: 4
status: complete
owner: Planner Agent
stage: stage-004-backup-and-restore
parts:
  - part-001-restore-service
  - part-002-restore-as-copy
  - part-003-restore-route
estimated_duration: 1.5d
---

## Goal

Apply a validated backup to the live SQLite database inside a single transaction, supporting both *restore-over-existing* and *restore-as-copy* (new project id, fully rewritten foreign keys). Failure leaves the DB unchanged.

## Parts

| #   | Part                                                  | Status  | Assigned To | Est. Duration |
| --- | ----------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Restore Service](part-001-restore-service/part.md)   | `draft` | backend     | 0.5d          |
| 002 | [Restore as Copy](part-002-restore-as-copy/part.md)   | `draft` | backend     | 0.5d          |
| 003 | [Restore Route](part-003-restore-route/part.md)       | `draft` | backend     | 0.5d          |

## Acceptance Criteria

- [ ] `POST /api/restore/project` accepts a backup + restore mode and either succeeds atomically or leaves the DB byte-identical.
- [ ] Restore takes a pre-restore SQLite snapshot (reusing phase-003 stage-003 snapshot writer with `kind: 'pre-restore'`).
- [ ] `tests/backup/project-restore.test.ts` passes for both modes.
- [ ] No imports of `$lib/db/index` (Dexie) in any restore code path.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Stage-003 phase-003 gave us snapshot infrastructure → reuse it.
- ID-rewrite for restore-as-copy is the highest-risk subroutine in this stage.
