---
title: Separate Backup from Export
slug: part-001-separate-backup-from-export
part_number: 1
status: complete
owner: stylist
assigned_to: stylist
phase: phase-005-export-modal-ia-split
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Restructure `ExportModal.svelte` so users see two top-level options: **Manuscript Export** and **Project Backup**. Backup must no longer be presented as a manuscript export format.

## Scope

**In scope:**

- `src/modules/export/components/ExportModal.svelte` (or its successor).
- New thin client service `src/modules/export/services/project-backup-client.ts` calling `POST /api/backup/projects/[id]`.

**Out of scope:**

- Manuscript Export implementation (plan-018).

## Implementation Steps

1. Add a tab/segmented-control to the modal: `Manuscript` | `Backup`.
2. The Backup tab triggers a `fetch('/api/backup/projects/<id>', { method: 'POST' })`, downloads the response as a file, and shows a result toast.
3. The Manuscript tab is a placeholder (plan-018 takes over) — keep existing manuscript code paths if any, but unmount the Backup-shaped UI that used to live there.
4. Add a "Restore from backup" entry that opens a separate flow: file picker → preview API → confirm modal → restore API.
5. Add component tests (Vitest + Testing Library) for the tab switch, backup-trigger happy path, and restore preview flow stub.

## Files

**Update:**

- `src/modules/export/components/ExportModal.svelte`
- `src/modules/export/services/export-service.ts`

**Create:**

- `src/modules/export/services/project-backup-client.ts`
- `tests/export/export-modal.test.ts`

## Acceptance Criteria

- [ ] Backup is no longer listed under manuscript export formats.
- [ ] All copy explicitly distinguishes "manuscript" from "project backup".
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Follow the design tokens in dev-docs/design-system.md; do not introduce new color/spacing primitives.
