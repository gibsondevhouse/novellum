---
title: Workflow Surfaces
slug: stage-007-workflow-surfaces
stage_number: 7
status: complete
owner: Architect / Stylist
plan: plan-015-cinematic-media
phases:
  - phase-001-storyboard
estimated_duration: 8d
risk_level: high
---

## Stage-007: Workflow Surfaces

## Goal

Polish the core work surfaces into production-ready creative rooms: outline as storyboard/planning room, editor as drafting studio, Nova as AI console, Images as asset gallery, and Settings/Styles as configuration workspaces.

## Entry Criteria

- Stages 002 through 006 are complete.
- Shell and project context behavior are stable.
- Seed fixture includes populated and empty states for outline, editor, Nova, image albums, settings, and styles.

## Phases

| # | Phase | Status | Owner | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Storyboard and Workflow Surfaces](phase-001-storyboard/phase-001-storyboard.md) | `complete` | Architect / Stylist | 8d |

## Required Deliverables

- `/outline` becomes a storyboard/planning room with hierarchy clarity, frame language, and stable detail panels.
- `/editor` and `/editor/[sceneId]` become a focused drafting studio with a calm manuscript canvas, scene navigator, story compass, save status, and unobtrusive AI commands.
- `/nova` receives a cinematic prompt stage, conversation mode, model context, and quick links that match the shell.
- `/images` becomes a full asset gallery with album shelves, image inspection, assignment drawer, destructive confirmation, and metadata.
- `/settings`, `/settings/migrate`, and `/styles` use polished configuration panels, tabs, drawers, and form states.

## Exit Criteria

- Writing and planning workflows remain efficient; visual polish does not reduce authoring density.
- Editor focus behavior preserves scene context, autosave status, and recovery actions.
- Workflow route screenshots pass desktop and mobile review.
- Keyboard-only navigation works through editor, outline, Nova, Images, Settings, and Styles.

## Notes

This stage is highest risk for usability regressions. Treat typing comfort, hierarchy scan speed, and recovery from errors as release blockers.
