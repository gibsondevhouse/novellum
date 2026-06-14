---
title: Runtime Contract Spec
slug: part-001-runtime-contract-spec
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-002-runtime-contract-spec
started_at: 2026-06-14
completed_at: 2026-06-14
estimated_duration: TBD
---

## Objective

Write the canonical runtime contract for durable local agent execution.

## Scope

**In scope:**

- Define lifecycle states for `agent_runs`, `agent_run_steps`, `agent_tool_calls`, `agent_jobs`, `agent_artifacts`, traces, and diagnostics.
- Specify how runtime records link to projects, scenes, checkpoints, proposals, artifacts, and user review actions.
- Define status transitions for pending, running, waiting_for_review, completed, failed, cancelled, expired, and retrying states.
- Define redaction rules for secrets and diagnostic export.

**Out of scope:**

- Implementing the schema.
- Changing product UI.

## Implementation Steps

1. Convert the surface inventory into a runtime state model.
2. Define canonical IDs, lifecycle values, event ordering, and link fields.
3. Document author-in-the-loop constraints for all mutation-like results.
4. Define the minimum runtime events required for diagnostics and eval replay.
5. Save the runtime contract spec as dated evidence.

## Files

**Create:**

- `evidence/runtime-contract-spec-2026-06-11.md`

**Update:**

- None

**Reference:**

- `src/lib/ai/pipeline/checkpoint-contract.ts`
- `src/lib/ai/pipeline/author-draft-contract.ts`
- `src/lib/ai/pipeline/outline-checkpoint-contract.ts`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
- `src/modules/nova/types.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`
- `dev-docs/plans/plan-045-agent-tool-mutation-boundary/plan.md`
- `dev-docs/plans/plan-046-pipeline-checkpoint-contract-reconciliation/plan.md`

## Acceptance Criteria

- [x] Runtime lifecycle states are defined for runs, steps, jobs, tool calls, artifacts, cancellations, retries, and failures.
- [x] Review-gated mutation boundaries are explicit in the runtime contract.
- [x] The contract maps current runtime paths to future schema and service owners.

## Edge Cases

- A run can complete generation but still wait for user review.
- A cancelled worker job may leave a persisted checkpoint or proposal in draft state.

## Notes

Treat this spec as the source of truth for later migration and service work.
