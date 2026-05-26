---
title: Portability Backup and Restore
slug: plan-006-portability-backup-and-restore
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-04-13
last_updated: 2026-04-13
target_completion: 2026-04-18
stages:
  - stage-001-portability-contract-and-snapshot-foundation
  - stage-002-zip-portability-workflow
  - stage-003-quality-and-rollout
dependencies:
  - refactor-005-workspace-surface
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
---

## Objective

> Deliver browser-to-browser portability for Novellum projects by introducing an in-browser backup ZIP export and restore ZIP import workflow. The feature must preserve Dexie project data plus localStorage-backed planning fields, with clear compatibility checks and safe restore semantics.

## Scope

**In scope:**

- Define a versioned backup manifest contract for portability archives
- Build snapshot extraction services for Dexie tables and selected localStorage keys
- Export a portable ZIP archive (`.novellum.zip`) fully client-side
- Add import workflow with ZIP parse, compatibility validation, preview, and user confirmation
- Implement transactional restore into current browser instance (replace policy for V1)
- Add roundtrip tests and documentation (backup/restore runbook)

**Out of scope:**

- Cloud sync or continuous replication
- Multi-device automatic synchronization
- Merge import strategy (V1 is replace-only)
- End-to-end encryption of backup archives
- Server-side backup storage

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Portability Contract and Snapshot Foundation](stage-001-portability-contract-and-snapshot-foundation/stage.md) | `ready` | 1d |
| 002 | [ZIP Portability Workflow](stage-002-zip-portability-workflow/stage.md) | `ready` | 2d |
| 003 | [Quality and Rollout](stage-003-quality-and-rollout/stage.md) | `ready` | 1d |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors
- [ ] **typecheck** — zero type errors
- [ ] **tests** — unit + roundtrip tests pass
- [ ] **docs_sync** — user and developer docs updated with portability workflow
- [ ] **manual_roundtrip** — export from Browser A, import into Browser B, parity verified

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Archive compatibility drift across schema versions | medium | Versioned manifest + explicit compatibility checks before restore |
| Partial imports corrupt active local database | medium | Single transactional restore with pre-validation and fail-fast rollback |
| Missing localStorage planning fields in backup | medium | Prefix-based key registry and dedicated KV snapshot service |
| Large archive causes browser memory spikes | low | Chunk assembly by table, file-size warning, and test with large fixture |

## Notes

> This plan intentionally keeps portability browser-native and manual for V1. The archive format is designed as a stable portability contract that can later become the payload for optional cloud sync or desktop migration without changing feature semantics.
>
> Restore policy in V1 is **replace existing workspace state** after explicit user confirmation. Merge behavior is deferred to a future plan to avoid hidden conflict resolution logic.
