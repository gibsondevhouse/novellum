---
title: Context Contract Audit
slug: stage-001-context-contract-audit
stage_number: 1
status: draft
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
| 001 | [Route Context Inventory](phase-001-route-context-inventory/phase.md) | `draft` | TBD |
| 002 | [Consumer Contract Map](phase-002-consumer-contract-map/phase.md) | `draft` | TBD |

## Entry Criteria

- Current `NovaPanel`, `NovaComposer`, root layout, and editor route wiring are available for inspection.

## Exit Criteria

- All Nova context consumers are listed.
- Required and optional context fields are documented by route family.
- Query-param-only context dependencies are identified.

## Notes

Focus on `projectId`, `activeSceneId`, `activeChapterId`, author draft engine availability, and scene-grounded prompt behavior.

