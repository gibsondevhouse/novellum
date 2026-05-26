---
title: Autosave and Recovery
slug: stage-007-autosave-and-recovery
stage_number: 7
status: complete
owner: Planner Agent
plan: plan-017-v1-trust-foundation
phases:
  - phase-001-autosave-result-types-and-retry
  - phase-002-snapshot-repository-metadata
  - phase-003-save-status-and-snapshot-ui
  - phase-004-recovery-service-and-pull-the-plug-test
estimated_duration: 4d
risk_level: medium
---

## Goal

Turn autosave from an invisible debounce into a user-visible trust system: structured save status, retry on failure, snapshot history with restore, and a crash-recovery prompt that prevents silent text loss.

## Phases

> Suggested decomposition:
>
> - phase-001-autosave-result-types-and-retry
> - phase-002-snapshot-repository-metadata
> - phase-003-save-status-and-snapshot-ui
> - phase-004-recovery-service-and-pull-the-plug-test

## Entry Criteria

- Stage 002 complete (scenes/snapshots in SQLite).
- Stage 003 complete (versioned migrations support snapshot metadata fields).

## Exit Criteria

- `src/modules/editor/services/autosave-service.ts` returns structured `{status, savedAt, error?, pendingDraft?}` and retains pending text on failure with a bounded retry policy.
- `src/modules/editor/services/snapshot-repository.ts` stores `{wordCount, label, source, reason}` per snapshot and supports list/restore.
- New components (Svelte 5 Runes) ship and are wired into the editor route:
  - `src/modules/editor/components/SaveStatus.svelte` — Idle/Saving/Saved/Failed with last-saved timestamp.
  - `src/modules/editor/components/SnapshotHistoryPanel.svelte`
  - `src/modules/editor/components/SnapshotPreviewModal.svelte`
- `src/modules/editor/services/recovery-service.ts` detects unflushed pending drafts on app launch and offers a recovery prompt.
- Snapshot list endpoint returns newest-first; restore endpoint creates a "pre-restore" snapshot before overwriting.
- Near-duplicate snapshot suppression prevents runaway snapshot growth during continuous writing.
- Tests pass:
  - `tests/editor/autosave-failure.test.ts` — failed save preserves pending text.
  - `tests/editor/snapshot-restore.test.ts` — restore round-trips content and creates a pre-restore snapshot.
  - `tests/editor/recovery-prompt.test.ts` — pending draft detection and prompt behavior.
- "Pull-the-plug" acceptance scenario passes manually: write paragraph → kill app → reopen → either text saved or recovery prompt offered.

## Notes

- Source: [market-readiness-pt1.md §10](../../research/market-readiness-pt1.md).
- Editor route decomposition (`EditorShell`, `EditorTopBar`, modes) is plan-018 stage-002; this stage adds the components but does not refactor the route.
- Keep the existing 20-snapshot cap; tighten if performance evidence requires it.
