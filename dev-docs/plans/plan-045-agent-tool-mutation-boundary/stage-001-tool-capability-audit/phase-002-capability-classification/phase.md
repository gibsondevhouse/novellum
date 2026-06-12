---
title: Capability Classification
slug: phase-002-capability-classification
phase_number: 2
status: review
owner: Planner Agent
stage: stage-001-tool-capability-audit
parts:
  - part-001-capability-classification
estimated_duration: TBD
---

## Goal

Classify tools into read-only, review-artifact generation, and mutation capability classes.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Capability Classification](part-001-capability-classification/part.md) | `review` | — | TBD |

## Acceptance Criteria

- [x] Every tool has one capability class.
- [x] `authorDraft.accept_checkpoint` is classified as mutation.
- [x] Generation-only checkpoint tools are distinguished from accept/apply tools.

## Notes

Define which tools may be model-callable and which must move behind author UI intent.
