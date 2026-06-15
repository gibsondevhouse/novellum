---
title: Advertisement Filter
slug: phase-002-advertisement-filter
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-002-tool-policy-contract
parts:
  - part-001-advertisement-filter
estimated_duration: TBD
---

## Goal

Filter model-advertised tools to exclude mutation capabilities.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Advertisement Filter](part-001-advertisement-filter/part.md) | `complete` | — | TBD |

## Acceptance Criteria

- [x] Mutation tools are not advertised to the model.
- [x] Read and review-artifact generation tools remain advertised.
- [x] Tests assert excluded IDs by name.

## Notes

Prevent Agent mode from presenting accept/apply mutation tools to the model.
