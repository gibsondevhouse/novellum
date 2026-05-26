---
title: Version History UI
slug: part-002-version-history-ui
part_number: 2
status: complete
owner: Frontend Agent
phase: phase-002-autosave-and-version-history
estimated_duration: 1d
---

## Objective

Build the version history panel in the editor. It lists all snapshots for the active scene sorted by time, allows the user to view a read-only diff between any snapshot and the current text, and provides a "Restore" button that writes the snapshot text back and triggers an immediate autosave.

## Context

- `scene_snapshots` Dexie table (from part-001-autosave-service)
- `src/modules/editor/components/DocumentEditorFrame.svelte` — needs `setContent()` API to restore a snapshot
- `editorStore.pendingText` and `autosaveService.flushNow()` from part-001

## Target Files

| File                                                           | Action                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------- |
| `src/modules/editor/components/VersionHistoryPanel.svelte`     | Create (≤150 lines)                                            |
| `src/modules/editor/services/snapshot-repository.ts`           | Create                                                         |
| `src/routes/(app)/projects/[id]/editor/[sceneId]/+page.svelte` | Update — add toggle button to open/close `VersionHistoryPanel` |

## VersionHistoryPanel UX

- Slide-in panel from the right side of the editor
- Each snapshot listed as: timestamp (relative, e.g. "3 minutes ago") + word count
- Click a snapshot row → show a read-only diff view (old text = snapshot, new text = current scene.text)
- Diff format: line-by-line additions/deletions highlighted in green/red (use a lightweight diff lib such as `diff` or `diff-match-patch`)
- "Restore" button below the diff → calls `restore(snapshot)`:
  1. `editorStore.setPendingText(snapshot.text)`
  2. `DocumentEditorFrame.setContent(snapshot.text)`
  3. `autosaveService.flushNow()` — writes immediately, creates a new snapshot

## snapshot-repository.ts API

```ts
listByScene(sceneId: string): Promise<SceneSnapshot[]>          // sorted DESC by createdAt
```

## Acceptance Criteria

- [ ] Version history panel opens/closes via a toolbar button in the editor
- [ ] All snapshots for the scene listed in reverse chronological order
- [ ] Clicking a snapshot shows a read-only diff vs. current text
- [ ] "Restore" button writes snapshot text, updates the editor, and saves to Dexie immediately
- [ ] Restoring creates a new snapshot (so the restore is itself undoable)
- [ ] Panel `VersionHistoryPanel.svelte` ≤150 lines
- [ ] `pnpm run check` exits clean; `pnpm run lint` exits clean
