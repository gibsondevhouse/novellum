---
title: Author Draft Actions
slug: part-001-author-draft-actions
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-author-draft-actions
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Ensure scene prose can only be applied by explicit author action through `NovaAuthorDraftCheckpointCard` or equivalent UI.

## Scope

**In scope:**

- Remove model-callable accept/reject tools or mark them internal only.
- Verify UI card still calls author draft API helpers.
- Add tests for stale/dirty editor confirmation if affected.

**Out of scope:**

- Changing author draft generation prompt.
- Auto-applying generated prose.

## Implementation Steps

1. Remove or internalize `authorDraft.accept_checkpoint` and `authorDraft.reject_checkpoint` model tools.
2. Verify `NovaAuthorDraftCheckpointCard` still handles accept/reject/regenerate.
3. Update tests to assert model loop cannot apply prose.
4. Run author draft tests.

## Files

**Create:**

- None

**Update:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `tests/ai/pipeline/author-draft-checkpoint-service.test.ts`
- `tests/nova/agent-tool-mutation-boundary.test.ts`

**Reference:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] Model-callable tool list cannot apply scene prose.
- [ ] UI accept still updates scene content after confirmation/stale guards.
- [ ] Reject/regenerate behavior remains intact.

## Edge Cases

- Force-overwrite must remain explicit author action.
- Dirty editor state must still be acknowledged before apply.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
