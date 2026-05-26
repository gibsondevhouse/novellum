---
title: App Data Directory Resolver
slug: phase-002-app-data-directory-resolver
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-006-app-data-path
parts:
  - part-001-app-data-directory-resolver
estimated_duration: 1d
---

## Goal

Build the active app-data directory resolver — DB, backups, logs,
credentials all resolve from a single mode-aware module — and refactor
the credential secure store to delegate to it instead of carrying its
own ad-hoc fallback.

## Parts

| #   | Part                                                                                | Status        | Assigned To | Est. Duration |
| --- | ----------------------------------------------------------------------------------- | ------------- | ----------- | ------------- |
| 001 | [App Data Directory Resolver](part-001-app-data-directory-resolver/part.md)         | `in-progress` | backend     | 1d            |

## Acceptance Criteria

- [ ] `src/lib/server/app-data/path.ts` exposes a mode-aware
      `resolveAppDataDir`, plus `resolveBackupDirectory`,
      `resolveLogDirectory`, and an idempotent
      `ensureAppDataDirectory` helper that creates the dir and applies
      0700 perms on POSIX.
- [ ] `src/lib/server/credentials/secure-store.ts` delegates its
      directory resolution to the new module instead of duplicating
      it.
- [ ] `tests/db/app-data-path.test.ts` covers each mode, the override,
      directory creation, and POSIX permission application.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
