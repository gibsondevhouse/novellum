---
title: Transactional Restore and Confirmation
slug: part-002-transactional-restore-and-confirmation
part_number: 2
status: draft
owner: frontend
assigned_to: frontend
phase: phase-002-zip-import-flow
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Implement V1 restore UX and atomic data replacement semantics so users can safely import a backup into a new browser instance.

## Scope

**In scope:**

- Import dialog/flow with file picker, validation status, and preview
- Explicit confirmation gate before restore
- Transactional restore service (replace current state)
- Success/error feedback and post-import state refresh

**Out of scope:**

- Merge imports
- Background incremental restore

## Implementation Steps

1. Create `src/modules/export/services/portability/restore-service.ts`:
   - `restoreBackupSnapshot(parsedArchive)`
   - wraps all DB writes in a single Dexie transaction
   - clear existing tables, bulk insert imported rows
   - restore localStorage keys from snapshot payload

2. Create import UI component:
   - `src/modules/export/components/ImportBackupDialog.svelte`
   - file select
   - preview panel
   - confirm action with replace-state warning

3. Add entry point in dashboard/home surface:
   - update `src/routes/+page.svelte` to expose an "Import Backup" action

4. On successful restore:
   - close dialog
   - reload project list and route state
   - show non-intrusive success message

5. Add cancellation and error paths:
   - cancel import leaves state untouched
   - restore failure reports actionable message

## Files

**Create:**

- `src/modules/export/services/portability/restore-service.ts`
- `src/modules/export/components/ImportBackupDialog.svelte`

**Update:**

- `src/routes/+page.svelte` — add import entry action
- `src/modules/export/index.ts` — export import dialog and restore service

## Acceptance Criteria

- [ ] User can select a valid backup file and view preview
- [ ] Restore requires explicit confirmation and warns about replacement
- [ ] Restore writes are atomic and replace-only
- [ ] On failure, existing data remains intact
- [ ] Post-restore UI reflects imported dataset
- [ ] `pnpm run check` exits clean

## Edge Cases

- User imports archive with zero projects
- Restore interrupted by quota/storage error
- localStorage restore partially fails due browser restrictions

## Notes

> The destructive nature of replace-only restore must be explicit in UI copy and confirmation controls.
