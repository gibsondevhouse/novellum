---
title: Targeted Editor Nova Tests
slug: part-001-targeted-editor-nova-tests
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-targeted-editor-nova-tests
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Prevent regressions where active scene or chapter context disappears from normal navigation.

## Scope

**In scope:**

- Unit tests for context resolver.
- Component/e2e coverage for editor route Nova panel behavior.
- Command output evidence.

**Out of scope:**

- Full visual suite unless UI layout changes.
- Model provider integration tests.

## Implementation Steps

1. Run resolver tests.
2. Run targeted editor/Nova Playwright or component tests.
3. Add missing assertions for no-query editor scene route.
4. Save output under evidence.

## Files

**Create:**

- `evidence/targeted-editor-nova-tests-evidence-2026-06-09.md`

**Update:**

- `tests/nova/active-context.test.ts`
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

- [ ] Tests prove active scene and chapter context without query params.
- [ ] Static gates remain clean.
- [ ] Evidence includes exact commands and results.

## Edge Cases

- Playwright web server state can affect context tests.
- Visual tests may be skipped if unrelated to context correctness.

## Notes

Keep this part scoped to Nova Active Context Routing. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
