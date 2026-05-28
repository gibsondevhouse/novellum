# phase-002 — Artifact Review-Gate Integrity

> Status: `complete`  
> Parent stage: `stage-003`  
> Parent plan: `plan-030-nova-production-refactor`

## Objective

Preserve proposal-only semantics for generated outlines, scene drafts, and revision packs.

## Entry Criteria

- Parent plan and stage have been read.
- Relevant files have been inspected on branch `feat/nova-development`.
- Constraints from `plan.md` are understood.

## Parts

- `part-001-artifact-card-contracts.md` — Artifact Card Contracts
- `part-002-runner-contracts.md` — Runner Contracts
- `part-003-provenance-and-copy-behavior.md` — Provenance and Copy Behavior

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
