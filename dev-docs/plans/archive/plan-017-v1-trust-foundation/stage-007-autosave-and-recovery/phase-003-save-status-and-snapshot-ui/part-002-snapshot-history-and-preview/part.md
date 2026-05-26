---
title: Snapshot History and Preview
slug: part-002-snapshot-history-and-preview
part_number: 2
status: complete
owner: stylist
assigned_to: stylist
phase: phase-003-save-status-and-snapshot-ui
started_at: 2026-04-29
completed_at: 2026-04-29
estimated_duration: 0.5d
---

## Objective

Ship the new `SnapshotHistoryPanel` and `SnapshotPreviewModal` shells
that consume the metadata-rich snapshots and the restore endpoint.
Wire them in alongside the legacy `VersionHistoryPanel` — the legacy
panel stays put for plan-018 to retire.

## Files

**Create:**

- `src/modules/editor/components/SnapshotHistoryPanel.svelte`
- `src/modules/editor/components/SnapshotPreviewModal.svelte`
- `tests/editor/snapshot-history-panel.test.ts`

**Modify:**

- `src/modules/editor/index.ts`

## Acceptance Criteria

- [ ] `SnapshotHistoryPanel` lists snapshots newest-first, shows the
      source badge ("Autosave", "Manual", "Pre-restore",
      "Pre-migration") and word count.
- [ ] Row click opens the preview modal; Escape / backdrop click
      closes it.
- [ ] `SnapshotPreviewModal` shows a unified diff and a Restore
      button that calls `restoreSnapshot(id)` then applies the
      returned text via `editorState.pendingText` and `flushNow()`.
- [ ] Both components use Svelte 5 Runes only.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
