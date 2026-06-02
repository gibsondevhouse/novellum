---
part: part-001-runner-and-card
last_updated: 2026-06-01
---

# Implementation Checklist

## Pre-Implementation

- [x] Parent phase and stage are `in-progress`
- [x] All declared dependencies are `complete`
- [x] `part.md` has been reviewed and accepted
- [x] Dev environment is ready

## Implementation

- [x] `NovaAuthorDraftEngine.svelte` created
- [x] `NovaAuthorDraftCheckpointCard.svelte` created with explicit-accept-only guardrail
- [x] `author-draft-context.ts` created with `buildSceneDraftContext`
- [x] `scene-content.ts` event dispatch + `EditorShell.svelte` listener wired
- [x] Stale-target detection wired in card

## Post-Implementation

- [x] Lint passes with zero errors
- [x] Type-check passes with zero errors
- [x] Tests pass
- [x] At least one artifact added to `evidence/`
- [x] `impl.log.md` updated with final entry
- [x] Part `status` updated to `complete`
