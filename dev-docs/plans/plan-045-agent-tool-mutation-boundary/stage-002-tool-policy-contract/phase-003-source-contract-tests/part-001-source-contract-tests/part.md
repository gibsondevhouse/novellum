---
title: Source Contract Tests
slug: part-001-source-contract-tests
part_number: 1
status: complete
owner: Planner Agent
assigned_to: —
phase: phase-003-source-contract-tests
started_at: 2026-06-11
completed_at: 2026-06-11
estimated_duration: TBD
---

## Objective

Make it mechanically hard to register model-callable tools that import or invoke mutation APIs.

## Scope

**In scope:**

- Static tests over source files.
- Registry metadata tests.
- Specific assertions for author draft accept/reject/apply helpers.

**Out of scope:**

- Replacing ESLint boundary rules.
- General security sandboxing.

## Implementation Steps

1. Add tests that inspect `agent-tools.ts` and registry output.
2. Assert model-callable tools cannot include mutation capability.
3. Assert known mutation APIs are not imported by model-callable handlers unless behind UI command boundary.
4. Run Nova-specific tests.

## Files

**Create:**

- `tests/nova/agent-tool-mutation-boundary.test.ts`
- `src/modules/nova/services/agent-mutation-tools.ts`
- `evidence/source-contract-tests-evidence-2026-06-11.md`

**Update:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-router.ts`
- `src/modules/nova/index.ts`
- `tests/nova/tool-router.test.ts`
- `tests/nova/agent-source-contracts.test.ts`

**Reference:**

- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [x] Tests fail if `authorDraft.accept_checkpoint` is model-callable.
- [x] Tests fail if a mutation tool omits mutation metadata.
- [x] Source-contract coverage is documented.

## Edge Cases

- Source text tests can be brittle; keep patterns narrow.
- Runtime registry tests should complement source scans.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
