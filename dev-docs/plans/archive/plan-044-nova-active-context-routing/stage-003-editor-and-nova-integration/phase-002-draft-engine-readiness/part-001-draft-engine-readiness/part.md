---
title: Draft Engine Readiness
slug: part-001-draft-engine-readiness
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-draft-engine-readiness
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Fix false-empty Draft Engine states caused by missing query-string chapter context.

## Scope

**In scope:**

- Pass active chapter context to `NovaAuthorDraftEngine` on editor scene routes.
- Retain disabled states when no chapter/scenes exist.
- Add targeted tests for editor route readiness.

**Out of scope:**

- Changing draft generation schema or prompts.
- Auto-running draft generation.

## Implementation Steps

1. Trace active chapter from editor route load data or resolver output.
2. Update Draft Engine prop wiring and guard copy as needed.
3. Add tests that open editor scene route without `?chapterId=` and see draft controls enabled.
4. Run targeted editor/Nova tests.

## Files

**Create:**

- None

**Update:**

- `src/modules/nova/components/NovaAuthorDraftEngine.svelte`
- `src/modules/nova/components/NovaPanel.svelte`
- `tests/visual/editor-nova-panel.test.ts`
- `tests/e2e/project-lifecycle.spec.ts`

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

- [ ] Draft Engine no longer requires chapter query params on editor scene routes.
- [ ] Missing chapter still shows a clear disabled state.
- [ ] No manuscript content is changed by readiness wiring alone.

## Edge Cases

- Editor hub route and editor scene route may have different data availability.
- Draft controls must remain disabled during load.

## Notes

Keep this part scoped to Nova Active Context Routing. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
