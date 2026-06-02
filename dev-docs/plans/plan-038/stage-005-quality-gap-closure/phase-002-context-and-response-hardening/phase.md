---
title: Context & Response Hardening
slug: phase-002-context-and-response-hardening
phase_number: 2
status: draft
owner: Backend Agent
stage: stage-005-quality-gap-closure
parts:
  - part-001-unresolved-threads
  - part-002-strip-raw-output
  - part-003-progress-counter
  - part-004-draft-lifecycle
estimated_duration: 1d
---

## Goal

Four targeted fixes: populate `unresolvedThreads` from the DB, strip `rawOutput` from
the generate response, fix the progress counter for skipped scenes, and resolve the
`draft` lifecycle dead-code issue.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Populate unresolvedThreads](part-001-unresolved-threads/part.md) | `draft` | Backend Agent | 0.25d |
| 002 | [Strip rawOutput from Generate Response](part-002-strip-raw-output/part.md) | `draft` | Backend Agent | 0.1d |
| 003 | [Fix Progress Counter](part-003-progress-counter/part.md) | `draft` | Architect Agent | 0.15d |
| 004 | [Resolve draft Lifecycle Dead Code](part-004-draft-lifecycle/part.md) | `draft` | Backend Agent | 0.25d |

## Acceptance Criteria

- [ ] `buildSceneDraftContext` returns open plot threads from `plot_threads` table.
- [ ] `/api/author-draft/checkpoints/generate` response omits `rawOutput`.
- [ ] `NovaAuthorDraftEngine` progress shows `generatedCount / totalScenes` correctly.
- [ ] `draft` lifecycle value either removed from schema or assigned for pre-parse state.
- [ ] `pnpm check` — 0 errors. `pnpm test` — all pass.
