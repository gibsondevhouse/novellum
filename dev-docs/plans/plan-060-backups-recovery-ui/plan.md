---
title: Local Backups & Auto-Save Recovery
slug: plan-060-backups-recovery-ui
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-06-25
last_updated: 2026-06-25
target_completion: 2026-08-26
stages:
  - stage-001-backup-scheduler
  - stage-002-version-history-panel
  - stage-003-autosave-recovery-triggers
  - stage-004-verification
dependencies:
  - plan-059-docx-epub-exporter
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
---

## Objective

Build a visual version history and backup recovery system under Settings -> Data. This plan will surface auto-saves and snapshot recovery states so authors have absolute confidence that their manuscripts are safe and recoverable.

## Scope

**In scope:**
- Automatic snapshot scheduling triggers on scene/manuscript modifications (e.g., save snapshot every 500 words or 15 minutes of active editing).
- Storing these backups in the `scene_snapshots` table or external local files inside the workspace.
- A "Version History" panel in the manuscript editor allowing authors to view timestamps, compare text changes, and roll back scenes to earlier backups.
- Exposing a "Restore Project" button in Settings -> Data using existing SQLite database copy functionality.

**Out of scope:**
- Cloud sync setup (Dropbox, Google Drive syncing).
- Multi-device conflicts resolution (covered under V2/collaboration plans).

## Stages

| #   | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Automated Snapshot Scheduler](stage-001-backup-scheduler/stage.md) | `draft` | 1d |
| 002 | [Visual Version History UI Panel](stage-002-version-history-panel/stage.md) | `draft` | 2d |
| 003 | [Database Restores and Recoveries](stage-003-autosave-recovery-triggers/stage.md) | `draft` | 1d |
| 004 | [Verification & Quality Gate Closure](stage-004-verification/stage.md) | `draft` | 1d |

## Quality Gates

- [ ] **lint** — zero ESLint or CSS warnings
- [ ] **typecheck** — zero compilation warnings in `pnpm check`
- [ ] **tests** — unit coverage of backup creation, pruning, and restore operations
- [ ] **docs_sync** — update `dev-docs/02-architecture/data-model.md`

## Risks & Mitigations
- **Risk:** Creating too many database snapshots could bloat the database size over time.
- **Mitigation:** Implement a pruning policy (e.g., keep all snapshots for 24 hours, daily snapshots for 7 days, and weekly snapshots thereafter) to keep the database size optimized.
---
