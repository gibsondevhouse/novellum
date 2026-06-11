---
title: Agent Surface Inventory
slug: part-001-agent-surface-inventory
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-001-agent-surface-inventory
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Produce a source-grounded map of Novellum's current AI runtime surfaces before adding durable runtime infrastructure.

## Scope

**In scope:**

- Audit Nova chat, Agent mode, tool registry, provider proxy, outline generation, author draft checkpoints, worldbuilding checkpoints, continuity, and export-adjacent diagnostics.
- Classify each path by runtime duration, persistence model, review gate, mutation risk, cancellation behavior, retry behavior, and user-visible status.
- Identify where current state lives only in browser session state or ad hoc metadata.

**Out of scope:**

- Adding new tables or services.
- Changing the tool registry or provider behavior during inventory.

## Implementation Steps

1. Search `src/lib/ai`, `src/lib/server`, `src/modules/nova`, `src/modules/outline`, `src/modules/world-building`, and `src/routes/api` for runtime entrypoints.
2. Record each entrypoint, caller, persisted state, and mutation pathway.
3. Classify each path against durability, cancellation, retry, trace, token/cost, and review-gate requirements.
4. Capture gaps and proposed owners in a dated evidence file.

## Files

**Create:**

- `evidence/agent-surface-inventory-2026-06-11.md`

**Update:**

- None

**Reference:**

- `src/modules/nova/services/agent-loop.ts`
- `src/modules/nova/services/agent-tools.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/tool-router.ts`
- `src/lib/ai/providers/types.ts`
- `src/lib/ai/model-router.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `src/lib/ai/pipeline/outline-checkpoint-service.ts`
- `src/routes/api/ai/+server.ts`
- `src/routes/api/nova/agent/+server.ts`
- `src/routes/api/ai/outline/generate/+server.ts`
- `tests/nova/agent-loop.test.ts`
- `tests/ai/pipeline/checkpoint-flow.test.ts`

## Acceptance Criteria

- [ ] Every Nova, outline, author draft, worldbuilding, continuity, and provider runtime path is listed.
- [ ] Each path is classified as read-only, generation-only, review-gated mutation, direct mutation, or diagnostics.
- [ ] Missing durability, retry, cancellation, trace, and cost behavior is documented by source path.

## Edge Cases

- Some persisted runtime artifacts may live under `project_metadata` instead of dedicated tables.
- Some route handlers may look like generation flows but still produce review-gated mutation artifacts.

## Notes

Keep the inventory current to the branch at execution time. Do not rely only on this plan's file references.
