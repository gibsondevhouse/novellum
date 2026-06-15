---
title: Spec manuscript export flow
slug: part-001-spec-export-flow
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-002-export-dialog-ui
phase: phase-001-ux-spec
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.2d
dependencies: ["part-001-define-manuscript-export-contract"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Spec manuscript export flow

## Objective

Write the implementation-ready UX spec for the manuscript export dialog.

## Problem

A modal with multiple export concerns can become brittle quickly. The flow needs one primary path, one visible validation layer, and a clear distinction between manuscript formats and backup/export portability.

## Files

**Create:**

- `dev-docs/plans/plan-039-manuscript-export-ui/stage-002-export-dialog-ui/phase-001-ux-spec/part-001-spec-export-flow/evidence/export-flow-spec-2026-06-01.md`

**Update:**

- None.

## Required Changes

- Define dialog sections: destination header, format, profile, metadata, chapter selection, advanced formatting, action footer.
- Define control order and keyboard tab order.
- Define primary action labels for each state.
- Define disabled and warning rules.
- Define whether Backup ZIP is hidden under Backup/Portability or kept as a separate card.

## UI/UX Requirements

- Use compact prose in UI labels.
- Use design tokens only.
- Support constrained side-panel widths and full-page desktop widths.
- Avoid tables in the UI; use cards, radio groups, segmented controls, and checklists.

## Data Requirements

- Spec must map each UI field to either `ExportOptions`, `ManuscriptCompileOptions`, or delivery state.

## Error Handling Requirements

- Spec must define inline validation for missing title, invalid filename, zero selected chapters, and export failure.

## Tests

- Spec must identify component test scenarios before UI implementation starts.

## Acceptance Criteria

- [x] UX spec includes control hierarchy and state model.
- [x] UX spec includes accessibility requirements.
- [x] UX spec includes mobile/constrained-width behavior.
- [x] UX spec resolves JSON portability coexistence.

## Out of Scope

- Do not write Svelte code.
- Do not modify service contracts.

## Dependencies

- part-001-define-manuscript-export-contract

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Write the implementation-ready UX spec for the manuscript export dialog.
2. **Problem:** A modal with multiple export concerns can become brittle quickly. The flow needs one primary path, one visible validation layer, and a clear distinction between manuscript formats and backup/export portability.
3. **Files:** Create: dev-docs/plans/plan-039-manuscript-export-ui/stage-002-export-dialog-ui/phase-001-ux-spec/part-001-spec-export-flow/evidence/export-flow-spec-2026-06-01.md. Update: None.
4. **Changes:** Define dialog sections: destination header, format, profile, metadata, chapter selection, advanced formatting, action footer., Define control order and keyboard tab order., Define primary action labels for each state., Define disabled and warning rules., Define whether Backup ZIP is hidden under Backup/Portability or kept as a separate card.
5. **UI/UX:** Use compact prose in UI labels., Use design tokens only., Support constrained side-panel widths and full-page desktop widths., Avoid tables in the UI; use cards, radio groups, segmented controls, and checklists.
6. **Data:** Spec must map each UI field to either `ExportOptions`, `ManuscriptCompileOptions`, or delivery state.
7. **Errors:** Spec must define inline validation for missing title, invalid filename, zero selected chapters, and export failure.
8. **Tests:** Spec must identify component test scenarios before UI implementation starts.
9. **Criteria:** UX spec includes control hierarchy and state model., UX spec includes accessibility requirements., UX spec includes mobile/constrained-width behavior., UX spec resolves JSON portability coexistence.
10. **Out-of-scope:** Do not write Svelte code., Do not modify service contracts.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-define-manuscript-export-contract.
