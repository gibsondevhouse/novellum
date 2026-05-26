---
title: Define Pipeline Contract
slug: part-001-define-pipeline-contract
part_number: 1
status: draft
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-orchestrator-contract
started_at: ~
completed_at: ~
estimated_duration: 2d
---

## Objective

Define and implement the baseline pipeline contract used by orchestrator/task-resolver for staged generation and review gating.

## Scope

**In scope:**

- Typed stage/task contracts for `vibe-worldbuild` and `vibe-author`.
- Structured artifact envelope with lifecycle fields and parser hooks.
- Explicit hierarchy references for `arcs -> acts -> milestones -> chapters -> scenes -> beats -> stages`.

**Out of scope:**

- Final UI integration for stage execution.
- Schema migrations.

## Implementation Steps

1. Add shared pipeline contract and task catalog types.
2. Extend task resolver + orchestrator entry points to route stage-typed requests.
3. Add contract-focused tests for lifecycle, hierarchy mapping, and unknown-stage rejection.

## Files

**Create:**

- `src/lib/ai/pipeline/contracts.ts`
- `src/lib/ai/pipeline/task-catalog.ts`
- `tests/ai/pipeline/contracts.test.ts`

**Update:**

- `src/lib/ai/types.ts`
- `src/lib/ai/task-resolver.ts`
- `src/lib/ai/orchestrator.ts`
- `src/lib/ai/index.ts`

## Acceptance Criteria

- [ ] Pipeline task catalog includes worldbuild + author stage families.
- [ ] Orchestrator accepts typed stage requests and returns typed artifact envelopes.
- [ ] Contract encodes 7-layer hierarchy semantics (including milestones and stages).
- [ ] New tests verify stage routing, lifecycle defaults, and error handling.

## Edge Cases

- Unknown pipeline stage keys must fail fast with actionable errors.
- Missing hierarchy references must not silently downcast to 5-layer assumptions.

## Notes

Maintain no-silent-edit policy: all outputs remain proposals until explicitly accepted.
