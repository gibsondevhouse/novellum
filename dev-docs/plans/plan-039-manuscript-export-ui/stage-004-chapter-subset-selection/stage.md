---
title: Chapter subset selection
slug: stage-004-chapter-subset-selection
stage_number: 4
status: review
owner: Planner Agent
plan: plan-039-manuscript-export-ui
phases:
  - phase-001-chapter-picker
  - phase-002-harden-edge-cases
estimated_duration: 1.0d
risk_level: medium
created: 2026-06-01
last_updated: 2026-06-02
---

# Stage 004 — Chapter subset selection

## Goal

Allow authors to export all chapters, a contiguous chapter range, or explicitly selected chapters while preserving repository order and handling empty manuscript edge cases cleanly.

## Entry Criteria

- Parent plan is accepted for implementation.
- All prior stages are complete unless the implementation owner documents an approved exception.
- The assigned agent has read `plan.md`, `HANDOFF.md`, and `SOURCE-BASIS.md`.

## Phases

| # | Phase | Status | Duration |
|---|---|---|---|
| 001 | [Chapter picker](phase-001-chapter-picker/phase.md) | `review` | `0.65d` |
| 002 | [Harden edge cases](phase-002-harden-edge-cases/phase.md) | `review` | `0.35d` |

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
