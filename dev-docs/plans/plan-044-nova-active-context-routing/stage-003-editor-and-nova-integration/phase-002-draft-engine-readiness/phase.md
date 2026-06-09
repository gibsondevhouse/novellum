---
title: Draft Engine Readiness
slug: phase-002-draft-engine-readiness
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-003-editor-and-nova-integration
parts:
  - part-001-draft-engine-readiness
estimated_duration: TBD
---

## Goal

Enable the Author Draft Engine whenever the active editor context has a valid chapter.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Draft Engine Readiness](part-001-draft-engine-readiness/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Draft Engine no longer requires chapter query params on editor scene routes.
- [ ] Missing chapter still shows a clear disabled state.
- [ ] No manuscript content is changed by readiness wiring alone.

## Notes

Fix false-empty Draft Engine states caused by missing query-string chapter context.
