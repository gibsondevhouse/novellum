---
title: Panel Prop Wiring
slug: phase-001-panel-prop-wiring
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-003-editor-and-nova-integration
parts:
  - part-001-panel-prop-wiring
estimated_duration: TBD
---

## Goal

Wire resolved active context into the global Nova panel and composer.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Panel Prop Wiring](part-001-panel-prop-wiring/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Nova receives route-derived active scene/chapter context.
- [ ] Existing project ID persistence still works.
- [ ] Composer sends normalized context to chat service.

## Notes

Replace query-only prop wiring with the resolved context contract.
