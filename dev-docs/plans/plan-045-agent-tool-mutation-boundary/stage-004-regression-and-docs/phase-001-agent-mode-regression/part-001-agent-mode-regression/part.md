---
title: Agent Mode Regression
slug: part-001-agent-mode-regression
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-001-agent-mode-regression
started_at: 2026-06-11
completed_at: 2026-06-11
estimated_duration: TBD
---

## Objective

Verify read and generation tools still work while mutation tools are excluded.

## Scope

**In scope:**

- Agent loop unit tests.
- Tool registry output assertions.
- Optional manual smoke with mock provider if available.

**Out of scope:**

- Real-provider cost-bearing tests.
- New Agent capabilities.

## Implementation Steps

1. Run Nova agent-loop tests.
2. Run registry tests for tool advertisement.
3. Add or update tests for generation-only checkpoint tools.
4. Save results under evidence.

## Files

**Create:**

- `evidence/agent-mode-regression-evidence-2026-06-09.md`

**Update:**

- `tests/nova/agent-loop.test.ts`
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

- [x] Agent mode can still call read/generate tools.
- [x] Mutation tools are absent from advertised payloads.
- [x] Command output evidence is captured.

## Edge Cases

- Mocked tool loops may not exercise OpenRouter tool-call formatting.
- Do not run real model calls without explicit setup.

## Notes

Keep this part scoped to Agent Tool Mutation Boundary. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
