---
title: Editor Extraction
slug: phase-003-editor-extraction
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-004-module-extraction
parts:
  - part-001-editor-constants-types
estimated_duration: 0.5d
---

## Goal

> Extract editor-specific constants (toolbar configs, extension configs, key bindings) and types from editor components into `src/modules/editor/constants.ts` and `src/modules/editor/types.ts`.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
|---|------|--------|-------------|---------------|
| 001 | [Editor Constants & Types](part-001-editor-constants-types/part.md) | `review` | Architect | 0.5d |

## Acceptance Criteria

- [ ] Editor module has canonical `constants.ts`
- [ ] `src/modules/editor/index.ts` re-exports all shared items
- [ ] No inline config objects in editor components
