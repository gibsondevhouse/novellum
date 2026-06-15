---
title: Checkpoint + Apply Pipeline
slug: stage-003-checkpoint-pipeline
stage_number: 3
status: complete
owner: Backend Agent
plan: plan-038-novel-engine-v1
phases:
  - phase-001-checkpoint-service
  - phase-002-api-routes
estimated_duration: 2d
risk_level: medium
---

## Goal

Implement the Author Draft Checkpoint mechanism stored in `project_metadata`, with full
create / list / accept / reject lifecycle, where accept atomically writes HTML prose and
word count to `scenes.content` via a stale-guard hash check.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Checkpoint Service & Contracts](phase-001-checkpoint-service/phase.md) | `complete` | 1d |
| 002 | [API Routes](phase-002-api-routes/phase.md) | `complete` | 1d |

## Entry Criteria

- `project_metadata` table exists in the SQLite schema.
- `worldbuild-checkpoint-service.ts` exists as a reference pattern.

## Exit Criteria

- All phases complete.
- `createAuthorDraftCheckpoint`, `acceptAuthorDraftCheckpoint`, `rejectAuthorDraftCheckpoint`,
  `listAuthorDraftCheckpoints` are exported and tested.
- Accept atomically writes HTML prose + `wordCount` to `scenes` table.
- Stale-guard prevents overwrites of concurrently edited scenes.
- All checkpoint service tests pass.

## Notes

Completed by Codex during the initial plan-038 implementation pass. Verified by code
inspection and test suite on 2026-06-01.
