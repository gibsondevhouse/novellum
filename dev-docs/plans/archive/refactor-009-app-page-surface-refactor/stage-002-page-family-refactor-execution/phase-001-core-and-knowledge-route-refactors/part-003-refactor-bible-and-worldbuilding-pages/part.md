---
title: Refactor Bible and Worldbuilding Pages
slug: part-003-refactor-bible-and-worldbuilding-pages
part_number: 3
status: review
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-core-and-knowledge-route-refactors
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1.5d
---

## Objective

Refactor bible and world-building page families for structural parity, consistent navigation, and shared design-system compliance.

## Scope

**In scope:**

- Routes: `/projects/[id]/bible`, `/projects/[id]/bible/*`, `/projects/[id]/world-building`, `/projects/[id]/world-building/*`
- Cross-family parity for list/detail and entity-subroute behavior
- Shared page-shell and card/header primitive consistency
- Data loading and deep-link behavior consistency

**Out of scope:**

- Project core page refactors
- Utility/system page updates

## Implementation Steps

1. Align bible and world-building route structures to shared conventions.
2. Normalize layout rhythm, primitives, and deep-link behavior.
3. Enforce route-loader source-of-truth consistency.
4. Capture parity and QA evidence across both route families.

## Files

**Create:**

- `dev-docs/plans/refactor-009-app-page-surface-refactor/stage-002-page-family-refactor-execution/phase-001-core-and-knowledge-route-refactors/part-003-refactor-bible-and-worldbuilding-pages/evidence/bible-worldbuilding-validation-2026-04-14.md`

**Update:**

- `dev-docs/plans/refactor-009-app-page-surface-refactor/stage-002-page-family-refactor-execution/phase-001-core-and-knowledge-route-refactors/part-003-refactor-bible-and-worldbuilding-pages/impl.log.md`

## Acceptance Criteria

- [ ] Bible and world-building pages follow the same shell and interaction conventions
- [ ] Deep links render correctly with predictable navigation state
- [ ] Route data loading follows `/api/db/*` policy and boundaries rules

## Edge Cases

- Shared components diverging between similarly named routes
- Entity detail pages with missing records or stale IDs

## Notes

- Preserve existing narrative-data workflows while normalizing route behavior.
