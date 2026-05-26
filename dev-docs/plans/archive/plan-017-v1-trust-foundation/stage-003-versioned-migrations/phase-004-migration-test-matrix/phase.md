---
title: Migration Test Matrix
slug: phase-004-migration-test-matrix
phase_number: 4
status: draft
owner: Planner Agent
stage: stage-003-versioned-migrations
parts:
  - part-001-from-empty
  - part-002-from-v1
  - part-003-idempotent
estimated_duration: 0.75d
---

## Goal

Lock the migration runner and registry behind a deterministic test matrix that proves correctness on fresh DBs, legacy v1 DBs, and re-runs.

## Parts

| #   | Part                                                | Status  | Assigned To | Est. Duration |
| --- | --------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [from-empty](part-001-from-empty/part.md)           | `draft` | reviewer    | 0.25d         |
| 002 | [from-v1](part-002-from-v1/part.md)                 | `draft` | reviewer    | 0.25d         |
| 003 | [idempotent](part-003-idempotent/part.md)           | `draft` | reviewer    | 0.25d         |

## Acceptance Criteria

- [ ] All three test files exist under `tests/sqlite/migrations/` and pass.
- [ ] Coverage of `migration-runner.ts` and `migrations/*.ts` ≥ 80% lines.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Use in-memory `better-sqlite3` (`:memory:`) where possible. For snapshot tests use a `tmpdir` path.
