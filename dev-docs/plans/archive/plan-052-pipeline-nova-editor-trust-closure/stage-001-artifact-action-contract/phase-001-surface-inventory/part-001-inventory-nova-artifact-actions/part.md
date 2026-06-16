---
title: Inventory Nova Artifact Actions
slug: part-001-inventory-nova-artifact-actions
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-surface-inventory
started_at: 2026-06-15
completed_at: 2026-06-15
estimated_duration: 0.5d
---

## Objective

Produce a source-grounded inventory of inline Nova artifact cards and the action semantics each card claims to provide.

## Scope

**In scope:**

- Audit NovaMessageLog, NovaSceneDraftCard, NovaRevisionPackCard, NovaOutlineCard, and current checkpoint action services.
- Classify Accept, Reject, Acknowledge, Copy, and legacy display paths by durability and mutation risk.

**Out of scope:**

- Changing runtime behavior during inventory.

## Implementation Steps

1. Search the Nova module for inline artifact render paths and callbacks.
2. Document the current behavior, missing props, and downstream services for each artifact action.
3. Identify which adjacent helper APIs should be introduced before UI wiring.

## Files

**Create:**

- `dev-docs/plans/plan-052-pipeline-nova-editor-trust-closure/stage-001-artifact-action-contract/phase-001-surface-inventory/part-001-inventory-nova-artifact-actions/evidence/nova-artifact-action-inventory-2026-06-15.md`

**Update:**

- None

**Reference:**

- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/components/NovaSceneDraftCard.svelte`
- `src/modules/nova/components/NovaRevisionPackCard.svelte`
- `src/modules/nova/components/NovaOutlineCard.svelte`
- `src/modules/nova/services/author-draft-api.ts`
- `src/modules/nova/services/outline-checkpoint-actions.ts`

## Acceptance Criteria

- [x] Inventory lists every affected artifact card and callback.
- [x] Inventory states whether each user action is durable, local-only, review-gated, or currently unwired.
- [x] Execution recommendations preserve explicit human review before manuscript mutation.

## Edge Cases

- Legacy conversation messages may contain artifacts that lack modern checkpoint IDs.
- Some cards may be reachable only through restored session history.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
