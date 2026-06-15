---
title: Shell & Panel Model
slug: part-001-shell-and-panel-model
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-002-shell-and-panel-model
started_at: 2026-06-15T00:00:00-04:00
completed_at: 2026-06-15T00:00:00-04:00
estimated_duration: 1h
---

## Objective

Define and implement a coherent shell and panel model for global routes, project routes, workspace routes, and Nova-assisted workflows.

## Scope

**In scope:**

- Clarify responsibilities for `AppShell`, `AppSidebar`, `AppHeader`, `SecondaryLeftSidebar`, project layout, editor shell, and Nova panel.
- Standardize where primary actions, secondary navigation, context pills, and review queues appear.
- Add layout tests or stories where shell behavior is currently under-specified.

**Out of scope:**

- Replacing the entire design system.
- Adding unrelated dashboard or landing-page concepts.

## Implementation Steps

1. Compare current shell behavior against the workflow map.
2. Define the global shell, project shell, workspace shell, and panel contract.
3. Update shell components and route layouts to follow the contract.
4. Add targeted tests or stories for critical shell states.
5. Capture before/after evidence under this part.

## Files

**Create:**

- `evidence/shell-and-panel-model-2026-06-15.md`

**Update:**

- `src/lib/components/AppShell.svelte`
- `src/lib/components/AppSidebar.svelte`
- `src/lib/components/AppHeader.svelte`
- `src/lib/components/SecondaryLeftSidebar.svelte`
- `src/routes/+layout.svelte`
- `src/routes/projects/[id]/+layout.svelte`
- `src/modules/editor/components/EditorShell.svelte`
- `src/modules/nova/components/NovaPanel.svelte`
- `tests/components/sidebar-project-search.svelte.test.ts`
- `tests/nova/nova-panel.test.ts`

**Reference:**

- `src/lib/components/Breadcrumb.svelte`
- `src/lib/components/ActiveProjectSection.svelte`
- `src/lib/components/SidebarItem.svelte`
- `src/modules/world-building/components/WorldBuildingSubheaderNav.svelte`
- `tests/e2e/project-lifecycle.spec.ts`

## Acceptance Criteria

- [x] Global and project-scoped shells have clear responsibilities.
- [x] Nova panel behavior is consistent across project workspaces.
- [x] Layout changes do not hide critical author actions or review gates.

## Edge Cases

- Narrow viewports may need a different Nova and sidebar presentation.
- Focus mode in the editor may intentionally suppress some shell chrome.

## Evidence

- [Shell And Panel Model (2026-06-15)](./evidence/shell-and-panel-model-2026-06-15.md)

## Notes

Do not put major workflow controls in one-off locations unless the workflow map requires it.
