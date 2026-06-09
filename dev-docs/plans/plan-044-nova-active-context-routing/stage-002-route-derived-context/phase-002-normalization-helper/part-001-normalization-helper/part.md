---
title: Normalization Helper
slug: part-001-normalization-helper
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-normalization-helper
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Centralize active context resolution so future Nova consumers do not parse route state independently.

## Scope

**In scope:**

- Create a small typed resolver/helper or store.
- Add unit tests for project, scene, chapter, and query override cases.
- Keep browser/SSR behavior safe.

**Out of scope:**

- Broad route refactors.
- Prompt changes unrelated to context.

## Implementation Steps

1. Create the resolver at the location chosen by design.
2. Add types for resolved context and context source metadata.
3. Write unit tests for key route/page/query combinations.
4. Run targeted tests.

## Files

**Create:**

- `src/modules/nova/services/active-context.ts`
- `tests/nova/active-context.test.ts`

**Update:**

- `src/routes/+layout.svelte`

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

- [ ] Context resolver returns stable project/scene/chapter fields.
- [ ] Tests cover editor scene route with no query params.
- [ ] No component needs ad hoc query parsing for Nova context.

## Edge Cases

- Do not import server-only route load modules into client code.
- Avoid Svelte rune usage in plain helper modules unless needed.

## Notes

Keep this part scoped to Nova Active Context Routing. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
