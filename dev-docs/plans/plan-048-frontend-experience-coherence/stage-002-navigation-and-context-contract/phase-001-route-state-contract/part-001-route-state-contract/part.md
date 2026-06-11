---
title: Route State Contract
slug: part-001-route-state-contract
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-001-route-state-contract
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Make active route context explicit enough that authors and Nova agree on the current project, chapter, scene, and workspace.

## Scope

**In scope:**

- Define route-to-context rules for project hub, editor, outline, world-building, continuity, story bible, arcs, Nova, and settings surfaces.
- Audit active project and navigation stores against the visible route.
- Specify tests for stale context, route changes, project switches, and missing context.

**Out of scope:**

- Implementing plan 044 if it has not been completed.
- Changing database schema.

## Implementation Steps

1. Review plan 044 outputs and the current route inventory.
2. Document the route state contract for project, chapter, scene, workspace, and Nova panel context.
3. Identify source files that must consume the contract instead of ad hoc query params or stale stores.
4. Add or update tests that prove route changes update visible active context and Nova disclosure.
5. Save route state evidence under this part.

## Files

**Create:**

- `evidence/route-state-contract-2026-06-09.md`

**Update:**

- `src/lib/navigation-state.ts`
- `src/lib/stores/active-project.svelte.ts`
- `src/lib/stores/sidebar.svelte.ts`
- `src/modules/nova/components/ContextDisclosurePill.svelte`
- `src/modules/nova/stores/nova-panel.svelte.ts`
- `tests/lib/navigation-state.test.ts`
- `tests/nova/context-disclosure-pill.test.ts`
- `tests/nova/context-hooks.test.ts`

**Reference:**

- `src/routes/+layout.svelte`
- `src/routes/projects/[id]/+layout.svelte`
- `src/routes/projects/[id]/editor/+page.svelte`
- `src/routes/projects/[id]/outline/+page.svelte`
- `src/routes/projects/[id]/world-building/+page.svelte`
- `src/routes/nova/+page.svelte`
- `dev-docs/plans/plan-044-nova-active-context-routing/plan.md`

## Acceptance Criteria

- [ ] Route-derived active context is documented for every project workspace.
- [ ] Store-derived context cannot silently disagree with the visible route.
- [ ] Nova context disclosure reflects the same contract users can see in the UI.

## Edge Cases

- Authors can navigate directly to a deep link without visiting the project hub first.
- Deleted projects, chapters, or scenes can leave stale context in client stores.

## Notes

Keep the contract user-visible. If the app cannot explain Nova's context to the author, the implementation is not coherent enough.
