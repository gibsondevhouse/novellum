---
title: Refactor Library and Reader Pages
slug: part-001-refactor-library-and-reader-pages
part_number: 1
status: review
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-core-and-knowledge-route-refactors
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1d
---

## Objective

Align library and reader surfaces with the target page contract, preserving read-only semantics where required and eliminating cross-surface behavior drift.

## Scope

**In scope:**

- Routes: `/`, `/books`, `/books/[id]`, `/stories`
- Hero-card and list behavior consistency
- Sidebar active-state behavior for library versus reader context
- Read-only reader protections against workspace-only controls

**Out of scope:**

- Deep project workspace route refactors
- Bible/world-building surfaces

## Implementation Steps

1. Apply family contract to library and reader routes.
2. Normalize page shell structure, typography rhythm, and primitive usage.
3. Verify route intent mapping (home-reader, books-workspace, stories policy).
4. Capture visual and behavior evidence.

## Files

**Create:**

- `dev-docs/plans/refactor-009-app-page-surface-refactor/stage-002-page-family-refactor-execution/phase-001-core-and-knowledge-route-refactors/part-001-refactor-library-and-reader-pages/evidence/library-reader-validation-2026-04-14.md`

**Update:**

- `dev-docs/plans/refactor-009-app-page-surface-refactor/stage-002-page-family-refactor-execution/phase-001-core-and-knowledge-route-refactors/part-001-refactor-library-and-reader-pages/impl.log.md`

## Acceptance Criteria

- [ ] Library and reader routes conform to route-family contract
- [ ] Read-only routes do not expose project-edit controls
- [ ] Navigation and active-state behavior is consistent and documented

## Edge Cases

- Empty-state parity between `/` and `/books`
- Reader routes opened directly from deep links

## Notes

- Keep reader rendering performance and navigation predictability unchanged or improved.
