---
title: ZIP Import Flow
slug: phase-002-zip-import-flow
phase_number: 2
status: ready
owner: Planner Agent
stage: stage-002-zip-portability-workflow
parts:
  - part-001-zip-parse-validation-and-preview
  - part-002-transactional-restore-and-confirmation
estimated_duration: 1d
---

## Goal

> Build the restore side of portability: ZIP parse, compatibility validation, preview summary, and explicit-confirmation transactional restore.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [ZIP Parse Validation and Preview](part-001-zip-parse-validation-and-preview/part.md) | `draft` | backend | 0.5d |
| 002 | [Transactional Restore and Confirmation](part-002-transactional-restore-and-confirmation/part.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] Invalid archives fail validation before any DB mutation
- [ ] User sees preview counts and compatibility result before confirmation
- [ ] Restore writes are atomic and replace-only for V1
- [ ] App refreshes to consistent post-import state

## Notes

> Keep restore safeguards strict. Silent best-effort imports are prohibited.
