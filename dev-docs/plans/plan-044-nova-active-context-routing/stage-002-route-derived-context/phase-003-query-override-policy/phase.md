---
title: Query Override Policy
slug: phase-003-query-override-policy
phase_number: 3
status: draft
owner: Planner Agent
stage: stage-002-route-derived-context
parts:
  - part-001-query-override-policy
estimated_duration: TBD
---

## Goal

Preserve useful deep-link query params without making them the default context source.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Query Override Policy](part-001-query-override-policy/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Query params are optional overrides, not required defaults.
- [ ] Invalid/conflicting overrides do not silently corrupt context.
- [ ] Deep-link behavior is documented.

## Notes

Define and implement when `sceneId` and `chapterId` query params override route-derived context.
