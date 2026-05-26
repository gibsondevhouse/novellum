---
title: The Page (Editor surface)
slug: phase-001-page-editor
phase_number: 1
status: complete
owner: Stylist Agent
stage: stage-004-immersive-surfaces
parts:
  - part-001-editor-prose-and-headings
estimated_duration: 0.5d
---

## Goal

Tune `ManuscriptEditorPane.svelte` to the v2 "Page" surface: Crimson Pro
prose, DM Serif Display chapter headings, candle caret.

## Parts

| #   | Part                                                                                | Status        |
| --- | ----------------------------------------------------------------------------------- | ------------- |
| 001 | [Editor Prose & Headings](part-001-editor-prose-and-headings/part.md)               | `complete`    |

## Exit Criteria

- Editor host consumes `--editor-prose-font` (Crimson Pro).
- `h1` / `h2` rendered in `--font-display` (DM Serif Display).
- Caret recoloured to `--color-candle`.
- All gates clean.
