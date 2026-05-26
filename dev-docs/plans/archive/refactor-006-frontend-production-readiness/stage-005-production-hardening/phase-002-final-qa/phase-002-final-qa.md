---
title: Final QA Gate
slug: phase-002-final-qa
phase_number: 2
status: complete
owner: reviewer
stage: stage-005-production-hardening
parts:
  - part-001-quality-gates
  - part-002-visual-consistency
estimated_duration: 0.5d
---

## Goal

Run the full automated quality gate suite and perform a visual consistency spot-check across all primary routes to certify the application for production release.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [Automated Quality Gates](./part-001-quality-gates.md) | `draft` | reviewer | 0.25d |
| 002 | [Visual Consistency Audit](./part-002-visual-consistency.md) | `draft` | reviewer | 0.25d |

## Acceptance Criteria

- [ ] `pnpm run lint` exits 0.
- [ ] `pnpm run check` exits 0.
- [ ] `pnpm run test` exits 0; service-layer coverage ≥ 80%.
- [ ] `pnpm run build` exits 0 with no warnings.
- [ ] Visual spot-check confirms no tokens are missing (no `var(--undefined)` rendering as blank).
- [ ] All parts reach `complete` status.

## Notes

This phase may not begin until all other phases in the plan are `complete`.
