---
title: Spec state machine and accessibility
slug: part-002-spec-state-machine-accessibility
part_number: 2
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-002-export-dialog-ui
phase: phase-001-ux-spec
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.2d
dependencies: ["part-001-spec-export-flow"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 002 — Spec state machine and accessibility

## Objective

Define a deterministic UI state machine and accessibility rules for the export dialog.

## Problem

Export flows can fail in several ways: invalid input, generation errors, save cancellation, browser download issues, and desktop placeholder behavior. Without explicit states, the UI will drift into inconsistent booleans and duplicated error handling.

## Files

**Create:**

- `dev-docs/plans/plan-039-manuscript-export-ui/stage-002-export-dialog-ui/phase-001-ux-spec/part-002-spec-state-machine-accessibility/evidence/export-state-machine-2026-06-01.md`

**Update:**

- None.

## Required Changes

- Define states: idle, validating, exporting, delivery-pending, delivered, cancelled, failed.
- Define allowed transitions and recovery actions.
- Define focus management on open, error, success, and close.
- Define aria labels, role usage, status region, alert region, and Escape behavior.
- Define what state can be persisted versus reset on each open.

## UI/UX Requirements

- Primary button must remain predictable.
- Cancel during save dialog must return to idle with no red error.
- Errors must be actionable and not expose stack traces.

## Data Requirements

- State machine must keep generated blobs out of persistent storage.
- Metadata defaults may be ephemeral unless a later part explicitly persists them.

## Error Handling Requirements

- Define user-facing copy for validation, generation, delivery, and unsupported desktop errors.

## Tests

- State transitions must be unit-testable without rendering the full dialog.

## Acceptance Criteria

- [x] Evidence includes state diagram or transition table.
- [x] Evidence includes accessibility checklist.
- [x] Evidence names user-facing messages for failure states.

## Out of Scope

- Do not implement the component yet.

## Dependencies

- part-001-spec-export-flow

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Define a deterministic UI state machine and accessibility rules for the export dialog.
2. **Problem:** Export flows can fail in several ways: invalid input, generation errors, save cancellation, browser download issues, and desktop placeholder behavior. Without explicit states, the UI will drift into inconsistent booleans and duplicated error handling.
3. **Files:** Create: dev-docs/plans/plan-039-manuscript-export-ui/stage-002-export-dialog-ui/phase-001-ux-spec/part-002-spec-state-machine-accessibility/evidence/export-state-machine-2026-06-01.md. Update: None.
4. **Changes:** Define states: idle, validating, exporting, delivery-pending, delivered, cancelled, failed., Define allowed transitions and recovery actions., Define focus management on open, error, success, and close., Define aria labels, role usage, status region, alert region, and Escape behavior., Define what state can be persisted versus reset on each open.
5. **UI/UX:** Primary button must remain predictable., Cancel during save dialog must return to idle with no red error., Errors must be actionable and not expose stack traces.
6. **Data:** State machine must keep generated blobs out of persistent storage., Metadata defaults may be ephemeral unless a later part explicitly persists them.
7. **Errors:** Define user-facing copy for validation, generation, delivery, and unsupported desktop errors.
8. **Tests:** State transitions must be unit-testable without rendering the full dialog.
9. **Criteria:** Evidence includes state diagram or transition table., Evidence includes accessibility checklist., Evidence names user-facing messages for failure states.
10. **Out-of-scope:** Do not implement the component yet.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-spec-export-flow.
