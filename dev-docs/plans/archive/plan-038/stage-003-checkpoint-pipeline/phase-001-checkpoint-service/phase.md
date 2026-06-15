---
title: Checkpoint Service & Contracts
slug: phase-001-checkpoint-service
phase_number: 1
status: complete
owner: Backend Agent
stage: stage-003-checkpoint-pipeline
parts:
  - part-001-service-and-contracts
estimated_duration: 1d
---

## Goal

Implement the `AuthorDraftCheckpoint` contract schemas, the injectable `createAuthorDraftCheckpointService`
factory, and the default singleton, covering create / list / accept / reject / stale-guard.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Service & Contracts](part-001-service-and-contracts/part.md) | `complete` | Backend Agent | 1d |

## Acceptance Criteria

- [x] `authorDraftArtifactSchema` and `authorDraftCheckpointSchema` defined with Zod.
- [x] Lifecycle values: `draft | review | accepted | rejected`.
- [x] `createCheckpoint` stores in `project_metadata` (scope=pipeline, ownerId=authorDraftCheckpoints.v1).
- [x] `acceptCheckpoint` writes `proseToSceneHtml(prose)` + computed `wordCount` to `scenes`.
- [x] Stale-guard: compares `baseSceneContentHash` (SHA-256) against current DB content hash.
- [x] `forceOverwrite` bypasses stale guard when user explicitly confirms.
- [x] Regeneration supersedes prior active checkpoint (marks it rejected with reason "Superseded by regeneration").
- [x] Injectable service factory (`createAuthorDraftCheckpointService(db)`) for testing.
- [x] All tests in `tests/ai/pipeline/author-draft-checkpoint-service.test.ts` pass.

## Notes

Completed by Codex on 2026-06-01. Test coverage includes: contract validation, create,
accept (idempotent), reject, stale-guard, force-overwrite, regeneration supersession.
