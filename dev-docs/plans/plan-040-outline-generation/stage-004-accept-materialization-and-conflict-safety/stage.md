---
title: Accept Materialization & Conflict Safety
slug: stage-004-accept-materialization-and-conflict-safety
stage_number: 4
status: complete
owner: Planner Agent
plan: plan-040-outline-generation
phases:
  - phase-001-hierarchy-mapping-and-transaction
  - phase-002-conflict-policy-and-audit
estimated_duration: 3d
risk_level: high
---

## Goal

Materialize accepted outline checkpoints into canonical hierarchy records without destructive overwrites, partial writes, or client-side DB access.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Hierarchy Mapping & Transaction](phase-001-hierarchy-mapping-and-transaction/phase.md) | `complete` | 1.5d |
| 002 | [Conflict Policy & Audit](phase-002-conflict-policy-and-audit/phase.md) | `complete` | 1.5d |

## Entry Criteria

- OutlineDraft contract is validated.
- Nova accept action can call a server route.
- Existing hierarchy write paths and DB transaction utilities are identified.

## Exit Criteria

- [x] Accepting a valid checkpoint creates hierarchy records atomically.
- [x] Conflicts are blocked before destructive writes.
- [x] Rollback and lifecycle ordering are covered by tests and evidence.

## Risks

- Primary risk level: `high`.
- Do not start a downstream phase if its input contract is still unresolved.
- Escalate any Critical or High defect that could cause silent writes, provider bypass, client-side key exposure, or partial hierarchy materialization.

## Notes

This stage remains `draft` until implementation starts. Roll status up only when every child phase and part reaches `complete` with evidence.
