---
title: Editor & Nova Integration
slug: stage-003-editor-and-nova-integration
stage_number: 3
status: draft
owner: Planner Agent
plan: plan-044-nova-active-context-routing
phases:
  - phase-001-panel-prop-wiring
  - phase-002-draft-engine-readiness
  - phase-003-scene-grounded-chat
estimated_duration: TBD
risk_level: high
---

## Goal

Wire the resolved context into Nova so editor-side Ask, Write, Agent, and Draft Engine flows work on normal editor routes.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Panel Prop Wiring](phase-001-panel-prop-wiring/phase.md) | `draft` | TBD |
| 002 | [Draft Engine Readiness](phase-002-draft-engine-readiness/phase.md) | `draft` | TBD |
| 003 | [Scene-Grounded Chat](phase-003-scene-grounded-chat/phase.md) | `draft` | TBD |

## Entry Criteria

- Stage 002 provides a resolved active-context contract.
- Existing Nova and editor behavior is covered by baseline tests or manual evidence.

## Exit Criteria

- `NovaPanel` receives correct project, scene, and chapter context on editor routes.
- Author Draft Engine enables when a real active chapter is present.
- Scene-grounded prompt context no longer depends on manually appended query params.

## Notes

This stage should include regression coverage for `/projects/[id]/editor/[sceneId]`.

