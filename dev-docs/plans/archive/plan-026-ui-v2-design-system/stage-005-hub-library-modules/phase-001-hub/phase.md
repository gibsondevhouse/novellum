---
title: Hub Spotlight
slug: phase-001-hub
phase_number: 1
status: complete
owner: Stylist Agent
stage: stage-005-hub-library-modules
parts:
  - part-001-hero-candle-spotlight
estimated_duration: 0.5d
---

## Goal

Tune the library / hub hero banner to the v2 spotlight aesthetic: warm
candle radial gradient, candle-tinted left rule, eyebrow micro-anatomy.

## Parts

| #   | Part                                                                          | Status        |
| --- | ----------------------------------------------------------------------------- | ------------- |
| 001 | [Hero candle spotlight](part-001-hero-candle-spotlight/part.md)               | `complete`    |

## Exit Criteria

- `HomeLibraryShell.svelte` `.hero-banner` carries a candle-tinted radial
  spotlight (no per-project mood engine — single shared treatment).
- `.hero-banner::before` renders a soft candle-dim left rule (1/2 ratio).
- `.hero-label` adopts the eyebrow micro-anatomy (9px / 0.18em /
  semibold) in `--color-candle`.
- All gates clean.
