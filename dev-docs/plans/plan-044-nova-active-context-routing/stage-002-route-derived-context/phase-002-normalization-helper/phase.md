---
title: Normalization Helper
slug: phase-002-normalization-helper
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-002-route-derived-context
parts:
  - part-001-normalization-helper
estimated_duration: TBD
---

## Goal

Implement a tested helper or store that normalizes active Nova context.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Normalization Helper](part-001-normalization-helper/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Context resolver returns stable project/scene/chapter fields.
- [ ] Tests cover editor scene route with no query params.
- [ ] No component needs ad hoc query parsing for Nova context.

## Notes

Centralize active context resolution so future Nova consumers do not parse route state independently.
