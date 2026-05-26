---
title: Project Hub Hero and Metrics
slug: phase-001-hub-hero
phase_number: 1
status: in-progress
owner: Architect / Stylist
stage: stage-005-production-suite
parts:
  - part-001-project-hub-hero
  - part-002-project-hub-dashboard-actions
estimated_duration: 4d
---

# Phase-001: Project Hub Hero and Metrics

## Goal

Transform `/projects/[id]/hub` into a cinematic control room that communicates story identity, progress, structure, and next actions immediately.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Project Hub Hero](part-001-project-hub-hero.md) | `in-progress` | Architect / Stylist | 2d |
| 002 | [Project Hub Dashboard and Actions](part-002-project-hub-dashboard-actions.md) | `in-progress` | Architect / Stylist | 2d |

## Implementation Strategy

Use `SpotlightHero` for story identity, `StatusRing` or premium progress bars for instrumentation, `CommandDock`/`GlassBar` for project actions, and `SideDrawer` for edit/detail flows when needed.

## Acceptance Criteria

- [ ] Hub first viewport shows project cover/fallback, title, genre/status, synopsis/logline, and next action.
- [ ] Word count, target progress, and structural metrics use accessible visual instrumentation.
- [ ] Export/delete/edit actions are clear without overpowering creative content.
- [ ] Hub supports coverless, synopsisless, early-planning, drafting, completed, and archived states.

## Edge Cases

- Draft status must be communicated by text and tone, not color alone.
- Very long titles/synopses must clamp or flow without overlapping actions.
