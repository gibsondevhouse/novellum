---
title: Registry Inventory
slug: part-001-registry-inventory
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-registry-inventory
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Create the tool registry baseline needed to identify unsafe model-callable mutations.

## Scope

**In scope:**

- List tool IDs, descriptions, input schemas, handlers, and imported APIs.
- Identify side-effecting fetches and checkpoint mutation helpers.
- Capture advertised tools in evidence.

**Out of scope:**

- Removing tools during the audit.
- Changing model prompts.

## Implementation Steps

1. Inspect `agent-tools.ts`, `tool-registry.ts`, and tests that register tools.
2. Record each tool with handler imports and server routes called.
3. Classify unknown tools for follow-up review.
4. Save the registry inventory under evidence.

## Files

**Create:**

- `evidence/registry-inventory-evidence-2026-06-09.md`

**Update:**

- None

**Reference:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] Every registered tool is listed.
- [ ] Each tool includes route/API reachability.
- [ ] Mutation-suspect tools are flagged.

## Edge Cases

- Tools register by module side effect.
- Tests may register sample tools unrelated to product behavior.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
