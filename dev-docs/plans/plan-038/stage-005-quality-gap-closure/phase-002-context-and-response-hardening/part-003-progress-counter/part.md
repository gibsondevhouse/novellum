---
title: Fix Progress Counter for Skipped Scenes
slug: part-003-progress-counter
part_number: 3
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-context-and-response-hardening
started_at: ~
completed_at: ~
estimated_duration: 0.15d
---

## Objective

Fix the progress indicator in `NovaAuthorDraftEngine.svelte` so it shows the count
of scenes actually generated (not iterated), preventing momentary display of skipped
scene names.

## Scope

**Update:**

- `src/modules/nova/components/NovaAuthorDraftEngine.svelte`

## Implementation Steps

1. Add a `let generatedCount = $state(0)` alongside `activeIndex`.
2. Inside the loop, increment `generatedCount` only after a successful
   `generateSceneDraftCheckpoint` call (not for skipped scenes).
3. Update the progress display from:
   ```
   ${activeIndex + 1} / ${orderedScenes.length}
   ```
   to:
   ```
   ${generatedCount} / ${orderedScenes.length - skippedCount}
   ```
   Or simply:
   ```
   Generating ${generatedCount + 1} of ${scenesToGenerate.length}…
   ```
   where `scenesToGenerate` is the pre-filtered list of scenes that will actually be generated.

The cleanest fix: pre-filter `orderedScenes` into `scenesToGenerate` at the start of
`runChapterDraft()` (excluding scenes with existing active checkpoints when
`!regenerateExisting`), then iterate over `scenesToGenerate` with a simple index.

## Acceptance Criteria

- [ ] Progress display never shows a skipped scene's name.
- [ ] Counter reflects `generatedCount / total to generate`, not raw iteration index.
- [ ] Existing cancellation (AbortSignal) behavior unchanged.
- [ ] `pnpm check` — 0 errors.
