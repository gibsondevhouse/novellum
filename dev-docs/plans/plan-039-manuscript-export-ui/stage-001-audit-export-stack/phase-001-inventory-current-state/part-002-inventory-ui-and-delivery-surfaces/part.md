---
title: Inventory export UI and delivery surfaces
slug: part-002-inventory-ui-and-delivery-surfaces
part_number: 2
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-001-audit-export-stack
phase: phase-001-inventory-current-state
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.1d
dependencies: ["part-001-inventory-export-contracts"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 002 — Inventory export UI and delivery surfaces

## Objective

Determine what UI and file-delivery infrastructure already exists so the manuscript export UI can reuse or split it cleanly.

## Problem

The repo already exports an `ExportModal`, but that modal is JSON portability oriented. Reusing it blindly would mix manuscript export, backup export, copy JSON, and desktop save concerns in one overloaded component.

## Files

**Create:**

- `dev-docs/plans/plan-039-manuscript-export-ui/stage-001-audit-export-stack/phase-001-inventory-current-state/part-002-inventory-ui-and-delivery-surfaces/evidence/export-ui-inventory-2026-06-01.md`

**Update:**

- None.

## Required Changes

- Document current `src/modules/export/components/ExportModal.svelte` behavior.
- Document current browser download helper behavior.
- Document `src/lib/desktop` capability surface for `pickSaveLocation()` and web fallback.
- Document that Tauri capability methods are placeholders until shell wiring exists.
- Recommend whether manuscript export gets a new dialog or a refactor of the existing modal.

## UI/UX Requirements

- Inventory must identify current modal layout, feedback states, buttons, and accessibility hooks.
- Recommendation must preserve JSON portability flow unless this plan explicitly splits it.

## Data Requirements

- No schema changes.
- No settings migration.

## Error Handling Requirements

- Inventory must identify cancel, clipboard failure, download failure, and desktop placeholder failure behavior.

## Tests

- No tests required.
- Evidence must include a before-state component summary.

## Acceptance Criteria

- [x] Evidence file identifies whether `ExportModal.svelte` should be split or expanded.
- [x] Evidence file identifies web and desktop delivery constraints.
- [x] Evidence file lists UI state names already used by the modal.

## Out of Scope

- Do not change UI code.
- Do not wire desktop plugins in this part.

## Dependencies

- part-001-inventory-export-contracts

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Determine what UI and file-delivery infrastructure already exists so the manuscript export UI can reuse or split it cleanly.
2. **Problem:** The repo already exports an `ExportModal`, but that modal is JSON portability oriented. Reusing it blindly would mix manuscript export, backup export, copy JSON, and desktop save concerns in one overloaded component.
3. **Files:** Create: dev-docs/plans/plan-039-manuscript-export-ui/stage-001-audit-export-stack/phase-001-inventory-current-state/part-002-inventory-ui-and-delivery-surfaces/evidence/export-ui-inventory-2026-06-01.md. Update: None.
4. **Changes:** Document current `src/modules/export/components/ExportModal.svelte` behavior., Document current browser download helper behavior., Document `src/lib/desktop` capability surface for `pickSaveLocation()` and web fallback., Document that Tauri capability methods are placeholders until shell wiring exists., Recommend whether manuscript export gets a new dialog or a refactor of the existing modal.
5. **UI/UX:** Inventory must identify current modal layout, feedback states, buttons, and accessibility hooks., Recommendation must preserve JSON portability flow unless this plan explicitly splits it.
6. **Data:** No schema changes., No settings migration.
7. **Errors:** Inventory must identify cancel, clipboard failure, download failure, and desktop placeholder failure behavior.
8. **Tests:** No tests required., Evidence must include a before-state component summary.
9. **Criteria:** Evidence file identifies whether `ExportModal.svelte` should be split or expanded., Evidence file identifies web and desktop delivery constraints., Evidence file lists UI state names already used by the modal.
10. **Out-of-scope:** Do not change UI code., Do not wire desktop plugins in this part.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-inventory-export-contracts.
