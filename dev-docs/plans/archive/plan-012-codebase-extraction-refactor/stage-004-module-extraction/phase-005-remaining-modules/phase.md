---
title: Remaining Modules
slug: phase-005-remaining-modules
phase_number: 5
status: complete
owner: Planner Agent
stage: stage-004-module-extraction
parts:
  - part-001-project-consistency-settings
  - part-002-export-module
estimated_duration: 0.75d
---

## Goal

> Extract constants and types from the remaining smaller modules: project, consistency, settings, and export.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
|---|------|--------|-------------|---------------|
| 001 | [Project, Consistency & Settings](part-001-project-consistency-settings/part.md) | `review` | Architect | 0.5d |
| 002 | [Export Module](part-002-export-module/part.md) | `review` | Architect | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Each module has canonical `constants.ts` and/or `types.ts`
- [ ] Settings module has an `index.ts` barrel (currently missing)
