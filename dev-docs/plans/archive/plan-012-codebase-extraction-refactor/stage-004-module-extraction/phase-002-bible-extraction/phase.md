---
title: Bible Extraction
slug: phase-002-bible-extraction
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-004-module-extraction
parts:
  - part-001-bible-constants-types
  - part-002-bible-form-callbacks
estimated_duration: 0.75d
---

## Goal

> Extract duplicated constants (entity field options, colors, icon maps) and form callback type patterns from bible components into shared `constants.ts` and `types.ts` files.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
|---|------|--------|-------------|---------------|
| 001 | [Bible Constants & Types](part-001-bible-constants-types/part.md) | `review` | Architect | 0.5d |
| 002 | [Bible Form Callback Types](part-002-bible-form-callbacks/part.md) | `review` | Architect | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Bible module has canonical `constants.ts` and `types.ts`
- [ ] No inline constant arrays in bible components
