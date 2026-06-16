---
title: Define Inline Artifact Action Contract
slug: part-002-define-inline-artifact-action-contract
part_number: 2
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-surface-inventory
started_at: 2026-06-15
completed_at: 2026-06-15
estimated_duration: 0.5d
---

## Objective

Define the reusable contract for inline Nova artifact actions so later stages can wire behavior without duplicating mutation logic.

## Scope

**In scope:**

- Define success, failure, insufficient-context, stale-target, and persisted-acknowledgement states.
- Specify how action results are shown in cards and logged in evidence.

**Out of scope:**

- Implementing the action handlers.

## Implementation Steps

1. Translate the inventory into a small action-result contract.
2. Choose where scene draft bridge and revision acknowledgement helpers should live.
3. Document how controller audit metadata is attached when the controller runtime is available.

## Files

**Create:**

- `src/modules/nova/services/artifact-action-types.ts`

**Update:**

- `src/modules/nova/index.ts`

**Reference:**

- `src/lib/ai/pipeline/contracts.ts`
- `src/lib/stores/editor-dirty.svelte.ts`
- `src/lib/project-metadata.ts`

## Acceptance Criteria

- [x] Contract distinguishes review decisions from non-mutating acknowledgements.
- [x] Contract carries enough data for user-visible status and test assertions.
- [x] Contract documents fallback behavior when an artifact cannot be acted on safely.

## Edge Cases

- The action bridge must not require plan-051-specific imports if the active branch lacks the controller files.
- Errors must be user-safe and not expose raw provider or stack traces.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
