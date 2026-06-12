---
title: Capability Schema
slug: part-001-capability-schema
part_number: 1
status: review
owner: Planner Agent
assigned_to: —
phase: phase-001-capability-schema
started_at: 2026-06-11
completed_at: 2026-06-11
estimated_duration: TBD
---

## Objective

Make mutation boundaries enforceable by code rather than convention.

## Scope

**In scope:**

- Extend tool definition types with capability class or mutation policy.
- Update product tool registrations.
- Add type-level or runtime validation tests.

**Out of scope:**

- Full RBAC/permissions system.
- Changing unrelated Nova message types.

## Implementation Steps

1. Update `ToolDefinition` to include capability metadata.
2. Annotate every product tool.
3. Add tests that fail on missing capability metadata.
4. Run Nova tool registry tests.

## Files

**Create:**

- `evidence/capability-schema-evidence-2026-06-11.md`

**Update:**

- `src/modules/nova/types.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/agent-tools.ts`
- `tests/nova/tool-registry.test.ts`

**Reference:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [x] All product tools declare capability class.
- [x] Registry tests enforce metadata.
- [x] Existing read/generate tools remain callable.

## Edge Cases

- External test-only tools may need defaults or explicit metadata.
- Type changes can cascade into OpenRouter payload typing.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
