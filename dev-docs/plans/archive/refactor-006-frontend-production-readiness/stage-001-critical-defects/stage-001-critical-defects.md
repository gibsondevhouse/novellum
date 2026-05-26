---
title: Critical Defect Fixes
slug: stage-001-critical-defects
stage_number: 1
status: complete
owner: engineering
plan: refactor-006-frontend-production-readiness
phases:
  - phase-001-error-infrastructure
  - phase-002-security
estimated_duration: 2d
risk_level: high
---

## Goal

Eliminate the three critical production-blocking defects: missing error boundaries that leave users with an unrecoverable blank screen, an XSS exposure in the markdown renderer, and unsafe TypeScript type casts that can cause silent runtime failures.

## Phases

| # | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Error Handling Infrastructure](./phase-001-error-infrastructure/phase-001-error-infrastructure.md) | `draft` | 1d |
| 002 | [Security: XSS & Type Safety](./phase-002-security/phase-002-security.md) | `draft` | 1d |

## Entry Criteria

- `plan-feature-realization` is complete.
- `pnpm run lint` and `pnpm run check` currently exit 0 (baseline clean).

## Exit Criteria

- All phases complete.
- `+error.svelte` exists at root and project-scoped levels.
- `pnpm audit` returns no high/critical advisories introduced by new deps.
- All quality gates pass.

## Notes

This stage is a hard prerequisite for all subsequent stages. No other stage may begin until Stage 001 is fully `complete`.
