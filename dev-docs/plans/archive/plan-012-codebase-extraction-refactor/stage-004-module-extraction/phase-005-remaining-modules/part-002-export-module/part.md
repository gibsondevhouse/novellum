---
title: Export Module Extraction
slug: part-002-export-module
part_number: 2
status: review
owner: Architect
assigned_to: Architect
phase: phase-005-remaining-modules
started_at: 2025-07-17
completed_at: 2025-07-17
estimated_duration: 0.25d
---

## Objective

> Extract export module constants (format options, file extension maps, MIME types) into `src/modules/export/constants.ts` and update the barrel.

## Scope

**In scope:**

- Export format options (PDF, DOCX, ePub, `.novellum.zip`)
- File extension to MIME type mappings
- Default export settings constants

**Out of scope:**

- Export logic changes
- Portability/recovery logic

## Implementation Steps

1. Audit export module: `grep -rn "const.*=" src/modules/export/`
2. Create `src/modules/export/constants.ts` with format options and mappings
3. Update export components to import from constants
4. Update `src/modules/export/index.ts` barrel

## Files

**Create:**

- `src/modules/export/constants.ts`

**Update:**

- `src/modules/export/index.ts`
- Export components with inline constants

## Acceptance Criteria

- [ ] Export format constants in one file
- [ ] Zero inline format option arrays in export components
- [ ] `pnpm check` — 0 errors
