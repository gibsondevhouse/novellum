---
title: Materialization Contract
slug: phase-003-materialization-contract
phase_number: 3
status: draft
owner: Planner Agent
stage: stage-002-canonical-checkpoint-flow
parts:
  - part-001-materialization-contract
estimated_duration: TBD
---

## Goal

Protect the outline materialization service as the only route that writes outline hierarchy from generated drafts.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Materialization Contract](part-001-materialization-contract/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Outline hierarchy writes are reachable only through the dedicated accept route.
- [ ] Existing conflict and stale guards remain covered.
- [ ] Generic metadata accept for outline checkpoints stays blocked.

## Notes

Verify the dedicated checkpoint accept route owns hierarchy writes and retains conflict/stale/transaction guarantees.
