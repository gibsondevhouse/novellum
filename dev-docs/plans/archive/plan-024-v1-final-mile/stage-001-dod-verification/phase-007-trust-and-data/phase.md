---
title: Trust + Data — backup wiring, privacy parity, data location surface
slug: phase-007-trust-and-data
phase_number: 7
status: complete
owner: Backend Agent
stage: stage-001-dod-verification
parts: []
estimated_duration: 1d
closed: 2026-05-26
---

## Goal

Close DoD failures and at-risks identified by phase-001 in the
"Trust and Data" category:

- **F3** — manual backup creates a `.novellum.zip`. The button at
  `/settings/backup` was previously `<PrimaryButton disabled>`
  with `<!-- TODO: wire to plan-017 backup service when available -->`.
- **F6** — privacy text matches `PRIVACY.md`. The previous
  `/settings/privacy/+page.svelte` duplicated the policy inline
  and had already drifted from the canonical root file.
- **A2** — data location is visible in Settings (user can find
  their database file).
- **A1** — restore from a valid backup imports projects correctly.
  **Partial close:** the SQLite per-project round-trip is fully
  wired (`/api/backup/projects/[id]` ↔ `/api/restore/project`);
  the multi-project `.novellum.zip` UI restore is documented as
  a follow-up (see `evidence/notes-2026-05-11.md`).

## Acceptance Criteria

- [x] `POST /api/backup/all` exists. Iterates every project in
      SQLite, builds a per-project `.novellum` archive via the
      existing `buildProjectBackup`, bundles them into a single
      `.novellum.zip` with a top-level `manifest.json`, returns
      the bytes with a proper `Content-Disposition` filename.
- [x] `/settings/backup` "Create backup" button is enabled,
      calls `/api/backup/all`, triggers a browser download, and
      records `backup.lastCompletedAt` so the "Last Backup"
      readout updates.
- [x] `/settings/backup` shows storage paths sourced from
      `/api/settings/storage-location` (database file, app data
      directory, backups directory, free disk space) — A2.
- [x] `/settings/privacy` renders `PRIVACY.md` directly via Vite
      `?raw` import. Inline duplication removed.
- [x] `tests/settings/settings-backup-page.test.ts` updated to
      assert the button is enabled in idle state.
- [x] All five quality gates green from the worktree.

## Files Changed

**Created:**
- `src/routes/api/backup/all/+server.ts` (~110 LOC) — new
  multi-project backup endpoint.

**Updated:**
- `src/routes/settings/backup/+page.svelte` — added
  `createBackup()` flow + storage-location section + error
  surface; replaced the disabled `Create backup` button with a
  wired one.
- `src/routes/settings/privacy/+page.svelte` — replaced the
  4-section inline content with a single `?raw` import of
  `PRIVACY.md` rendered as styled `<pre>`.
- `tests/settings/settings-backup-page.test.ts` — flipped the
  "disabled" assertion to "enabled in idle state" with a
  comment explaining the phase-007 change.

## Notes

- The `.novellum.zip` produced by `/api/backup/all` is a
  zip-of-zips: `manifest.json` at top-level + one
  `projects/<id>/<title>_<date>.novellum` per project. Each
  inner `.novellum` is the existing single-project archive from
  `buildProjectBackup` — the format other layers (manifest,
  checksums, table-registry) are unchanged. This means the
  V1 backup format is *compositional*: a multi-project archive
  is just a bag of single-project archives plus an inventory.
- The legacy browser `ImportBackupDialog` (which restores via
  Dexie, not SQLite) is unchanged. It's still wired and still
  works for the older Dexie-format backups some users may have
  on disk. The new SQLite-aware restore lives at
  `/api/restore/project`. Stitching the new multi-project
  format into a UI restore flow is documented as a follow-up.
- Privacy: chose the same `?raw` pattern from phase-002 (legal
  page) over a markdown library or hand-parsed sections. The
  `PRIVACY.md` content is short, the rendering is clean enough,
  and there's now zero risk of drift between the canonical
  policy and what the user sees.
- Storage location data is sourced from the pre-existing
  `/api/settings/storage-location` endpoint
  (`src/routes/api/settings/storage-location/+server.ts`) which
  was already implementing `describeDatabaseLocation()` with
  free-disk-space probing. No backend work was needed for A2.
