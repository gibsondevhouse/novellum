---
title: Advertisement Filter
slug: part-001-advertisement-filter
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-advertisement-filter
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Prevent Agent mode from presenting accept/apply mutation tools to the model.

## Scope

**In scope:**

- Filter `listTools()` output or add an advertisement-specific selector.
- Keep UI/internal command access to mutation routes separate.
- Update Agent loop tests.

**Out of scope:**

- Blocking explicit user button clicks.
- Removing server mutation routes.

## Implementation Steps

1. Add a model-callable tool selector that excludes mutation tools.
2. Use it in chat service and Agent loop tool advertisement.
3. Remove `authorDraft.accept_checkpoint` from model-callable payloads.
4. Add tests that inspect advertised tool IDs.

## Files

**Create:**

- None

**Update:**

- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/services/agent-loop.ts`
- `tests/nova/agent-loop.test.ts`
- `tests/nova/chat-service.test.ts`

**Reference:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] Mutation tools are not advertised to the model.
- [ ] Read and review-artifact generation tools remain advertised.
- [ ] Tests assert excluded IDs by name.

## Edge Cases

- Streaming tool advertisement flag and Agent mode may use different paths.
- Tool calls returned by a model should still be rejected if not advertised.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
