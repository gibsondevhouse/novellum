---
title: Foundation Refactor
slug: stage-001-foundation-refactor
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-034
phases:
  - phase-001-help-extraction
  - phase-002-workflow-config
  - phase-003-cta-refactor
estimated_duration: 4d
risk_level: low
---

## Goal

Extract hardcoded help content, define the worldbuilding sequence as reusable config, and refactor worldbuilding CTAs. This stage establishes the foundation that all subsequent UI and pipeline work depends on.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Help Extraction](phase-001-help-extraction/phase.md) | `complete` | 1d |
| 002 | [Workflow Config](phase-002-workflow-config/phase.md) | `complete` | 1.5d |
| 003 | [CTA Refactor](phase-003-cta-refactor/phase.md) | `complete` | 1.5d |

## Entry Criteria

- plan-034 is active
- plan-basis.md reviewed and approved
- master branch is clean and current

## Exit Criteria

- All phases complete
- Help content extracted into dedicated module
- Worldbuilding sequence defined as static config
- CTA labels updated and consistent
- All tests pass (`pnpm test`)
- Linting passes (`pnpm lint`)

## Notes

This stage is deliberately **low-risk** and **high-confidence**. It involves no AI integration, no new database schemas, and no complex state machines. All three phases are primarily refactoring/extraction work that unblocks the UI and pipeline stages.

**Key dependency:** Workflow config (phase-002) must complete before UI stage begins, because generate buttons will reference it.
