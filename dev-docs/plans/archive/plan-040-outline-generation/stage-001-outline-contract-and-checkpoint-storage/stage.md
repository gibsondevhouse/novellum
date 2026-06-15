---
title: Outline Contract & Checkpoint Storage
slug: stage-001-outline-contract-and-checkpoint-storage
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-040-outline-generation
phases:
  - phase-001-discover-existing-contracts
  - phase-002-checkpoint-storage-lifecycle
estimated_duration: 2d
risk_level: medium
---

## Goal

Define the durable OutlineDraft contract, checkpoint lifecycle, validation rules, and metadata access helpers before model or UI work starts.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Discover Existing Contracts](phase-001-discover-existing-contracts/phase.md) | `complete` | 0.5d |
| 002 | [Checkpoint Storage Lifecycle](phase-002-checkpoint-storage-lifecycle/phase.md) | `complete` | 1.5d |

## Entry Criteria

- Plan-037 and plan-038 are complete or treated as the verified pattern sources.
- Current skeleton plan is present under dev-docs/plans/plan-040-outline-generation/.
- Implementation agent has inspected existing checkpoint and project metadata helpers.

## Exit Criteria

- Outline draft schema and lifecycle are documented and implemented as typed source contracts.
- Checkpoint owner/key conventions are defined and covered by tests.
- No model calls or UI actions depend on untyped outline payloads.

## Risks

- Primary risk level: `medium`.
- Do not start a downstream phase if its input contract is still unresolved.
- Escalate any Critical or High defect that could cause silent writes, provider bypass, client-side key exposure, or partial hierarchy materialization.

## Notes

This stage remains `draft` until implementation starts. Roll status up only when every child phase and part reaches `complete` with evidence.
