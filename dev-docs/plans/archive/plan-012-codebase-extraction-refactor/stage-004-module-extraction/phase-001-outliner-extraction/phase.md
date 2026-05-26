---
title: Outliner Extraction
slug: phase-001-outliner-extraction
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-004-module-extraction
parts:
  - part-001-dedup-beat-focus
estimated_duration: 0.5d
---

## Goal

> De-duplicate the `BeatFocus` type and related outliner constants/types that currently appear in 4+ files.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
|---|------|--------|-------------|---------------|
| 001 | [De-duplicate BeatFocus & Outliner Types](part-001-dedup-beat-focus/part.md) | `review` | Architect | 0.5d |

## Acceptance Criteria

- [ ] `BeatFocus` defined in exactly one file (`src/modules/outliner/types.ts`)
- [ ] All 4 consumer files import from the canonical location
- [ ] `pnpm check` and `pnpm run lint` pass
