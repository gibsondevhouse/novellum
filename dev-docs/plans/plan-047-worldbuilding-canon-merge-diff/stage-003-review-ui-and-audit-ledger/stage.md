---
title: Review UI & Audit Ledger
slug: stage-003-review-ui-and-audit-ledger
stage_number: 3
status: draft
owner: Planner Agent
plan: plan-047-worldbuilding-canon-merge-diff
phases:
  - phase-001-field-diff-review
  - phase-002-merge-action-flow
  - phase-003-audit-records
estimated_duration: TBD
risk_level: high
---

## Goal

Give authors clear field-level review controls and preserve an audit trail for accepted or rejected canon diffs.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Field Diff Review](phase-001-field-diff-review/phase.md) | `draft` | TBD |
| 002 | [Merge Action Flow](phase-002-merge-action-flow/phase.md) | `draft` | TBD |
| 003 | [Audit Records](phase-003-audit-records/phase.md) | `draft` | TBD |

## Entry Criteria

- Stage 002 diff and merge contract is defined.
- Existing proposal cards and mutation routes are inventoried.

## Exit Criteria

- Authors can inspect proposed creates, updates, and merges before acceptance.
- Acceptance writes canon and audit state atomically.
- Rejections preserve reasons and evidence.

## Notes

Do not trade safety for convenience. Every canon mutation must remain explicitly author-approved.

