---
title: Immersive Surfaces — Page, Muse, Room
slug: stage-004-immersive-surfaces
stage_number: 4
status: complete
owner: Stylist Agent
plan: plan-026-ui-v2-design-system
phases:
  - phase-001-page-editor
  - phase-002-muse-surface
  - phase-003-room-reader
estimated_duration: 2d
risk_level: medium
---

## Goal

Restyle the three immersive surfaces:

- **The Page** (`src/modules/editor/`) — parchment surface, Crimson Pro prose at
  65ch, brass `DropCap`, left-margin `SceneRail`, bottom breath chips.
- **The Muse** (`src/modules/nova/`) — Nova panel becomes a right-margin
  marginalia overlay; `NovaPanel.svelte` renamed to `MusePanel.svelte` with
  barrel alias `NovaPanel = MusePanel`. Logic unchanged.
- **The Room** (`src/modules/reader/`) — two-page parchment spread, chapter
  ornament `❦`, brass drop caps, red ribbon bookmark, folio numbers, candle
  vignette.

## Phases

| #   | Phase                                                       | Status  | Est. Duration |
| --- | ----------------------------------------------------------- | ------- | ------------- |
| 001 | [The Page (Editor)](phase-001-page-editor/phase.md)         | `draft` | 0.75d         |
| 002 | [The Muse (Marginalia)](phase-002-muse-marginalia/phase.md) | `draft` | 0.75d         |
| 003 | [The Room (Reader)](phase-003-room-reader/phase.md)         | `draft` | 0.5d          |

## Entry Criteria

- Stages 001–003 complete (tokens + primitives + chrome).

## Exit Criteria

- Editor: prose renders in Crimson Pro at the configured measure; drop cap
  applies on chapter opening; SceneRail reflects outline state; breath chips
  bind to autosave service.
- Nova: marginalia overlay floats over right gutter (no fixed-width panel);
  continuity flags render inline; backwards-compat `NovaPanel` alias preserved.
- Reader: two-page spread visible with gutter shadow; chapter ornament between
  chapters; brass drop cap on chapter opens; ribbon + folio numbers correct.
- No logic changes to editor state, Nova chat protocol, autosave, or reader
  controller. Only surfaces.

## Notes

- Type names stay as `Nova*` (agent identity). "Muse" is surface label only.
- Phases 001 and 003 are parallel-safe; phase 002 depends on the editor wiring
  established in phase 001.
