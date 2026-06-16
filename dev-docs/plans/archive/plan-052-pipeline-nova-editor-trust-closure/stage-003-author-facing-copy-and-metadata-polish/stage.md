---
title: Author-Facing Copy And Metadata Polish
slug: stage-003-author-facing-copy-and-metadata-polish
stage_number: 3
status: review
owner: Planner Agent
plan: plan-052-pipeline-nova-editor-trust-closure
phases:
  - phase-001-shared-display-helpers
  - phase-002-nova-card-copy-cleanup
  - phase-003-dead-chrome-and-stub-copy-audit
estimated_duration: 2d
risk_level: medium
---

## Goal

Replace internal metadata and dead/stub copy with author-facing language across Nova, editor-adjacent cards, and settings surfaces.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Shared Display Helpers](phase-001-shared-display-helpers/phase.md) | `review` | 0.5d |
| 002 | [Nova Card Copy Cleanup](phase-002-nova-card-copy-cleanup/phase.md) | `review` | 1d |
| 003 | [Dead Chrome And Stub Copy Audit](phase-003-dead-chrome-and-stub-copy-audit/phase.md) | `review` | 0.5d |

## Entry Criteria

- Functional artifact action blockers are fixed or separately tracked.
- Shared display-label helpers have an owner.

## Exit Criteria

- [x] Default UI no longer exposes raw internals called out by the candidate review.
- [x] Any retained debug metadata is behind explicit advanced/debug disclosure.

## Notes

Stage implementation is in `review` pending real Reviewer Agent sign-off. Preserve review gates and do not mark complete until sign-off is real.
