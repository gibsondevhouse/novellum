---
title: Verification & Cleanup
slug: stage-006-verification-and-cleanup
stage_number: 6
status: draft
owner: Reviewer Agent
plan: plan-019-naming-consistency
phases:
  - phase-001-full-quality-gates
  - phase-002-stale-artifact-cleanup
  - phase-003-manual-smoke
estimated_duration: 0.5d
risk_level: low
---

## Goal

Prove every quality gate passes after the rename, remove the
stale artefacts the rename made it safe to delete, and walk
every route in the running app to confirm no in-app navigation
silently broke.

## Phases

| #   | Phase                                                                                          | Status  | Est. Duration |
| --- | ---------------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Full quality gates](phase-001-full-quality-gates/phase.md)                                    | `draft` | 0.25d         |
| 002 | [Stale artifact cleanup](phase-002-stale-artifact-cleanup/phase.md)                            | `draft` | 0.1d          |
| 003 | [Manual smoke walk](phase-003-manual-smoke/phase.md)                                           | `draft` | 0.15d         |

## Entry Criteria

- Stages 001–005 complete.

## Exit Criteria

- `pnpm run lint`, `pnpm run check`, `pnpm run test`,
  `pnpm run test:coverage` (≥ 80% lines for services/AI) all
  pass on a clean clone (no `.vite` cache).
- `eslint-plugin-boundaries` reports zero violations.
- `src/routes/projects/[id]/+layout.svelte.bak` (and any other
  `.bak` files surfaced by the rename) are deleted.
- Manual smoke walk: every sidebar item + every legacy URL
  redirect lands on its canonical screen.
- Plan-019 `MASTER-PLAN.md` entry moved to **Completed Plans**.

## Notes

- The clean reinstall step exists specifically because Vitest
  and Vite both cache module aliases under `node_modules/.vite`;
  a passing test run on a stale cache would be a false positive.
- The bak file removal is deliberately last so its content is
  available as fallback context throughout the rename.
