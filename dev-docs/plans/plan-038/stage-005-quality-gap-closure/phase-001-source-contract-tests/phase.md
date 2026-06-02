---
title: Source-Contract Tests
slug: phase-001-source-contract-tests
phase_number: 1
status: complete
owner: Backend Agent
stage: stage-005-quality-gap-closure
parts:
  - part-001-checkpoint-card-contract
  - part-002-build-scene-draft-context
estimated_duration: 1d
---

## Goal

Add two missing test suites that lock critical behavior: the checkpoint card's
write-to-manuscript guardrails and the scene-draft context builder's non-trivial
assembly logic.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [CheckpointCard Source-Contract Test](part-001-checkpoint-card-contract/part.md) | `draft` | Backend Agent | 0.5d |
| 002 | [buildSceneDraftContext Unit Test](part-002-build-scene-draft-context/part.md) | `draft` | Backend Agent | 0.5d |

## Acceptance Criteria

- [ ] `tests/nova/checkpoint-card.contract.test.ts` exists, with assertions locking the 4
  behavioral contracts of `NovaAuthorDraftCheckpointCard`.
- [ ] `tests/ai/pipeline/author-draft-context.test.ts` exists, with in-memory SQLite
  covering targetWordCount, priorSceneSummary, canon refs, and metadata key aliasing.
- [ ] Both test files pass in `pnpm test`.
