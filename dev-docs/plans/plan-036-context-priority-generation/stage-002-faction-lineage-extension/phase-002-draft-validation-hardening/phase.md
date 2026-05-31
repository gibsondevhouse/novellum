---
title: Draft Validation Hardening
slug: phase-002-draft-validation-hardening
phase_number: 2
status: review
owner: Planner Agent
stage: stage-002-faction-lineage-extension
parts:
  - part-001-add-generation-draft-validator
estimated_duration: 0.75d
---

## Goal

Add a focused validation/normalization layer so malformed or incomplete drafts are filtered before they reach review UI and persistence APIs.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Add Generation Draft Validator](part-001-add-generation-draft-validator/part.md) | `draft` | Backend Agent | 0.75d |

## Acceptance Criteria

- [ ] Route applies validator before returning drafts
- [ ] Invalid drafts produce actionable error responses
- [ ] Partial drafts normalize safely where allowed

## Notes

Validation should be deterministic and side-effect free to keep generation route behavior testable.
