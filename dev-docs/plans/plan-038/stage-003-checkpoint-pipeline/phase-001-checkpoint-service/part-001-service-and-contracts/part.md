---
title: Author Draft Checkpoint Service & Contracts
slug: part-001-service-and-contracts
part_number: 1
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-checkpoint-service
started_at: 2026-06-01
completed_at: 2026-06-01
estimated_duration: 1d
---

## Objective

Implement the Author Draft Checkpoint persistence layer using `project_metadata` as storage,
with full lifecycle management and a stale-guard to prevent silent overwrites.

## Scope

**Created:**

- `src/lib/ai/pipeline/author-draft-contract.ts`
- `src/lib/ai/pipeline/author-draft-checkpoint-service.ts`
- `tests/ai/pipeline/author-draft-checkpoint-service.test.ts`

## Acceptance Criteria

- [x] Zod schemas for artifact and checkpoint validated.
- [x] `createCheckpoint`, `acceptCheckpoint`, `rejectCheckpoint`, `listCheckpoints` work.
- [x] Accept writes HTML prose to `scenes.content` and `wordCount` to `scenes.wordCount`.
- [x] Stale guard detects concurrent edits; `forceOverwrite` bypasses.
- [x] Injectable test factory — all tests use in-memory SQLite.

## Notes

Verified by code inspection and test run on 2026-06-01.
