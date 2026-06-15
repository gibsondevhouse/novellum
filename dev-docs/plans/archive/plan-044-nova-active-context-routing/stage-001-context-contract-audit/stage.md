---
title: Context Contract Audit
slug: stage-001-context-contract-audit
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-044-nova-active-context-routing
phases:
  - phase-001-route-context-inventory
  - phase-002-consumer-contract-map
estimated_duration: TBD
risk_level: medium
---

## Goal

Define what Nova needs to know about the active project, scene, chapter, and outline target on each project route.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Route Context Inventory](phase-001-route-context-inventory/phase.md) | `complete` | TBD |
| 002 | [Consumer Contract Map](phase-002-consumer-contract-map/phase.md) | `complete` | TBD |

## Entry Criteria

- Current `NovaPanel`, `NovaComposer`, root layout, and editor route wiring are available for inspection.

## Exit Criteria

- [x] All Nova context consumers are listed.
- [x] Required and optional context fields are documented by route family.
- [x] Query-param-only context dependencies are identified.

## Notes

Focus on `projectId`, `activeSceneId`, `activeChapterId`, author draft engine availability, and scene-grounded prompt behavior.
Audit complete. Identified root layout as the primary source of context brittleness.
