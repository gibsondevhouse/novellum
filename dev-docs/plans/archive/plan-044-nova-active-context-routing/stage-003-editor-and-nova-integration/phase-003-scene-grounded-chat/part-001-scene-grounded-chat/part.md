---
title: Scene-Grounded Chat
slug: part-001-scene-grounded-chat
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-003-scene-grounded-chat
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Make Nova prompt/context assembly scene-aware without requiring explicit query params.

## Scope

**In scope:**

- Verify `sendNovaChat` receives active scene and chapter IDs.
- Update tests for `buildRagContext` policy selection.
- Confirm context disclosure counts remain accurate.

**Out of scope:**

- Changing model prompts beyond corrected context input.
- Adding semantic retrieval.

## Implementation Steps

1. Trace composer submit payload into `sendNovaChat` and Agent loop.
2. Update tests for scene-grounded requests on editor routes.
3. Verify context disclosure reflects scene context.
4. Run Nova chat service tests.

## Files

**Create:**

- None

**Update:**

- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/services/agent-loop.ts`
- `tests/nova/chat-service.test.ts`
- `tests/nova/agent-loop.test.ts`

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

- [ ] Scene-grounded chat uses active scene context from editor routes.
- [ ] Worldbuilding-scope fallback still works when no scene is active.
- [ ] Agent mode receives the same resolved context as Ask/Write mode.

## Edge Cases

- Agent prompts can ask for other scene IDs; tool validation still matters.
- Context disclosure must handle empty context gracefully.

## Notes

Keep this part scoped to Nova Active Context Routing. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
