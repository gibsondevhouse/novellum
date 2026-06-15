---
title: Define manuscript export contract
slug: part-001-define-manuscript-export-contract
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-001-audit-export-stack
phase: phase-002-define-target-contract
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.25d
dependencies: ["part-001-inventory-export-contracts", "part-002-inventory-ui-and-delivery-surfaces"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Define manuscript export contract

## Objective

Define the final UI-to-service contract for profile, format, metadata, chapter subset, and delivery behavior.

## Problem

The current export service receives `ExportOptions` but internally creates fixed `ManuscriptCompileOptions`. The UI cannot reliably control profile or chapter subset until a single typed request model is defined.

## Files

**Create:**

- `dev-docs/plans/plan-039-manuscript-export-ui/stage-001-audit-export-stack/phase-002-define-target-contract/part-001-define-manuscript-export-contract/evidence/target-contract-2026-06-01.md`

**Update:**

- `dev-docs/plans/plan-039-manuscript-export-ui/plan.md`

## Required Changes

- Define a typed request shape, preferably `ManuscriptExportRequest`, that composes format, export options, compile options, and delivery intent.
- Define default behavior for missing title, missing author, no chapters, empty selected chapters, and backup ZIP format.
- Define whether backup ZIP is kept in the manuscript export dialog or moved to a separate portability action.
- Define delivery policy: web download first, desktop save only when the shell surface is implemented and safe.
- Define non-negotiable acceptance criteria for stages 002 through 006.

## UI/UX Requirements

- Contract must map directly to controls: format toggle, profile selector, metadata fields, chapter selector, front/back matter toggles.
- Contract must include disabled-state rules for invalid combinations.

## Data Requirements

- Prefer no database migration in this plan.
- If settings persistence is updated, document exact repository and storage behavior before implementation.

## Error Handling Requirements

- Define a normalized error model for UI display: validation error, export generation error, delivery error, user cancel.
- Cancel must not be displayed as a failure.

## Tests

- Contract evidence must name test categories that later parts must implement.

## Acceptance Criteria

- [x] Target contract evidence file exists and contains final request shape.
- [x] No unresolved format/profile/chapter-selection decision remains before stage 002 starts.
- [x] `plan.md` updated with final stages and assumptions.

## Out of Scope

- Do not implement the contract in code yet.
- Do not add schema migrations unless the contract proves they are required.

## Dependencies

- part-001-inventory-export-contracts
- part-002-inventory-ui-and-delivery-surfaces

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Define the final UI-to-service contract for profile, format, metadata, chapter subset, and delivery behavior.
2. **Problem:** The current export service receives `ExportOptions` but internally creates fixed `ManuscriptCompileOptions`. The UI cannot reliably control profile or chapter subset until a single typed request model is defined.
3. **Files:** Create: dev-docs/plans/plan-039-manuscript-export-ui/stage-001-audit-export-stack/phase-002-define-target-contract/part-001-define-manuscript-export-contract/evidence/target-contract-2026-06-01.md. Update: dev-docs/plans/plan-039-manuscript-export-ui/plan.md.
4. **Changes:** Define a typed request shape, preferably `ManuscriptExportRequest`, that composes format, export options, compile options, and delivery intent., Define default behavior for missing title, missing author, no chapters, empty selected chapters, and backup ZIP format., Define whether backup ZIP is kept in the manuscript export dialog or moved to a separate portability action., Define delivery policy: web download first, desktop save only when the shell surface is implemented and safe., Define non-negotiable acceptance criteria for stages 002 through 006.
5. **UI/UX:** Contract must map directly to controls: format toggle, profile selector, metadata fields, chapter selector, front/back matter toggles., Contract must include disabled-state rules for invalid combinations.
6. **Data:** Prefer no database migration in this plan., If settings persistence is updated, document exact repository and storage behavior before implementation.
7. **Errors:** Define a normalized error model for UI display: validation error, export generation error, delivery error, user cancel., Cancel must not be displayed as a failure.
8. **Tests:** Contract evidence must name test categories that later parts must implement.
9. **Criteria:** Target contract evidence file exists and contains final request shape., No unresolved format/profile/chapter-selection decision remains before stage 002 starts., `plan.md` updated with final stages and assumptions.
10. **Out-of-scope:** Do not implement the contract in code yet., Do not add schema migrations unless the contract proves they are required.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-inventory-export-contracts, part-002-inventory-ui-and-delivery-surfaces.
