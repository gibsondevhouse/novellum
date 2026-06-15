---
title: Audit export stack
slug: stage-001-audit-export-stack
stage_number: 1
status: review
owner: Planner Agent
plan: plan-039-manuscript-export-ui
phases:
  - phase-001-inventory-current-state
  - phase-002-define-target-contract
estimated_duration: 0.5d
risk_level: low
created: 2026-06-01
last_updated: 2026-06-02
---

# Stage 001 — Audit export stack

## Goal

Lock the implementation surface before UI work starts. Confirm supported formats, profiles, current modal behavior, desktop delivery limitations, and the exact contract gaps that block manuscript export UI.

## Entry Criteria

- Parent plan is accepted for implementation.
- All prior stages are complete unless the implementation owner documents an approved exception.
- The assigned agent has read `plan.md`, `HANDOFF.md`, and `SOURCE-BASIS.md`.

## Phases

| # | Phase | Status | Duration |
|---|---|---|---|
| 001 | [Inventory current state](phase-001-inventory-current-state/phase.md) | `review` | `0.25d` |
| 002 | [Define target contract](phase-002-define-target-contract/phase.md) | `review` | `0.25d` |

## Exit Criteria

- Every phase in this stage reaches `complete` after reviewer sign-off.
- Evidence exists for every part in this stage.
- Any scope changes are recorded in the relevant `impl.log.md` and surfaced in `plan.md` if they affect later stages.

## Risks

- Scope drift into export driver work.
- Unverified assumptions about existing UI or desktop shell behavior.
- Missing evidence that forces later agents to rediscover context.

## Notes

Keep the stage focused on the stated outcome. Do not advance status fields until the lifecycle rules in the planning conventions are satisfied.
