---
title: from-v1 Test
slug: part-002-from-v1
part_number: 2
status: complete
owner: reviewer
assigned_to: reviewer
phase: phase-004-migration-test-matrix
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Prove that a DB stuck at the historical v1 schema (only `0001_initial` applied) successfully rolls forward through 0002–0004.

## Scope

**In scope:**

- `tests/sqlite/migrations/from-v1.test.ts`.
- Helper that simulates a v1 DB by applying only the first migration manually (or by running the v1 SQL directly).

## Implementation Steps

1. Open `:memory:` DB; run only migration 0001.
2. Insert one project row to ensure data preservation.
3. Run full registry; assert subsequent migrations recorded; project row still present; new columns are present and contain their defaults.

## Acceptance Criteria

- [ ] Test passes.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
