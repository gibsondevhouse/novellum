---
title: Update export service contract
slug: part-002-update-export-service-contract
part_number: 2
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-003-profile-format-wiring
phase: phase-002-format-toggle-and-service-contract
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.35d
dependencies: ["part-001-define-manuscript-export-contract", "part-001-wire-format-toggle", "part-002-wire-metadata-fields"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 002 — Update export service contract

## Objective

Update export service APIs so UI-provided profile, metadata, chapter subset, and front/back matter values reach `assembleManuscript()`.

## Problem

The service currently builds `ManuscriptCompileOptions` internally and hardcodes key values. This blocks every meaningful UI control except format and a few presentation options.

## Files

**Create:**

- `src/modules/export/services/export-service.test.ts`

**Update:**

- `src/modules/export/types.ts`
- `src/modules/export/services/export-service.ts`
- `src/modules/export/index.ts`

## Required Changes

- Introduce `ManuscriptExportRequest` or equivalent typed request.
- Keep backward compatibility with existing `exportProject(projectId, options)` call if current callers depend on it, or update all callers in the same part.
- Pass profile ID, metadata, selected chapter IDs, and front/back matter to `assembleManuscript()`.
- Preserve current driver dispatch for Markdown, DOCX, EPUB, and Backup ZIP.
- Centralize safe filename construction and extension behavior.

## UI/UX Requirements

- Service errors must be safe to display after mapping in the UI.
- No UI layout changes beyond compile error fixes.

## Data Requirements

- No database migration.
- Generated blobs remain in memory only until delivery.

## Error Handling Requirements

- Throw typed or normalized errors for missing project, unsupported format, and driver failure.
- Do not throw on user cancel; cancel is a delivery state handled outside generation.

## Tests

- Markdown export receives requested metadata/profile.
- Selected chapter IDs are passed to assembler.
- Unsupported format still rejects.
- Filename sanitization is deterministic.

## Acceptance Criteria

- [x] UI request can fully control compile options.
- [x] Existing format driver behavior remains intact.
- [x] Unit tests cover contract changes.
- [x] Type exports updated for downstream imports.

## Out of Scope

- Do not change DOCX/EPUB internals except for compile-request compatibility.
- Do not persist export history.

## Dependencies

- part-001-define-manuscript-export-contract
- part-001-wire-format-toggle
- part-002-wire-metadata-fields

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Update export service APIs so UI-provided profile, metadata, chapter subset, and front/back matter values reach `assembleManuscript()`.
2. **Problem:** The service currently builds `ManuscriptCompileOptions` internally and hardcodes key values. This blocks every meaningful UI control except format and a few presentation options.
3. **Files:** Create: src/modules/export/services/export-service.test.ts. Update: src/modules/export/types.ts, src/modules/export/services/export-service.ts, src/modules/export/index.ts.
4. **Changes:** Introduce `ManuscriptExportRequest` or equivalent typed request., Keep backward compatibility with existing `exportProject(projectId, options)` call if current callers depend on it, or update all callers in the same part., Pass profile ID, metadata, selected chapter IDs, and front/back matter to `assembleManuscript()`., Preserve current driver dispatch for Markdown, DOCX, EPUB, and Backup ZIP., Centralize safe filename construction and extension behavior.
5. **UI/UX:** Service errors must be safe to display after mapping in the UI., No UI layout changes beyond compile error fixes.
6. **Data:** No database migration., Generated blobs remain in memory only until delivery.
7. **Errors:** Throw typed or normalized errors for missing project, unsupported format, and driver failure., Do not throw on user cancel; cancel is a delivery state handled outside generation.
8. **Tests:** Markdown export receives requested metadata/profile., Selected chapter IDs are passed to assembler., Unsupported format still rejects., Filename sanitization is deterministic.
9. **Criteria:** UI request can fully control compile options., Existing format driver behavior remains intact., Unit tests cover contract changes., Type exports updated for downstream imports.
10. **Out-of-scope:** Do not change DOCX/EPUB internals except for compile-request compatibility., Do not persist export history.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-define-manuscript-export-contract, part-001-wire-format-toggle, part-002-wire-metadata-fields.
