---
title: Regression & Docs
slug: stage-004-regression-and-docs
stage_number: 4
status: draft
owner: Planner Agent
plan: plan-045-agent-tool-mutation-boundary
phases:
  - phase-001-agent-mode-regression
  - phase-002-review-gate-regression
  - phase-003-docs-sync
estimated_duration: TBD
risk_level: medium
---

## Goal

Prove Agent mode remains useful while preserving explicit author approval before manuscript or canon mutation.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Agent Mode Regression](phase-001-agent-mode-regression/phase.md) | `draft` | TBD |
| 002 | [Review Gate Regression](phase-002-review-gate-regression/phase.md) | `draft` | TBD |
| 003 | [Docs Sync](phase-003-docs-sync/phase.md) | `draft` | TBD |

## Entry Criteria

- Mutation boundary changes are wired through tool registry and UI commands.

## Exit Criteria

- Required quality gates pass.
- Tests prove model-callable tools cannot apply author draft checkpoints.
- Agent mode docs clearly explain read/generate versus accept/apply capabilities.

## Notes

Target both source-contract tests and user-flow tests so the policy is enforced at compile-time and behavior level.

