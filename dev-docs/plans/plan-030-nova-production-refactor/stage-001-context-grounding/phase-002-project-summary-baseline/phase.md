# phase-002 — Project Summary Baseline

> Status: `complete`  
> Parent stage: `stage-001`  
> Parent plan: `plan-030-nova-production-refactor`

## Objective

Implement compact project baseline context as the minimum grounding unit for Nova.

## Entry Criteria

- Parent plan and stage have been read.
- Relevant files have been inspected on branch `feat/nova-development`.
- Constraints from `plan.md` are understood.

## Parts

- `part-001-add-project-summary-context-contract.md` — Add Project Summary Context Contract
- `part-002-implement-no-scene-fallback.md` — Implement No-Scene Fallback
- `part-003-preserve-baseline-through-prompt-build.md` — Preserve Baseline Through Prompt Build
- `part-004-add-project-grounding-tests.md` — Add Project Grounding Tests

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
