---
title: Contract Risk Map
slug: part-001-contract-risk-map
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-002-contract-risk-map
started_at: 2026-06-12
completed_at: 2026-06-12
estimated_duration: TBD
---

## Objective

Identify what can break when the legacy outline path is removed and define the protection strategy for each risk.

## Scope

**In scope:**

- Assess user-visible Write mode, Nova artifact rendering, persisted legacy artifacts, and tests.
- Document compatibility decisions and required test updates.
- Identify whether any data migration or read-only legacy rendering is needed.

**Out of scope:**

- Implementing compatibility adapters.
- Materializing any outline data.

## Implementation Steps

1. Review the call-site inventory and group risks by route, UI, stored artifact, and test contract.
2. For each risk, choose remove, redirect, read-only fallback, or explicit unsupported error.
3. Define the minimal regression set that must pass after retirement.
4. Save the risk map under evidence.

## Files

**Create:**

- `evidence/contract-risk-map-evidence-2026-06-12.md`

**Update:**

- None

**Reference:**

- `src/routes/api/ai/outline/generate/+server.ts`
- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`
- `src/lib/server/outline/outline-materialization-service.ts`
- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `src/modules/nova/stores/outline-generation-state.svelte.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [x] Each legacy caller has a recommended disposition.
- [x] Persisted legacy artifact handling is decided.
- [x] Regression commands are listed for the implementation stages.

## Edge Cases

- Old Nova session state may still render legacy artifacts.
- Route removal can create confusing 404s unless UI callers are removed first.

## Notes

Keep this part scoped to Outline Pipeline Consolidation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
