---
title: Core and Knowledge Route Refactors
slug: phase-001-core-and-knowledge-route-refactors
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-002-page-family-refactor-execution
parts:
  - part-001-refactor-library-and-reader-pages
  - part-002-refactor-project-workspace-pages
  - part-003-refactor-bible-and-worldbuilding-pages
estimated_duration: 4d
---

## Goal

Apply the merged plan doctrine to page families most central to author workflows, from library intake through deep project knowledge routes.

## Parts

|#|Part|Status|Assigned To|Est. Duration|
|---|---|---|---|---|
|001|[Refactor Library and Reader Pages](part-001-refactor-library-and-reader-pages/part.md)|`complete`|Frontend Agent|1d|
|002|[Refactor Project Workspace Pages](part-002-refactor-project-workspace-pages/part.md)|`complete`|Frontend Agent|1.5d|
|003|[Refactor Bible and Worldbuilding Pages](part-003-refactor-bible-and-worldbuilding-pages/part.md)|`complete`|Frontend Agent|1.5d|

## Acceptance Criteria

- [ ] Library and reader family follows target route contract
- [ ] Project workspace family has consistent shell, navigation, and active-state behavior
- [ ] Bible and world-building routes follow parity and shared-surface conventions
- [ ] All modified pages remain Svelte 5 rune-compliant

## Notes

- Any loader touching project data must use `/api/db/*` as the source-of-truth path.
