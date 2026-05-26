---
title: The Muse (Nova surface label)
slug: phase-002-muse-surface
phase_number: 2
status: complete
owner: Stylist Agent
stage: stage-004-immersive-surfaces
parts:
  - part-001-surface-label-rename
estimated_duration: 0.25d
---

## Goal

Rename the visible "Nova" copy in the chrome and panel surfaces to
"Muse". Routes, store names, agent types, and file paths stay as `nova*`
(agent identity, not user-facing). Visual panel polish (candle handle,
brass border tint) is deferred to a follow-up part.

## Parts

| #   | Part                                                                          | Status        |
| --- | ----------------------------------------------------------------------------- | ------------- |
| 001 | [Surface label rename](part-001-surface-label-rename/part.md)                 | `complete`    |

## Exit Criteria

- Sidebar primary nav item label "Muse" (route stays `/nova`).
- Sidebar footer link label "Muse" (aria + visible).
- `AppHeader` displayTitle fallback "Muse" for the `/nova` route
  (eyebrow already says "The Muse").
- All gates clean.
