---
title: Scene-Grounded Chat
slug: phase-003-scene-grounded-chat
phase_number: 3
status: draft
owner: Planner Agent
stage: stage-003-editor-and-nova-integration
parts:
  - part-001-scene-grounded-chat
estimated_duration: TBD
---

## Goal

Ensure Ask, Write, and Agent mode use active scene context from normal editor routes.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Scene-Grounded Chat](part-001-scene-grounded-chat/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Scene-grounded chat uses active scene context from editor routes.
- [ ] Worldbuilding-scope fallback still works when no scene is active.
- [ ] Agent mode receives the same resolved context as Ask/Write mode.

## Notes

Make Nova prompt/context assembly scene-aware without requiring explicit query params.
