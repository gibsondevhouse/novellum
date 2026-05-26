---
title: SaveStatus and Snapshot UI
slug: phase-003-save-status-and-snapshot-ui
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-007-autosave-and-recovery
parts:
  - part-001-save-status-component
  - part-002-snapshot-history-and-preview
estimated_duration: 1d
---

## Goal

Surface the structured `AutosaveResult` and snapshot metadata to the
author through Svelte 5 components: a small inline `SaveStatus`
indicator with a tooltip-grade error message, a richer
`SnapshotHistoryPanel` that lists snapshots with their source/word
count, and a `SnapshotPreviewModal` that previews + restores via the
phase-002 restore endpoint.

## Parts

| #   | Part                                                                            | Status        | Assigned To | Est. Duration |
| --- | ------------------------------------------------------------------------------- | ------------- | ----------- | ------------- |
| 001 | [SaveStatus Component](part-001-save-status-component/part.md)                  | `in-progress` | stylist     | 0.5d          |
| 002 | [Snapshot History and Preview](part-002-snapshot-history-and-preview/part.md)   | `not-started` | stylist     | 0.5d          |

## Acceptance Criteria

- [ ] `src/modules/editor/components/SaveStatus.svelte` renders the
      five `AutosaveResult` shapes (Idle, Saving, Saved with a
      relative timestamp, Failed with error, Retrying).
- [ ] `src/modules/editor/components/SnapshotHistoryPanel.svelte`
      lists snapshots newest-first with source badge + word count and
      opens the preview modal on row click.
- [ ] `src/modules/editor/components/SnapshotPreviewModal.svelte`
      diffs the snapshot against the current text and restores via
      `restoreSnapshot()`, applying the returned text through
      autosave.
- [ ] Editor route uses `SaveStatus` instead of the inline span.
- [ ] All three components use Svelte 5 Runes (`$props`, `$state`,
      `$derived`).
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Source: [market-readiness-pt1.md §10](../../../research/market-readiness-pt1.md).
- VersionHistoryPanel stays in place — it remains the legacy entry
  point for now and the new SnapshotHistoryPanel ships alongside it.
  Editor-shell decomposition that promotes SnapshotHistoryPanel to
  the canonical surface lives in plan-018 stage-002.
