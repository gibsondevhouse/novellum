---
title: Export Modal Backup Mode
slug: part-002-export-modal-backup-mode
part_number: 2
status: draft
owner: frontend
assigned_to: frontend
phase: phase-001-zip-export-flow
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Extend the existing export UI to expose portability backup export as a first-class mode with clear V1 positioning and user guidance.

## Scope

**In scope:**

- Add backup format option to export modal format selector
- Add UX copy clarifying portability intent (for restoring in another browser)
- Trigger `backup_zip` branch in export service
- Preserve existing export options for markdown/docx/epub

**Out of scope:**

- Import UI and restore flow
- Archive parsing/validation internals

## Implementation Steps

1. Update `src/modules/export/components/ExportModal.svelte`:
   - add backup option to format tabs
   - show contextual helper text for backup mode
   - disable non-applicable typography controls in backup mode

2. Ensure `handleExport()` passes `format: 'backup_zip'` when selected

3. Update labels/button text:
   - from generic "Export" to context-aware text like "Export Backup ZIP" in backup mode

4. Verify existing modal behavior:
   - loading state
   - error state
   - close-on-success behavior

5. Optional extraction for readability if file exceeds UI complexity thresholds:
   - create `BackupExportHint.svelte`

## Files

**Create (optional):**

- `src/modules/export/components/BackupExportHint.svelte`

**Update:**

- `src/modules/export/components/ExportModal.svelte`
- `src/modules/export/types.ts`

## Acceptance Criteria

- [ ] Export modal shows Backup ZIP as selectable format
- [ ] Backup mode can trigger successful archive download
- [ ] Existing export formats still function unchanged
- [ ] Backup mode copy clearly states manual browser portability use case
- [ ] `pnpm run check` exits clean

## Edge Cases

- Backup selected before settings load
- User switches between backup and document formats repeatedly
- Export errors from snapshot/zip service are surfaced cleanly

## Notes

> Keep this UX additive, not disruptive. Existing document export workflows must remain unchanged for V1 users.
