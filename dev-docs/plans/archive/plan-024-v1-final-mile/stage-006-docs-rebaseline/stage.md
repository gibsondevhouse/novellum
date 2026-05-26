---
title: Documentation Re-baseline
slug: stage-006-docs-rebaseline
stage_number: 6
status: deferred-to-v1.1
owner: Reviewer Agent
plan: plan-024-v1-final-mile
phases: []
estimated_duration: 0.5d
risk_level: low
---

## Goal

Roll every "Last verified" date forward to the V1 tag date and
make sure the documentation tree describes the system as it is,
not as it was on 2026-05-07.

## Entry Criteria

- Stages 001–005 of this plan are `complete` (the docs cannot
  describe an unstable state).

## Exit Criteria

- [`dev-docs/01-project/roadmap.md`](../../../01-project/roadmap.md)
  lists Ollama provider, light theme, sidebar shared store,
  global shortcut bus, and migration-precheck robustness under
  Shipped; lists this plan and any rollover items under In flight.
- [`dev-docs/03-ai/agents-map.md`](../../../03-ai/agents-map.md)
  reflects the stage-005 decision.
- [`dev-docs/release/beta-program.md`](../../../release/beta-program.md)
  matches the actual beta scope, including which AI agents ship.
- Root [`AGENTS.md`](../../../../AGENTS.md) "Last verified" date
  is updated and its Runtime Agents table matches `agents-map.md`.
- [`MASTER-PLAN.md`](../../MASTER-PLAN.md) has plan-024 in the
  correct section (Active → Recently Completed) on tag day.
- `novellum-docs/user/` contains at least four short pages:
  Export profiles, AI privacy, Backup & restore, Nova panel.

## Notes

- This stage is intentionally last so it captures whatever
  shipped — including any compromises made in stages 001–005.
- Do not re-write any user-facing copy that was finalized by
  plan-018; only correct factual drift.
