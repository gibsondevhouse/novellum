---
title: Capability Classification
slug: phase-002-capability-classification
phase_number: 2
status: draft
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
| 001 | [Capability Classification](part-001-capability-classification/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Every tool has one capability class.
- [ ] `authorDraft.accept_checkpoint` is classified as mutation.
- [ ] Generation-only checkpoint tools are distinguished from accept/apply tools.

## Notes

Define which tools may be model-callable and which must move behind author UI intent.
