---
title: Artifact Action Contract
slug: stage-001-artifact-action-contract
stage_number: 1
status: review
owner: Planner Agent
plan: plan-052-pipeline-nova-editor-trust-closure
phases:
  - phase-001-surface-inventory
estimated_duration: 1d
risk_level: medium
---

## Goal

Define the exact behavior expected from inline Nova artifact actions before wiring UI buttons to persistence or mutation endpoints.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Surface Inventory](phase-001-surface-inventory/phase.md) | `review` | 0.5d |

## Entry Criteria

- Candidate issues have been reviewed against the current Nova/editor source.
- Existing checkpoint and project-metadata services are available for audit.

## Exit Criteria

- [x] Every inline artifact action is classified as mutation, review decision, acknowledgement, or local-only utility.
- [x] The implementation path for scene draft and revision pack actions is source-grounded and review-gated.

## Notes

Stage implementation is in `review` pending real Reviewer Agent sign-off. Preserve review gates and do not mark complete until sign-off is real.
