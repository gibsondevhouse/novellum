---
title: Chapter Draft Runner
slug: stage-004-chapter-draft-runner
stage_number: 4
status: complete
owner: Architect Agent
plan: plan-038-novel-engine-v1
phases:
  - phase-001-runner-engine
estimated_duration: 1d
risk_level: medium
---

## Goal

Implement the in-Nova UI for driving chapter-level draft generation: a component that
iterates ordered scenes, calls the generate route per scene, supports cancellation via
`AbortSignal`, shows live progress, and a per-scene card with explicit Accept / Reject /
Regenerate actions.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Runner Engine & Review Card](phase-001-runner-engine/phase.md) | `complete` | 1d |

## Entry Criteria

- Stage-003 checkpoint pipeline routes are implemented and tested.
- `NovaAuthorDraftCheckpointCard.svelte` design is agreed on.

## Exit Criteria

- All phases complete.
- `NovaAuthorDraftEngine.svelte` can generate all scenes in a chapter sequentially.
- Cancellation stops generation cleanly at the next scene boundary.
- `NovaAuthorDraftCheckpointCard.svelte` shows draft text with Accept / Reject / Regenerate.
- Accept path shows confirmation when scene content already exists.
- Stale-target detection wired to force-overwrite confirmation.
- `dispatchSceneContentApplied` fires after successful accept.

## Notes

Completed by Codex on 2026-06-01. Minor gap: progress counter uses `activeIndex` which
advances for skipped scenes — tracked in stage-005 for a `generatedCount` fix.
