---
title: API Routes
slug: phase-002-api-routes
phase_number: 2
status: complete
owner: Backend Agent
stage: stage-003-checkpoint-pipeline
parts:
  - part-001-generate-accept-reject
estimated_duration: 1d
---

## Goal

Expose the author draft checkpoint lifecycle over HTTP: `GET /api/author-draft/checkpoints`,
`POST /api/author-draft/checkpoints/generate`, `POST /api/author-draft/checkpoints/accept`,
`POST /api/author-draft/checkpoints/reject`.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Generate / Accept / Reject Routes](part-001-generate-accept-reject/part.md) | `complete` | Backend Agent | 1d |

## Acceptance Criteria

- [x] `GET /api/author-draft/checkpoints?projectId=&sceneId=` returns list.
- [x] `POST /api/author-draft/checkpoints/generate` builds scene-draft context, calls AI
  provider with prose+sidecar format, parses output, persists checkpoint.
- [x] Generate route has 2-attempt repair loop for parse failures.
- [x] `persistGenerationFailure()` saves a rejected checkpoint on unrecoverable error.
- [x] `POST /api/author-draft/checkpoints/accept` calls `acceptCheckpoint` with `forceOverwrite` opt-in.
- [x] `POST /api/author-draft/checkpoints/reject` calls `rejectCheckpoint`.
- [x] `GET /api/db/author-draft/scene-draft-context?projectId=&sceneId=` returns `SceneDraftContext`.
- [x] Client wrappers in `src/modules/nova/services/author-draft-api.ts` cover all routes.

## Notes

Completed by Codex on 2026-06-01. Gap: generate response currently returns `rawOutput`
alongside `checkpoint` — tracked in stage-005 for removal.
