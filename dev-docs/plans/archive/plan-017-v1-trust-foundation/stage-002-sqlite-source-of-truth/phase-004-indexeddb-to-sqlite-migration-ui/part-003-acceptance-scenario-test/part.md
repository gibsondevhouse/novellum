---
title: Acceptance Scenario Test
slug: part-003-acceptance-scenario-test
part_number: 3
status: complete
owner: reviewer
assigned_to: reviewer
phase: phase-004-indexeddb-to-sqlite-migration-ui
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Implement the stage-002 acceptance scenario as a Vitest test that proves the close → reopen guarantee for a fully-populated project, with no Dexie reads on the V1 runtime path.

## Scope

**In scope:**

- New test: `tests/sqlite/stage-002-acceptance.test.ts` that:
  1. Creates a project and writes through `/api/db/*` routes (no Dexie).
  2. Adds 1 arc, 1 act, 1 chapter, 1 scene with ~1k words.
  3. Adds 1 character, 1 location, 1 lore entry, 1 writing style, 1 system prompt.
  4. Closes and re-opens the SQLite connection.
  5. Reads everything back and asserts every field is preserved.
- Documentation: append the scenario result to `dev-docs/plans/plan-017-v1-trust-foundation/stage-002-sqlite-source-of-truth/IMPLEMENTATION-LOG.md`.

**Out of scope:**

- Visual / E2E runs — covered by Playwright suites independently.

## Implementation Steps

1. Use the existing in-memory better-sqlite3 test harness.
2. Build seed payloads using helpers from existing repository tests.
3. Run the scenario, close the connection (`db.close()`), reopen, query.
4. Assert deep equality on the read-back payloads.
5. Wire up an implementation log entry.

## Files

**Create:**

- `tests/sqlite/stage-002-acceptance.test.ts`
- `dev-docs/plans/plan-017-v1-trust-foundation/stage-002-sqlite-source-of-truth/IMPLEMENTATION-LOG.md`

## Acceptance Criteria

- [ ] Test passes locally and in CI.
- [ ] Test does **not** import `$lib/legacy/dexie/*`.
- [ ] Implementation log entry captures pass status, run date, and any deviations.

## Edge Cases

- Better-sqlite3 file vs in-memory mode — test in both to ensure persistence.
- Long text (1k words) round-trip — confirm no truncation.

## Notes

- This is the gate that closes stage-002. Once green, mark the stage `complete` and update the plan.
