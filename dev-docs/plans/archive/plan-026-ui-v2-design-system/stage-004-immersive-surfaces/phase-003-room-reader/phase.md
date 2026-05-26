---
title: The Room (Reader surface)
slug: phase-003-room-reader
phase_number: 3
status: complete
owner: Stylist Agent
stage: stage-004-immersive-surfaces
parts:
  - part-001-parchment-surfaces
  - part-002-ornament-dropcap
estimated_duration: 1d
---

## Goal

Move reader surfaces (`BookPage.svelte`, `ClassicReaderView.svelte`) to
the v2 parchment palette: warm cream background, ink text, sepia borders.
Locally rebind text tokens so descendants render in ink without
per-rule overrides.

## Parts

| #   | Part                                                                | Status        |
| --- | ------------------------------------------------------------------- | ------------- |
| 001 | [Parchment Surfaces](part-001-parchment-surfaces/part.md)           | `complete`    |
| 002 | [Ornament + DropCap](part-002-ornament-dropcap/part.md)             | `complete`    |

## Exit Criteria

- `BookPage.svelte` and `ClassicReaderView.svelte` render on
  `--color-parchment` with text rebound to `--color-ink` /
  `--color-ink-soft` / `--color-ink-mute`.
- Border tokens swapped to `--color-parchment-deep` inside the parchment
  scope.
- All gates clean.

## Follow-ups (out of scope for this phase)

- Red ribbon, folio numbers, candle vignette (Stage 004 Phase 003 part
  003).
- Two-page parchment spread gutter recolour (Stage 004 Phase 003 part
  004).
