---
title: Export dialog UI
slug: stage-002-export-dialog-ui
stage_number: 2
status: review
owner: Planner Agent
plan: plan-039-manuscript-export-ui
phases:
  - phase-001-ux-spec
  - phase-002-ui-scaffold
estimated_duration: 1.5d
risk_level: medium
created: 2026-06-01
last_updated: 2026-06-02
---

# Stage 002 — Export dialog UI

## Goal

Build the manuscript export dialog as a polished, accessible surface that is discoverable from the project experience and does not degrade the existing JSON portability flow.

## Entry Criteria

- Parent plan is accepted for implementation.
- All prior stages are complete unless the implementation owner documents an approved exception.
- The assigned agent has read `plan.md`, `HANDOFF.md`, and `SOURCE-BASIS.md`.

## Phases

| # | Phase | Status | Duration |
|---|---|---|---|
| 001 | [UX spec](phase-001-ux-spec/phase.md) | `review` | `0.4d` |
| 002 | [UI scaffold](phase-002-ui-scaffold/phase.md) | `review` | `1.1d` |

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
