# phase-002 — Stateful Empty, Loading, and Error Surfaces

> Status: `complete`  
> Parent stage: `stage-002`  
> Parent plan: `plan-030-nova-production-refactor`

## Objective

Replace generic prototype states with state-specific user guidance.

## Entry Criteria

- Parent plan and stage have been read.
- Relevant files have been inspected on branch `feat/nova-development`.
- Constraints from `plan.md` are understood.

## Parts

- `part-001-empty-state-with-context-awareness.md` — Context-Aware Empty State
- `part-002-no-key-and-settings-consistency.md` — No-Key and Settings Consistency
- `part-003-streaming-aborted-error-recovery.md` — Streaming, Aborted, and Error Recovery

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
