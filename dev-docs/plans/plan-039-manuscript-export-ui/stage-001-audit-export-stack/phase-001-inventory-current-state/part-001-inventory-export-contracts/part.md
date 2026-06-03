---
title: Inventory export contracts and drivers
slug: part-001-inventory-export-contracts
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-001-audit-export-stack
phase: phase-001-inventory-current-state
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.15d
dependencies: []
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Inventory export contracts and drivers

## Objective

Create a source-grounded inventory of the current export module so later parts do not invent unsupported formats, settings, or APIs.

## Problem

The plan skeleton names export formats and profiles, but the UI must be based on the actual types and driver behavior in the repo. The current service already supports multiple formats, but the exact user-facing contract is incomplete.

## Files

**Create:**

- `dev-docs/plans/plan-039-manuscript-export-ui/stage-001-audit-export-stack/phase-001-inventory-current-state/part-001-inventory-export-contracts/evidence/export-contract-inventory-2026-06-01.md`

**Update:**

- `dev-docs/plans/plan-039-manuscript-export-ui/plan.md`

## Required Changes

- Document current `ExportFormat` values: `markdown`, `docx`, `epub`, `backup_zip`.
- Document current `ExportOptions` fields and identify which are presentation options versus compile options.
- Document current `ManuscriptProfileId` values and profile defaults.
- Document `exportProject()` return shape and driver dispatch rules.
- Document that `exportProject()` currently hardcodes `reader_copy`, author, front matter behavior, and omits selected chapters.

## UI/UX Requirements

- No UI changes in this part.
- Inventory must identify what UI controls are justified by existing services.

## Data Requirements

- No schema changes.
- Evidence must distinguish persistent export settings from one-run export inputs.

## Error Handling Requirements

- No runtime error handling changes.
- Inventory must list known error sources: missing project, unsupported format, failed blob creation.

## Tests

- No code tests required.
- Evidence must include inspected file paths and observed contract details.

## Acceptance Criteria

- [x] Evidence file lists supported formats and matching drivers.
- [x] Evidence file lists profile IDs, labels, and defaults.
- [x] Evidence file calls out `exportProject()` contract gaps before UI implementation starts.
- [x] `plan.md` source notes are updated if inventory changes the plan scope.

## Out of Scope

- Do not modify export code.
- Do not add new export formats.
- Do not rename existing APIs.

## Dependencies

- None.

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Create a source-grounded inventory of the current export module so later parts do not invent unsupported formats, settings, or APIs.
2. **Problem:** The plan skeleton names export formats and profiles, but the UI must be based on the actual types and driver behavior in the repo. The current service already supports multiple formats, but the exact user-facing contract is incomplete.
3. **Files:** Create: dev-docs/plans/plan-039-manuscript-export-ui/stage-001-audit-export-stack/phase-001-inventory-current-state/part-001-inventory-export-contracts/evidence/export-contract-inventory-2026-06-01.md. Update: dev-docs/plans/plan-039-manuscript-export-ui/plan.md.
4. **Changes:** Document current `ExportFormat` values: `markdown`, `docx`, `epub`, `backup_zip`., Document current `ExportOptions` fields and identify which are presentation options versus compile options., Document current `ManuscriptProfileId` values and profile defaults., Document `exportProject()` return shape and driver dispatch rules., Document that `exportProject()` currently hardcodes `reader_copy`, author, front matter behavior, and omits selected chapters.
5. **UI/UX:** No UI changes in this part., Inventory must identify what UI controls are justified by existing services.
6. **Data:** No schema changes., Evidence must distinguish persistent export settings from one-run export inputs.
7. **Errors:** No runtime error handling changes., Inventory must list known error sources: missing project, unsupported format, failed blob creation.
8. **Tests:** No code tests required., Evidence must include inspected file paths and observed contract details.
9. **Criteria:** Evidence file lists supported formats and matching drivers., Evidence file lists profile IDs, labels, and defaults., Evidence file calls out `exportProject()` contract gaps before UI implementation starts., `plan.md` source notes are updated if inventory changes the plan scope.
10. **Out-of-scope:** Do not modify export code., Do not add new export formats., Do not rename existing APIs.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: None.
