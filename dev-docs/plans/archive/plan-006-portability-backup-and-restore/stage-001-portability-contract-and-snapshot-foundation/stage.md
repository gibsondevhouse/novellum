---
title: Portability Contract and Snapshot Foundation
slug: stage-001-portability-contract-and-snapshot-foundation
stage_number: 1
status: ready
owner: Planner Agent
plan: plan-006-portability-backup-and-restore
phases:
  - phase-001-backup-contract-and-versioning
  - phase-002-snapshot-extraction-services
estimated_duration: 1d
risk_level: medium
---

## Goal

> Define the backup archive contract and implement deterministic snapshot extraction for all data that must survive browser migration.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Backup Contract and Versioning](phase-001-backup-contract-and-versioning/phase.md) | `ready` | 0.5d |
| 002 | [Snapshot Extraction Services](phase-002-snapshot-extraction-services/phase.md) | `ready` | 0.5d |

## Entry Criteria

> What must be true before this stage can begin.

- `refactor-005-workspace-surface` has stabilized export surface touchpoints
- Current Dexie schema version is confirmed (`v8`)
- Existing export flow remains green on lint/typecheck

## Exit Criteria

> What must be true for this stage to be marked `complete`.

- Versioned manifest schema is documented and implemented
- Compatibility policy (forward/backward behavior) is codified
- Snapshot extraction service returns complete payload for Dexie + selected localStorage keys
- Snapshot service is unit-tested with at least one populated fixture

## Notes

> Snapshot extraction must remain framework-agnostic (plain TypeScript service), so it can be used by both export and future sync workflows.
