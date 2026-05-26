---
title: Header & Breadcrumb
slug: phase-003-header
phase_number: 3
status: complete
owner: Architect Agent
stage: stage-003-chrome
parts:
  - part-001-header-anatomy
estimated_duration: 0.75d
---

## Goal

Refactor `AppHeader.svelte` to v2 anatomy: 52px height, eyebrow + serif title
left, optional breath bar center, action cluster right. Add candle-tinted
underline accent.

## Parts

| #   | Part                                                                | Status        |
| --- | ------------------------------------------------------------------- | ------------- |
| 001 | [Header Anatomy](part-001-header-anatomy/part.md)                   | `in-progress` |

## Exit Criteria

- Header consumes `--header-height` (52px).
- Eyebrow ("The Page", "The Room", "The Muse", "Workshop", "Library",
  "Preferences", "Assets") rendered above the title in route-appropriate
  copy.
- Title rendered in `--font-display` (DM Serif Display) at `--text-lg`.
- Candle-tinted gradient underline accent landed.
- Breadcrumb integration unchanged (deferred follow-up if needed).
