---
title: Autosave & Version History
slug: phase-002-autosave-and-version-history
phase_number: 2
status: complete
owner: Frontend Agent
stage: stage-005-drafting-editor-integration
parts:
  - part-001-autosave-service
  - part-002-version-history-ui
estimated_duration: 2d
---

## Goal

Implement debounced autosave of editor content back to Dexie, and a snapshot-based version history that stores up to 20 timestamped snapshots per scene and lets the user browse and restore any prior draft.

## Parts

| #   | Part                                                      | Status  |
| --- | --------------------------------------------------------- | ------- |
| 001 | [Autosave Service](part-001-autosave-service/part.md)     | `draft` |
| 002 | [Version History UI](part-002-version-history-ui/part.md) | `draft` |

## Entry Criteria

- phase-001 complete: editor content change events are observable from `src/modules/editor/`
- `SceneRepository.update()` method available and tested (plan-002)

## Exit Criteria

- Autosave fires 2 seconds after the last editor change event (debounced, not throttled)
- A "Saved ✓" / "Saving…" visual indicator updates accordingly
- On Tauri window close, an `onCloseRequested` hook flushes any pending save before the window closes
- `scene_snapshots` Dexie table exists: `{ id, sceneId, projectId, text, createdAt }`
- A snapshot is created on every autosave; oldest snapshot pruned when count exceeds 20
- Version history panel: accessible from editor toolbar; lists snapshots by time; clicking one shows a read-only diff vs. current text
- "Restore" button on any snapshot writes that text to `scene.text` and triggers autosave
- Vitest tests cover: debounce timing, 20-snapshot pruning logic, Tauri close-flush path (mocked)
