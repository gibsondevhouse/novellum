---
title: Runner & Card Components
slug: part-001-runner-and-card
part_number: 1
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-001-runner-engine
started_at: 2026-06-01
completed_at: 2026-06-01
estimated_duration: 1d
---

## Objective

Implement the two Nova components that drive the author-draft pipeline from the user's
perspective: the chapter-level runner and the per-scene review card.

## Scope

**Created:**

- `src/modules/nova/components/NovaAuthorDraftEngine.svelte`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `src/lib/events/scene-content.ts` (`dispatchSceneContentApplied`)
- `src/lib/ai/pipeline/author-draft-context.ts` (`buildSceneDraftContext`)

## Acceptance Criteria

- [x] Chapter runner iterates ordered scenes and calls `generateSceneDraftCheckpoint` per scene.
- [x] Cancellation via `AbortSignal` stops at next scene boundary.
- [x] Progress indicator present (`activeIndex / orderedScenes.length`).
- [x] Review card: read-only prose preview.
- [x] Accept: shows confirmation when `scenes.content` exists.
- [x] Accept: stale-target flow shows force-overwrite confirmation.
- [x] `dispatchSceneContentApplied` fired after successful accept; `EditorShell.svelte` listens.
- [x] `editorDirty` store checked — warns on conflict before allowing overwrite.

## Known Gaps

- `activeIndex` advances for skipped scenes (existing checkpoint + `!regenerateExisting`),
  which can briefly display the skipped scene name in the progress indicator. A `generatedCount`
  counter would fix this — tracked in stage-005.
- No source-contract test asserting the component's dangerous behavior contracts. Tracked in stage-005.
- `unresolvedThreads` in `buildSceneDraftContext` always `[]`. Tracked in stage-005.
