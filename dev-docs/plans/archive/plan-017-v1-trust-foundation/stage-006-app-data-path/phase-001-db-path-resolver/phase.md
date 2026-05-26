---
title: Database Path Resolver
slug: phase-001-db-path-resolver
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-006-app-data-path
parts:
  - part-001-db-path-resolver
estimated_duration: 0.5d
---

## Goal

Move the SQLite database path decision out of `client.ts` and into a
dedicated, mode-aware resolver. Dev keeps `./novellum.db`; test gets an
in-memory or temp-dir path; production/desktop gets the OS-conventional
application data location.

## Parts

| #   | Part                                                                | Status        | Assigned To | Est. Duration |
| --- | ------------------------------------------------------------------- | ------------- | ----------- | ------------- |
| 001 | [DB Path Resolver](part-001-db-path-resolver/part.md)               | `in-progress` | backend     | 0.5d          |

## Acceptance Criteria

- [ ] `src/lib/server/db/path.ts` exposes `resolveDatabasePath()` with
      dev / test / desktop modes.
- [ ] `src/lib/server/db/client.ts` no longer reads
      `process.env.NOVELLUM_DB_PATH` directly; it delegates to the
      resolver.
- [ ] `tests/db/db-path.test.ts` covers all three modes plus the
      `NOVELLUM_DB_PATH` override and `:memory:` fallthrough.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Desktop mode detection is gated by `NOVELLUM_PACKAGING_MODE === 'desktop'`
  (or `NODE_ENV === 'production'` as a soft fallback) until stage-008
  ships its mode-detection scaffold.
