---
title: Tests and docs
slug: stage-006-tests-and-docs
stage_number: 6
status: review
owner: Planner Agent
plan: plan-039-manuscript-export-ui
phases:
  - phase-001-test-coverage
  - phase-002-docs-and-closeout
estimated_duration: 0.75d
risk_level: low
created: 2026-06-01
last_updated: 2026-06-02
---

# Stage 006 — Tests and docs

## Goal

Finish the plan with focused tests, evidence, and documentation updates so the export UI is reviewable and maintainable.

## Entry Criteria

- Parent plan is accepted for implementation.
- All prior stages are complete unless the implementation owner documents an approved exception.
- The assigned agent has read `plan.md`, `HANDOFF.md`, and `SOURCE-BASIS.md`.

## Phases

| # | Phase | Status | Duration |
|---|---|---|---|
| 001 | [Test coverage](phase-001-test-coverage/phase.md) | `review` | `0.45d` |
| 002 | [Docs and closeout](phase-002-docs-and-closeout/phase.md) | `review` | `0.3d` |

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
