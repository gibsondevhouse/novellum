---
title: Diff & Merge Contract
slug: stage-002-diff-and-merge-contract
stage_number: 2
status: complete
owner: Planner Agent
plan: plan-047-worldbuilding-canon-merge-diff
phases:
  - phase-001-diff-schema
  - phase-002-merge-policy
  - phase-003-duplicate-evidence
estimated_duration: TBD
risk_level: high
---

## Goal

Define typed proposal outcomes for create, update, merge, link, and no-op canon decisions.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Diff Schema](phase-001-diff-schema/phase.md) | `complete` | TBD |
| 002 | [Merge Policy](phase-002-merge-policy/phase.md) | `complete` | TBD |
| 003 | [Duplicate Evidence](phase-003-duplicate-evidence/phase.md) | `complete` | TBD |

## Entry Criteria

- Stage 001 projection audit is complete.
- Initial entity families for the first merge implementation are selected.

## Exit Criteria

- Proposal records can represent field-level diffs and merge targets.
- Duplicate candidates are review evidence, not silent blockers.
- Merge/update semantics are bounded enough for safe implementation.

## Notes

Keep the first implementation narrow if needed. The contract can support broader families before every family is fully implemented.
