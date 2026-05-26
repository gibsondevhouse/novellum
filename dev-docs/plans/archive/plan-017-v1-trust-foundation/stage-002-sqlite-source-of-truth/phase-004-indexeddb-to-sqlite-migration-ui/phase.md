---
title: IndexedDB to SQLite Migration UI
slug: phase-004-indexeddb-to-sqlite-migration-ui
phase_number: 4
status: complete
owner: Planner Agent
stage: stage-002-sqlite-source-of-truth
parts:
  - part-001-migration-engine
  - part-002-migration-page
  - part-003-acceptance-scenario-test
estimated_duration: 1.5d
---

## Goal

Provide an idempotent, one-shot migration path that reads every project-owned table from the legacy Dexie/IndexedDB store and writes it to SQLite via `/api/db/*`, with a visible UI, evidence log, and a "migration complete" marker that prevents re-runs.

## Parts

| #   | Part                                                                           | Status  | Assigned To | Est. Duration |
| --- | ------------------------------------------------------------------------------ | ------- | ----------- | ------------- |
| 001 | [Migration Engine](part-001-migration-engine/part.md)                          | `draft` | backend     | 0.5d          |
| 002 | [Migration Page](part-002-migration-page/part.md)                              | `draft` | architect   | 0.5d          |
| 003 | [Acceptance Scenario Test](part-003-acceptance-scenario-test/part.md)          | `draft` | reviewer    | 0.5d          |

## Acceptance Criteria

- [ ] `/settings/migrate` page lists every project-owned table, runs migration on click, and displays per-table row counts (migrated / skipped / failed).
- [ ] Migration engine is idempotent — running twice does not duplicate rows; subsequent runs detect the `migration_complete` marker and short-circuit.
- [ ] Evidence log (downloadable JSON) records every row written, refused, or merged.
- [ ] Acceptance scenario passes: a Dexie-backed seed project survives migration intact (project + arc + act + chapter + scene + 1k-word draft + character + location + lore + style + prompt).
- [ ] `pnpm run test` includes the acceptance scenario.

## Notes

- This is the **only** V1 surface allowed to import `$lib/legacy/dexie/*` from a UI route, per the phase-003 boundaries rule.
- Migration cannot delete the Dexie database — restore-parity tests in stage-004 still need it.
