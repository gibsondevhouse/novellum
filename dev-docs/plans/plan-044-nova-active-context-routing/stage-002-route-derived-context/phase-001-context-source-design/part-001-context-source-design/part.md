---
title: Context Source Design
slug: part-001-context-source-design
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-context-source-design
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Design how route params, page data, stores, and query params combine into one resolved context object.

## Scope

**In scope:**

- Define precedence between route params, editor page data, editor state, and query params.
- Decide whether implementation lives in a helper, store, or layout-level resolver.
- Document SSR/browser constraints.

**Out of scope:**

- Implementing all consumers before the design is accepted.
- Changing unrelated navigation state.

## Implementation Steps

1. Review the route and consumer audits.
2. Choose the smallest context resolution boundary compatible with SvelteKit layout limitations.
3. Write a design note with precedence and null behavior.
4. Identify tests needed for the resolver.

## Files

**Create:**

- `evidence/context-source-design-evidence-2026-06-09.md`

**Update:**

- `dev-docs/plans/plan-044-nova-active-context-routing/plan.md`

**Reference:**

- `src/routes/+layout.svelte`
- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/NovaAuthorDraftEngine.svelte`
- `src/modules/nova/services/chat-service.ts`
- `dev-docs/02-architecture/routing.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] Context precedence is explicit.
- [ ] The design handles editor scene routes without query params.
- [ ] Implementation files are identified.

## Edge Cases

- Layout components may not receive child page load data directly.
- Stores must not create stale context across project navigation.

## Notes

Keep this part scoped to Nova Active Context Routing. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
