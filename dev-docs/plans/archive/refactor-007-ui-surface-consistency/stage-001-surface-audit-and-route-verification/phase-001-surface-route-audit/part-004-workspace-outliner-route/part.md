---
title: Workspace / Outliner route
slug: part-004-workspace-outliner-route
part_number: 4
status: draft
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-surface-route-audit
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Validate /projects/[id]/workspace route access and workspace/outliner render integrity.

## Scope

**In scope:**

- Workspace route availability and loader/component integrity

**Out of scope:**

- Deep workspace styling convergence handled later

## Implementation Steps

1. Navigate to /projects/[id]/workspace via active project navigation
2. Resolve broken imports, route files, or loading errors
3. Capture route-load evidence (screenshot or test log) in evidence directory

## Files

**Create:**

- dev-docs/plans/refactor-007-ui-surface-consistency/stage-001-surface-audit-and-route-verification/phase-001-surface-route-audit/part-004-workspace-outliner-route/evidence/

**Update:**

- src/routes/projects/[id]/workspace/+page.svelte; src/routes/projects/[id]/workspace/+page.ts; src/modules/workspace/**

## Acceptance Criteria

- [ ] Workspace route is reachable from navigation and direct URL.
- [ ] Workspace renders without blocking errors.

## Edge Cases

- Mode and selection initialization must not throw when project structures are empty.

## Notes

This part is styling and navigation scoped only and must not absorb refactor-006 resilience or security work.
