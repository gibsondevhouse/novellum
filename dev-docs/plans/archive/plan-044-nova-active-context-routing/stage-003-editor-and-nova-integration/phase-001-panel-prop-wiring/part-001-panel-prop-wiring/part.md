---
title: Panel Prop Wiring
slug: part-001-panel-prop-wiring
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-panel-prop-wiring
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Replace query-only prop wiring with the resolved context contract.

## Scope

**In scope:**

- Update root layout and Nova panel prop flow.
- Preserve project persistence behavior.
- Add tests or component coverage for prop resolution if available.

**Out of scope:**

- Moving Nova panel out of the app shell.
- Redesigning panel placement.

## Implementation Steps

1. Use the context resolver in layout or the nearest safe boundary.
2. Pass resolved context into `NovaPanel` and `NovaComposer`.
3. Remove duplicate query parsing where replaced.
4. Run Nova component/service tests.

## Files

**Create:**

- None

**Update:**

- `src/routes/+layout.svelte`
- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/NovaComposer.svelte`
- `tests/nova/active-context.test.ts`

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

- [ ] Nova receives route-derived active scene/chapter context.
- [ ] Existing project ID persistence still works.
- [ ] Composer sends normalized context to chat service.

## Edge Cases

- Global panel exists on routes without project context.
- Compact viewport behavior should not change.

## Notes

Keep this part scoped to Nova Active Context Routing. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
