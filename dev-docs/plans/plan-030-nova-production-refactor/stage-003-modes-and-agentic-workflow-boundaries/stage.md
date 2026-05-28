# stage-003 — Modes and Agentic Workflow Boundaries

> Status: `complete`  
> Parent plan: `plan-030-nova-production-refactor`

## Objective

Make Chat/Scribe behavior predictable, grounded, and review-gated without broad autonomous tool-calling.

## Outcome

Nova can feel agentic through explicit workflow states and artifact proposals without overpromising unsupported automation.

## Scope Boundaries

### In scope

- Work listed in this stage and its phase/part files.
- Tests and docs required to prove the stage outcome.
- Low-hanging fruit explicitly tied to this stage.

### Out of scope

- Unrelated module redesign.
- Direct provider integrations.
- Full manuscript default context.
- Manuscript/editor auto-mutation.
- Autonomous tool runtime expansion.

## Phases

- `phase-001-chat-and-scribe-contracts` — Chat and Scribe Contracts
- `phase-002-artifact-review-gate-integrity` — Artifact Review-Gate Integrity
- `phase-003-canonical-surface-reconciliation` — Canonical Surface Reconciliation

## Stage Acceptance Criteria

- All phase checklists complete.
- Required tests added or updated.
- Evidence recorded.
- No non-negotiable constraints violated.

## Risks

- Scope creep from adjacent Nova/fullscreen route work.
- UX polish masking context defects.
- Tests asserting implementation details instead of behavior.
