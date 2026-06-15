---
title: Profile and format wiring
slug: stage-003-profile-format-wiring
stage_number: 3
status: review
owner: Planner Agent
plan: plan-039-manuscript-export-ui
phases:
  - phase-001-profile-selection
  - phase-002-format-toggle-and-service-contract
estimated_duration: 1.0d
risk_level: medium
created: 2026-06-01
last_updated: 2026-06-02
---

# Stage 003 — Profile and format wiring

## Goal

Connect UI controls to profile, metadata, formatting, and format-selection logic, then update the export service contract so the dialog can control manuscript compilation instead of relying on hardcoded defaults.

## Entry Criteria

- Parent plan is accepted for implementation.
- All prior stages are complete unless the implementation owner documents an approved exception.
- The assigned agent has read `plan.md`, `HANDOFF.md`, and `SOURCE-BASIS.md`.

## Phases

| # | Phase | Status | Duration |
|---|---|---|---|
| 001 | [Profile selection](phase-001-profile-selection/phase.md) | `review` | `0.4d` |
| 002 | [Format toggle and service contract](phase-002-format-toggle-and-service-contract/phase.md) | `review` | `0.6d` |

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
