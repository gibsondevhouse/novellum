---
title: Run Ledger Schema
slug: phase-001-run-ledger-schema
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-002-durable-run-ledger
parts:
  - part-001-run-ledger-schema
estimated_duration: TBD
---

## Goal

Add versioned SQLite tables for durable agent runtime records.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Run Ledger Schema](part-001-run-ledger-schema/part.md) | `draft` | unassigned | TBD |

## Acceptance Criteria

- [ ] Migrations create runtime tables with indexes for project, status, run type, created time, and linked artifact IDs.
- [ ] Migration tests pass from empty and existing databases.
- [ ] Schema docs explain what belongs in the ledger versus checkpoint/proposal domain tables.

## Notes

Use additive migrations and keep rollback expectations consistent with existing migration conventions.
