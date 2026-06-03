---
title: Desktop and web delivery path
slug: stage-005-desktop-web-delivery
stage_number: 5
status: review
owner: Planner Agent
plan: plan-039-manuscript-export-ui
phases:
  - phase-001-delivery-services
  - phase-002-feedback-states
estimated_duration: 0.75d
risk_level: medium
created: 2026-06-01
last_updated: 2026-06-02
---

# Stage 005 — Desktop and web delivery path

## Goal

Deliver generated export blobs predictably in both browser and desktop shells, with safe fallback when Tauri file saving is unavailable.

## Entry Criteria

- Parent plan is accepted for implementation.
- All prior stages are complete unless the implementation owner documents an approved exception.
- The assigned agent has read `plan.md`, `HANDOFF.md`, and `SOURCE-BASIS.md`.

## Phases

| # | Phase | Status | Duration |
|---|---|---|---|
| 001 | [Delivery services](phase-001-delivery-services/phase.md) | `review` | `0.45d` |
| 002 | [Feedback states](phase-002-feedback-states/phase.md) | `review` | `0.3d` |

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
