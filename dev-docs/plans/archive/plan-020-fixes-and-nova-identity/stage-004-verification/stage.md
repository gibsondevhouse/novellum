---
title: Verification
slug: stage-004-verification
stage_number: 4
status: draft
owner: Reviewer Agent
plan: plan-020-fixes-and-nova-identity
phases:
  - phase-001-automated-gates
  - phase-002-manual-smoke
estimated_duration: 0.25d
risk_level: low
---

## Goal

Confirm all three fixes ship clean: lint, typecheck, tests, and a
desktop manual smoke that exercises each defect's reproduction
path.

## Phases

| #   | Phase                                                          | Status  | Est. Duration |
| --- | -------------------------------------------------------------- | ------- | ------------- |
| 001 | [Automated gates](phase-001-automated-gates/phase.md)          | `draft` | 0.5h          |
| 002 | [Manual smoke](phase-002-manual-smoke/phase.md)                | `draft` | 1h            |

## Entry Criteria

- All three fix stages marked `complete`.

## Exit Criteria

- `pnpm run lint` — clean.
- `pnpm run check` — 0 errors.
- `pnpm run test` — all suites pass.
- Manual smoke checklist passed and recorded in
  `dev-docs/qa-docs/completed/`.
