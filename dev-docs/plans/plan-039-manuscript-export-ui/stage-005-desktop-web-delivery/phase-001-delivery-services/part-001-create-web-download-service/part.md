---
title: Create web download service
slug: part-001-create-web-download-service
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-005-desktop-web-delivery
phase: phase-001-delivery-services
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.2d
dependencies: ["part-002-update-export-service-contract"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Create web download service

## Objective

Move browser blob download behavior into a reusable export delivery helper.

## Problem

The existing JSON modal contains an inline `downloadBlob()` helper. Manuscript export should not duplicate DOM-anchor logic in multiple components.

## Files

**Create:**

- `src/modules/export/services/export-delivery.ts`
- `src/modules/export/services/export-delivery.test.ts`

**Update:**

- `src/modules/export/components/ExportModal.svelte`
- `src/modules/export/index.ts`

## Required Changes

- Create `downloadBlobToBrowser(blob, filename)` or equivalent helper.
- Move URL/object-anchor download logic from modal to helper.
- Update existing JSON export modal to use helper if safe and low-risk.
- Ensure URL revocation happens in `finally` or immediately after click.
- Export delivery helper through module index if needed by components.

## UI/UX Requirements

- No visible UI changes expected.
- Existing JSON export success copy must still work.

## Data Requirements

- Generated blob stays in memory only.
- No file contents stored in database.

## Error Handling Requirements

- Handle DOM/browser failures by throwing a normalized delivery error.
- Do not swallow failed downloads silently.

## Tests

- Helper creates object URL and revokes it.
- Helper creates anchor with expected download filename.
- Existing modal behavior test updated if needed.

## Acceptance Criteria

- [x] No duplicated browser-download helper remains in manuscript export dialog.
- [x] Existing JSON export still downloads.
- [x] Delivery helper tests pass.

## Out of Scope

- Do not wire Tauri saving in this part.
- Do not change ZIP/JSON payload construction.

## Dependencies

- part-002-update-export-service-contract

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Move browser blob download behavior into a reusable export delivery helper.
2. **Problem:** The existing JSON modal contains an inline `downloadBlob()` helper. Manuscript export should not duplicate DOM-anchor logic in multiple components.
3. **Files:** Create: src/modules/export/services/export-delivery.ts, src/modules/export/services/export-delivery.test.ts. Update: src/modules/export/components/ExportModal.svelte, src/modules/export/index.ts.
4. **Changes:** Create `downloadBlobToBrowser(blob, filename)` or equivalent helper., Move URL/object-anchor download logic from modal to helper., Update existing JSON export modal to use helper if safe and low-risk., Ensure URL revocation happens in `finally` or immediately after click., Export delivery helper through module index if needed by components.
5. **UI/UX:** No visible UI changes expected., Existing JSON export success copy must still work.
6. **Data:** Generated blob stays in memory only., No file contents stored in database.
7. **Errors:** Handle DOM/browser failures by throwing a normalized delivery error., Do not swallow failed downloads silently.
8. **Tests:** Helper creates object URL and revokes it., Helper creates anchor with expected download filename., Existing modal behavior test updated if needed.
9. **Criteria:** No duplicated browser-download helper remains in manuscript export dialog., Existing JSON export still downloads., Delivery helper tests pass.
10. **Out-of-scope:** Do not wire Tauri saving in this part., Do not change ZIP/JSON payload construction.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-002-update-export-service-contract.
