---
title: ZIP Portability Workflow
slug: stage-002-zip-portability-workflow
stage_number: 2
status: ready
owner: Planner Agent
plan: plan-006-portability-backup-and-restore
phases:
  - phase-001-zip-export-flow
  - phase-002-zip-import-flow
estimated_duration: 2d
risk_level: medium
---

## Goal

> Deliver complete user-facing export and import experiences for portability archives, including archive creation, validation, preview, and transactional restore.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [ZIP Export Flow](phase-001-zip-export-flow/phase.md) | `ready` | 1d |
| 002 | [ZIP Import Flow](phase-002-zip-import-flow/phase.md) | `ready` | 1d |

## Entry Criteria

> What must be true before this stage can begin.

- Stage 001 is `complete`
- Manifest and snapshot services are available as reusable modules
- Archive file extension and MIME guidance are finalized

## Exit Criteria

> What must be true for this stage to be marked `complete`.

- User can export a valid backup ZIP from the existing export surface
- User can import a backup ZIP, pass compatibility checks, preview counts, and confirm restore
- Restore operation is atomic (all-or-nothing) with explicit error messaging
- UI state refreshes correctly after successful import

## Notes

> V1 import uses **replace-only semantics** and does not attempt merge/conflict handling.
