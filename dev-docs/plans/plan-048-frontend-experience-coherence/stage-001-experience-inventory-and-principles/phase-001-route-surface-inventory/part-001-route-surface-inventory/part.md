---
title: Route Surface Inventory
slug: part-001-route-surface-inventory
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-001-route-surface-inventory
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Create a complete route and component inventory for the frontend surfaces that must feel coherent in the final product.

## Scope

**In scope:**

- List all SvelteKit route pages and layouts.
- Map app shell, sidebar, breadcrumb, active project, Nova panel, editor, outline, world-building, export, settings, reader, and onboarding surfaces.
- Identify repeated empty state, status, action, modal, card, and navigation patterns.

**Out of scope:**

- Changing route behavior.
- Refactoring visual components before the workflow map exists.

## Implementation Steps

1. Search `src/routes`, `src/lib/components`, and `src/modules` for all route and workspace surfaces.
2. Classify each surface by user workflow, ownership module, and shell dependency.
3. Capture duplicated or conflicting patterns with file paths and examples.
4. Save the inventory as dated evidence under this part.

## Files

**Create:**

- `evidence/route-surface-inventory-2026-06-09.md`

**Update:**

- None

**Reference:**

- `src/routes/+layout.svelte`
- `src/routes/projects/[id]/+layout.svelte`
- `src/lib/components/AppShell.svelte`
- `src/lib/components/AppSidebar.svelte`
- `src/lib/components/AppHeader.svelte`
- `src/lib/navigation-state.ts`
- `src/lib/sidebar-navigation.ts`
- `src/modules/editor/components/EditorShell.svelte`
- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/outline/components`
- `src/modules/world-building/components`
- `src/modules/export/components/ManuscriptExportDialog.svelte`
- `tests/e2e/project-lifecycle.spec.ts`

## Acceptance Criteria

- [ ] Project, editor, outline, Nova, worldbuilding, export, settings, onboarding, reader, books, stories, images, and styles surfaces are inventoried.
- [ ] Shell and navigation responsibilities are separated from module-specific responsibilities.
- [ ] Duplicate or conflicting frontend patterns are captured as concrete follow-up candidates.

## Edge Cases

- Some components may be reachable only through feature flags or story files.
- Route params and active project stores may both drive the same visible state.

## Notes

Keep this part observational. Later stages decide whether to consolidate, retire, or preserve patterns.
