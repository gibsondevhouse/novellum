---
title: App Data Path
slug: stage-006-app-data-path
stage_number: 6
status: complete
owner: Planner Agent
plan: plan-017-v1-trust-foundation
phases:
  - phase-001-db-path-resolver
  - phase-002-app-data-directory-resolver
  - phase-003-storage-location-readout
estimated_duration: 2d
risk_level: low
---

## Goal

Resolve the SQLite database path and backup folder to predictable, OS-conventional app-data directories in desktop mode while preserving dev/test behavior.

## Phases

> Suggested decomposition:
>
> - phase-001-db-path-resolver
> - phase-002-app-data-directory-resolver
> - phase-003-storage-settings-readout

## Entry Criteria

- Stage 002 complete (SQLite is canonical).
- Packaging mode detection scaffold available (or stubbed) from Stage 008's first part.

## Exit Criteria

- `src/lib/server/db/path.ts` returns:
  - dev: `./novellum.db` (preserved).
  - test: in-memory or temp-dir path.
  - desktop: OS-conventional location:
    - macOS: `~/Library/Application Support/Novellum/novellum.db`
    - Windows: `%APPDATA%/Novellum/novellum.db`
    - Linux: `~/.local/share/Novellum/novellum.db`
- `src/lib/server/app-data/path.ts` resolves the broader app-data directory (DB, backups, logs).
- `src/lib/server/db/client.ts` no longer references `process.env.NOVELLUM_DB_PATH ?? './novellum.db'` directly; it delegates to the resolver.
- `GET /api/settings/storage-location` returns current DB path, backup folder, and free-space estimate.
- Tests pass:
  - `tests/db/db-path.test.ts` — resolver behavior across dev/test/desktop.
  - `tests/db/app-data-path.test.ts` — directory creation and permission handling.
- `.env.example` retains `NOVELLUM_DB_PATH` only for dev/test override.

## Notes

- Source: [market-readiness-pt1.md §8](../../research/market-readiness-pt1.md).
- Settings UI ("Storage" section, open-folder button, change-backup-folder, reset-data) is built in plan-018 stage-004; this stage only ships the API and resolver.
