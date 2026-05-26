---
title: Module Extraction
slug: stage-004-module-extraction
stage_number: 4
status: complete
owner: Planner Agent
plan: plan-012-codebase-extraction-refactor
phases:
  - phase-001-outliner-extraction
  - phase-002-bible-extraction
  - phase-003-editor-extraction
  - phase-004-ai-extraction
  - phase-005-remaining-modules
estimated_duration: 4d
risk_level: medium
---

## Goal

> Extract duplicated constants, types, callbacks, and configuration from individual module components into shared module-level files. Each module gets its own `constants.ts`, `types.ts`, and/or `utils.ts` following the gold-standard pattern established in `src/modules/workspace/`.

## Phases

| # | Phase | Status | Est. Duration |
|---|-------|--------|---------------|
| 001 | [Outliner Extraction](phase-001-outliner-extraction/phase.md) | `complete` | 0.5d |
| 002 | [Bible Extraction](phase-002-bible-extraction/phase.md) | `complete` | 0.75d |
| 003 | [Editor Extraction](phase-003-editor-extraction/phase.md) | `complete` | 0.5d |
| 004 | [AI Extraction](phase-004-ai-extraction/phase.md) | `complete` | 1.5d |
| 005 | [Remaining Modules](phase-005-remaining-modules/phase.md) | `complete` | 0.75d |

## Entry Criteria

- Stages 001–003 are `complete`
- `pnpm check` passes

## Exit Criteria

- All module-level shared files created
- All duplicated constants/types live in exactly one canonical location
- `eslint-plugin-boundaries` passes (no cross-module leakage)
- Full test suite passes

## Notes

> Each phase is independent per module. Phases can be parallelized if separate implementors are available. The critical dependency within each phase is the usual create-then-verify flow.
