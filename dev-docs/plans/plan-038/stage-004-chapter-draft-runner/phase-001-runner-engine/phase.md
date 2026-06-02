---
title: Runner Engine & Review Card
slug: phase-001-runner-engine
phase_number: 1
status: complete
owner: Architect Agent
stage: stage-004-chapter-draft-runner
parts:
  - part-001-runner-and-card
estimated_duration: 1d
---

## Goal

Build `NovaAuthorDraftEngine.svelte` (chapter runner) and `NovaAuthorDraftCheckpointCard.svelte`
(per-scene review card with Accept / Reject / Regenerate).

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Runner & Card Components](part-001-runner-and-card/part.md) | `complete` | Architect Agent | 1d |

## Acceptance Criteria

- [x] `runChapterDraft()` iterates ordered scenes and calls generate per scene.
- [x] `AbortSignal` wires through; cancellation stops at next scene boundary.
- [x] Progress indicator shows current / total.
- [x] Skips scenes that already have a `review` checkpoint (unless `regenerateExisting`).
- [x] `NovaAuthorDraftCheckpointCard` shows generated prose in read-only preview.
- [x] Accept confirms when existing `scenes.content` exists.
- [x] Stale-target response shows force-overwrite confirmation.
- [x] `dispatchSceneContentApplied` called after successful accept.

## Notes

Completed by Codex on 2026-06-01.
