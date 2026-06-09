---
title: Worldbuild & Outline Actions
slug: part-001-worldbuild-and-outline-actions
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-003-worldbuild-and-outline-actions
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Ensure canon and outline mutations are invoked by review UI or trusted app commands, not model tool calls.

## Scope

**In scope:**

- Audit current worldbuild and outline action helpers.
- Add guard tests for future tool registrations.
- Document allowed mutation callers.

**Out of scope:**

- Rewriting worldbuild merge semantics; that belongs to plan 047.
- Changing outline materialization behavior; that belongs to plan 043 unless necessary for boundary enforcement.

## Implementation Steps

1. Trace worldbuild proposal accept/reject and outline checkpoint accept/reject callers.
2. Confirm no model-callable tool reaches those accept/apply APIs.
3. Add tests or registry assertions for those families.
4. Update docs with mutation caller policy.

## Files

**Create:**

- `evidence/worldbuild-and-outline-actions-evidence-2026-06-09.md`

**Update:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/outline-checkpoint-actions.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
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

- [ ] Canon and outline mutations are excluded from model-callable tool advertisement.
- [ ] Review UI actions still work.
- [ ] Docs identify allowed mutation callers.

## Edge Cases

- Outline reject may occur through generic metadata route; make ownership explicit.
- Worldbuilding proposals and checkpoints have different owners/routes.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
