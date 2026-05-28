# phase-003 — Canonical Surface Reconciliation

> Status: `complete`  
> Parent stage: `stage-003`  
> Parent plan: `plan-030-nova-production-refactor`

## Objective

Prevent further drift between embedded sidepanel and fullscreen Nova route.

## Entry Criteria

- Parent plan and stage have been read.
- Relevant files have been inspected on branch `feat/nova-development`.
- Constraints from `plan.md` are understood.

## Parts

- `part-001-canonical-runtime-decision.md` — Canonical Runtime Decision
- `part-002-defer-or-migrate-fullscreen-route.md` — Defer or Migrate Fullscreen Route
- `part-003-surface-reconciliation-tests.md` — Surface Reconciliation Tests

## Phase Acceptance Criteria

- All parts complete or explicitly deferred with rationale.
- Tests named in part files are added or updated.
- Evidence is recorded in this phase folder or the top-level `evidence/` directory.
- No full-manuscript default context is introduced.
- No generated artifact is auto-applied to manuscript/editor state.

## Verification

Run the smallest relevant test set during the phase. Full validation is handled in Stage 004.

## Risks

- Over-broad changes to AI architecture.
- Silent fallback behavior that hides context failures.
- UI controls implying unsupported behavior.
