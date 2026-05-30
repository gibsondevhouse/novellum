# stage-001 — Context Grounding Contract

> Status: `complete`  
> Parent plan: `plan-030-nova-production-refactor`

## Objective

Guarantee Nova receives compact project baseline context before story generation whenever a project is open.

## Outcome

Nova can answer project-level prompts from Project Hub metadata even when no scene exists.

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

- `phase-001-current-state-and-bug-repro` — Current State and Bug Reproduction
- `phase-002-project-summary-baseline` — Project Summary Baseline
- `phase-003-context-disclosure-and-generation-gates` — Context Disclosure and Generation Gates

## Stage Acceptance Criteria

- All phase checklists complete.
- Required tests added or updated.
- Evidence recorded.
- No non-negotiable constraints violated.

## Risks

- Scope creep from adjacent Nova/fullscreen route work.
- UX polish masking context defects.
- Tests asserting implementation details instead of behavior.
