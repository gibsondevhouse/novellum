---
title: Editor & Nova Integration
slug: stage-003-editor-and-nova-integration
stage_number: 3
status: complete
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
| 001 | [Panel Prop Wiring](phase-001-panel-prop-wiring/phase.md) | `complete` | TBD |
| 002 | [Draft Engine Readiness](phase-002-draft-engine-readiness/phase.md) | `complete` | TBD |
| 003 | [Scene-Grounded Chat](phase-003-scene-grounded-chat/phase.md) | `complete` | TBD |

## Entry Criteria

- [x] Stage 002 provides a resolved active-context contract.
- [x] Existing Nova and editor behavior is covered by baseline tests or manual evidence.

## Exit Criteria

- [x] `NovaPanel` receives correct project, scene, and chapter context on editor routes.
- [x] Author Draft Engine enables when a real active chapter is present.
- [x] Scene-grounded prompt context no longer depends on manually appended query params.

## Notes

This stage should include regression coverage for `/projects/[id]/editor/[sceneId]`.
Integration complete. Nova is now route-aware.
