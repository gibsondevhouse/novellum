---
phase: phase-007-trust-and-data
last_updated: 2026-05-11
---

# Implementation Checklist

## Pre-Implementation

- [x] Parent stage and plan are `in-progress`
- [x] Phase-001 triage identifies F3, F6, A1, A2 as in-scope
- [x] Architecture review: chose `/api/backup/all` (zip-of-zips
      via existing `buildProjectBackup`) over reviving the
      Dexie-side `buildBackupArchive`. Reason: SQLite is the
      canonical store; Dexie is legacy.

## Implementation

- [x] `src/routes/api/backup/all/+server.ts` created
- [x] `src/routes/settings/backup/+page.svelte` `createBackup()`
      flow added: POST → blob → download → preference write
- [x] `/settings/backup` Storage Location section wired to
      `/api/settings/storage-location`
- [x] `src/routes/settings/privacy/+page.svelte` rewritten with
      `?raw` import of `PRIVACY.md`
- [x] `tests/settings/settings-backup-page.test.ts` updated for
      the enabled-button assertion

## Post-Implementation

- [x] `pnpm check` clean (1600 files, 0 errors)
- [x] `pnpm lint` clean
- [x] `pnpm lint:css` clean
- [x] `pnpm check:tokens` clean (312 files, 0 violations)
- [x] `pnpm test` 1040 / 1040
- [x] Per-file `eslint` clean on the 5 changed/new files
- [x] Per-file `stylelint` clean on the 2 changed `.svelte` files
- [x] Evidence file (`evidence/trust-and-data-2026-05-11.md`)
- [x] Notes / partial-A1 limitations file
      (`evidence/notes-2026-05-11.md`)
- [x] `impl.log.md` updated with final entry
- [x] Phase status set to `review` in `phase.md` frontmatter
- [x] Reviewer notified / Reviewer Agent invoked  <!-- closed 2026-05-26: signed off in impl.log.md -->
