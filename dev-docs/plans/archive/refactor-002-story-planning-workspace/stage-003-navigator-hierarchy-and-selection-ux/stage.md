---
title: Navigator Hierarchy and Selection UX
slug: stage-003-navigator-hierarchy-and-selection-ux
stage_number: 3
status: complete
owner: Frontend Agent
plan: refactor-002-story-planning-workspace
phases:
  - phase-001-act-chapter-scene-navigator-refactor
estimated_duration: 4d
risk_level: medium
---

## Goal

Refactor outline navigation into a calm selector-first hierarchy where act, chapter, and scene traversal is explicit and stable.

## Phases

- 001: [Act Chapter Scene Navigator Refactor](phase-001-act-chapter-scene-navigator-refactor/phase.md) (`draft`, 4d)

## Entry Criteria

- Stage 002 hierarchy data is available in route load output
- Selection semantics are defined in stage-level UX notes

## Exit Criteria

- Navigator supports act/chapter/scene grouping and expand-collapse behavior
- Selected state is explicit and keyboard reachable
- Utility controls no longer dominate hierarchy scanning flow

## Notes

Favor legibility and low cognitive noise over control density.
