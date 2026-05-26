---
title: Outline / Continuity / World-Building / Story-Bible
slug: phase-004-outline-continuity-world
phase_number: 4
status: complete
owner: Stylist Agent
stage: stage-005-hub-library-modules
parts:
  - part-001-nova-blue-sweep
  - part-002-routes-nova-editor
estimated_duration: 0.75d
---

## Goal

Migrate Outline, Continuity, and World-Building modules off the
legacy `--color-nova-blue` accent in favour of v2 candle / brass /
focus tokens. Cards, focus rings, hover states, and arc-tag chips
should all read warm.

## Parts

| #   | Part                                                                | Status     |
| --- | ------------------------------------------------------------------- | ---------- |
| 001 | [Nova-blue sweep](part-001-nova-blue-sweep/part.md)                 | `complete` |
| 002 | [Routes + Nova + editor sweep](part-002-routes-nova-editor/part.md) | `complete` |

## Exit Criteria

- No `--color-nova-blue` references inside `src/modules/outline/`,
  `src/modules/continuity/`, or `src/modules/world-building/`.
- All input focus borders bound to `--color-border-focus`.
- Scene accents (chips, hover, badges) read candle / brass.
- All gates clean.

## Follow-ups (out of scope for this phase)

- Route-level `world-building/+page.svelte` AI accent panel — large
  multi-rule recolour, treat as its own part.
- Continuity board cards visual polish (eyebrow + brass divider).
- Story-Bible entity cards.
