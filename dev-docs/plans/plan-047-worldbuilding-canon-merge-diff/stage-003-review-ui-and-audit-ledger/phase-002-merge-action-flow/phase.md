---
title: Merge Action Flow
slug: phase-002-merge-action-flow
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-003-review-ui-and-audit-ledger
parts:
  - part-001-merge-action-flow
estimated_duration: TBD
---

## Goal

Apply accepted diff decisions atomically to canon.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Merge Action Flow](part-001-merge-action-flow/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Accepted create/update/merge decisions write expected canon rows.
- [ ] Unsupported decisions fail safely without partial writes.
- [ ] No-op decisions update proposal lifecycle without canon writes.

## Notes

Replace insert-only acceptance with create/update/merge/link/no-op execution where supported.
