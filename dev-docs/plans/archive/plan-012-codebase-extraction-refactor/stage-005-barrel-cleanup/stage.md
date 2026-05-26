---
title: Barrel Cleanup & Final Verification
slug: stage-005-barrel-cleanup
stage_number: 5
status: complete
owner: Planner Agent
plan: plan-012-codebase-extraction-refactor
phases:
  - phase-001-barrel-audit
  - phase-002-final-verification
estimated_duration: 1d
risk_level: low
---

## Goal

> Audit and complete all barrel (`index.ts`) files across the codebase, ensure every module has a fully populated barrel, and run a final comprehensive quality gate across the entire project.

## Phases

| # | Phase | Status | Est. Duration |
|---|-------|--------|---------------|
| 001 | [Barrel Audit & Fix](phase-001-barrel-audit/phase.md) | `complete` | 0.5d |
| 002 | [Final Verification](phase-002-final-verification/phase.md) | `complete` | 0.5d |

## Entry Criteria

- Stages 001–004 are `complete`

## Exit Criteria

- Every module has a complete barrel (`index.ts`)
- `pnpm check` — 0 errors
- `pnpm run lint` — 0 errors (including `eslint-plugin-boundaries`)
- `pnpm run test` — all pass
- `pnpm run test:coverage` — services/AI >= 80% line coverage
- No cross-module imports bypassing barrels

## Notes

> This is the capstone stage. It depends on all preceding work. The barrel audit may surface additional imports that bypass the barrel — those must be fixed as part of this stage.
