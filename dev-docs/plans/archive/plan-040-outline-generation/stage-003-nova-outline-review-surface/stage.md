---
title: Nova Outline Review Surface
slug: stage-003-nova-outline-review-surface
stage_number: 3
status: complete
owner: Planner Agent
plan: plan-040-outline-generation
phases:
  - phase-001-trigger-and-state-shell
  - phase-002-review-card-and-actions
estimated_duration: 2.5d
risk_level: medium
---

## Goal

Add a polished Nova workflow for generating, reviewing, accepting, rejecting, and recovering from outline draft checkpoints.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Trigger & State Shell](phase-001-trigger-and-state-shell/phase.md) | `complete` | 1d |
| 002 | [Review Card & Actions](phase-002-review-card-and-actions/phase.md) | `complete` | 1.5d |

## Entry Criteria

- Generation runner exposes typed state and errors.
- Outline checkpoint payload can be listed/read by project.
- Design tokens and Nova component conventions are inspected before styling.

## Exit Criteria

- Authors can trigger generation from Nova and review the proposed hierarchy before accepting.
- Every major state has explicit copy and affordances.
- Component/source-contract tests cover review behavior.

## Risks

- Primary risk level: `medium`.
- Do not start a downstream phase if its input contract is still unresolved.
- Escalate any Critical or High defect that could cause silent writes, provider bypass, client-side key exposure, or partial hierarchy materialization.

## Notes

This stage remains `draft` until implementation starts. Roll status up only when every child phase and part reaches `complete` with evidence.
