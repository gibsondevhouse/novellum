# phase-001 — Test Suite and Regression Evidence

> Status: `complete`  
> Parent stage: `stage-004`  
> Parent plan: `plan-030-nova-production-refactor`

## Objective

Add and run tests proving context grounding, UI truthfulness, and no-auto-apply behavior.

## Entry Criteria

- Parent plan and stage have been read.
- Relevant files have been inspected on branch `feat/nova-development`.
- Constraints from `plan.md` are understood.

## Parts

- `part-001-unit-service-tests.md` — Unit and Service Tests
- `part-002-component-and-visual-tests.md` — Component and Visual Tests
- `part-003-source-contract-tests.md` — Source Contract Tests

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
