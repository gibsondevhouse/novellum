# phase-003 — Context Disclosure and Generation Gates

> Status: `complete`  
> Parent stage: `stage-001`  
> Parent plan: `plan-030-nova-production-refactor`

## Objective

Make grounding visible to users and prevent large generation when core context is missing.

## Entry Criteria

- Parent plan and stage have been read.
- Relevant files have been inspected on branch `feat/nova-development`.
- Constraints from `plan.md` are understood.

## Parts

- `part-001-context-disclosure-truthfulness.md` — Context Disclosure Truthfulness
- `part-002-missing-context-guardrails.md` — Missing Context Guardrails
- `part-003-generation-gate-tests.md` — Generation Gate Tests

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
