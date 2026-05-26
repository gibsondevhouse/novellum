---
title: Dexie Freeze and Import Sweep
slug: phase-003-dexie-freeze-and-import-sweep
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-002-sqlite-source-of-truth
parts:
  - part-001-dexie-relocation
  - part-002-runtime-import-sweep
  - part-003-boundaries-rule-enforcement
estimated_duration: 1.5d
---

## Goal

Move all Dexie code under `src/lib/legacy/dexie/*`, rewrite all V1 runtime imports off `$lib/db/index` and `$lib/db/types`, and add an `eslint-plugin-boundaries` rule that prevents new V1 code from re-introducing Dexie.

## Parts

| #   | Part                                                                        | Status  | Assigned To | Est. Duration |
| --- | --------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Dexie Relocation](part-001-dexie-relocation/part.md)                       | `draft` | architect   | 0.5d          |
| 002 | [Runtime Import Sweep](part-002-runtime-import-sweep/part.md)               | `draft` | architect   | 0.5d          |
| 003 | [Boundaries Rule Enforcement](part-003-boundaries-rule-enforcement/part.md) | `draft` | reviewer    | 0.5d          |

## Acceptance Criteria

- [ ] `src/lib/db/index.ts` and `src/lib/db/db.ts` are removed; their content lives under `src/lib/legacy/dexie/*`.
- [ ] `grep -r "from '\$lib/db/index'" src/` and `grep -r "from '\$lib/db/db'" src/` return only matches under `src/lib/legacy/**` or migration files.
- [ ] All other consumers import from `$lib/db/domain-types` (types) or hit `/api/db/*` (data).
- [ ] `eslint-plugin-boundaries` denies imports of `src/lib/legacy/dexie/**` from any module other than `src/lib/legacy/**` and the IndexedDB→SQLite migration page.
- [ ] `pnpm run lint`, `pnpm run check`, and `pnpm run test` all pass.

## Notes

- The Dexie packages (`dexie`, `fake-indexeddb`) are **not** removed in this stage — restore-parity tests in stage-004 must run against them. Removal is deferred.
- The migration UI (phase-004) is the single legitimate consumer of `src/lib/legacy/dexie/*`.
