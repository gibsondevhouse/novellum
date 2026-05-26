---
title: Production Hardening & Final QA
slug: stage-005-production-hardening
stage_number: 5
status: complete
owner: engineering
plan: refactor-006-frontend-production-readiness
phases:
  - phase-001-code-quality
  - phase-002-final-qa
estimated_duration: 1d
risk_level: low
---

## Goal

Strip all development artifacts from the production bundle, fix event-listener memory leaks, and run the complete quality gate suite to certify the application is ready for release.

## Phases

| # | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Code Quality Cleanup](./phase-001-code-quality/phase-001-code-quality.md) | `draft` | 0.5d |
| 002 | [Final QA Gate](./phase-002-final-qa/phase-002-final-qa.md) | `draft` | 0.5d |

## Entry Criteria

- All previous stages are `complete`.

## Exit Criteria

- All phases complete.
- `pnpm run lint && pnpm run check && pnpm run test` all exit 0.
- `pnpm run build` exits 0 with no warnings.
- No `console.log` statements remain in `src/` (excluding intentional `console.error` in error boundaries).
- Memory leak audit passes.

## Notes

This is the final gate before release. No new features or refactors may be introduced in this stage.
