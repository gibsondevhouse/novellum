---
phase: phase-007-trust-and-data
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

## [2026-05-11 02:35] Agent: Claude Code (acting as Backend)

**Action:** Closed F3 + F6 + A2 from the phase-001 triage; closed A1
partially (per-project SQLite round-trip works end-to-end via
existing endpoints; the multi-project UI restore is documented as a
follow-up).

**F3 — Manual backup**

1. Created `src/routes/api/backup/all/+server.ts`. The handler:
   - Reads every project from SQLite
     (`SELECT id, title FROM projects ORDER BY createdAt ASC`).
   - For each, calls the existing
     `buildProjectBackup(db, project.id)` from
     `src/lib/server/backup/build-project-backup.ts` (returns a
     deterministic per-project `.novellum` archive).
   - Bundles them in a JSZip with paths like
     `projects/<projectId>/<title>_<date>.novellum`.
   - Adds a top-level `manifest.json` (`AllProjectsManifest` interface)
     with `formatVersion`, `exportedAt`, `appVersion`,
     `projectCount`, and the per-project inventory.
   - Returns `application/zip` with `Content-Disposition` set to
     `novellum-backup-<YYYY-MM-DD>.novellum.zip`,
     plus diagnostic headers `X-Novellum-Backup-Format` and
     `X-Novellum-Project-Count`.
   - Handles per-project failures by logging + skipping (`ProjectNotFoundError`)
     or aborting with HTTP 500 + structured body for everything else.

2. Wired `src/routes/settings/backup/+page.svelte`:
   - Replaced
     `<PrimaryButton disabled>Create backup</PrimaryButton>` with
     a button that calls `createBackup()`.
   - `createBackup()` POSTs to `/api/backup/all`, reads
     `Content-Disposition` for the filename, blob-downloads via
     a synthetic `<a>` click, then writes
     `backup.lastCompletedAt` so the "Last Backup" timestamp
     refreshes.
   - On error, surfaces the message inline via a `role="alert"`
     `<p class="backup__error">`.

**F6 — Privacy text matches PRIVACY.md**

Replaced `src/routes/settings/privacy/+page.svelte` with a slim
component that imports `../../../../PRIVACY.md?raw` (same pattern
as the legal page from phase-002). Renders the canonical text in
a single styled `<pre>` block. The previous 4-section inline
duplicate (which had already drifted from `PRIVACY.md`) is gone.

**A2 — Data location surfaced in Settings**

Added a Storage Location readout to `/settings/backup`. The page
now fetches `/api/settings/storage-location` on mount and renders
the database file path, app data directory, backups directory,
and free disk space (with a `formatBytes()` helper). Backend
endpoint was already implemented (`describeDatabaseLocation()` +
`statfs` probe) and just needed a UI consumer.

**A1 — Backup round-trip (partial)**

The per-project SQLite round-trip works end-to-end via the
existing `/api/backup/projects/[id]` and `/api/restore/project`
endpoints. The new multi-project `.novellum.zip` produced by
`/api/backup/all` is **not yet** consumable by the existing
`ImportBackupDialog` (which reads the legacy Dexie format). A
proper multi-project UI restore is documented as a follow-up in
`evidence/notes-2026-05-11.md` and is out of scope for this
phase. Calling A1 a partial close: SQLite single-project flow is
verified-working; multi-project UI flow needs another phase.

**Test update**

`tests/settings/settings-backup-page.test.ts` previously asserted
the "Create backup" button is `disabled`. Now that the button is
wired, that assertion was inverted to "enabled (idle state)" with
a comment pointing back at this phase.

**Result:**

- `pnpm check` (worktree): 1600 files, 0 errors.
- `pnpm lint`: clean.
- `pnpm lint:css`: clean.
- `pnpm check:tokens`: 312 files, 0 violations.
- `pnpm test`: 1040 / 1040 in 17s. The previously-failing
  `settings-backup-page` test now passes; no new test count
  delta because the change was an in-place update.
- Per-file `eslint` and `stylelint` on the 5 changed/new files:
  exit 0.

**Notes:**

- The `.novellum.zip` produced is a zip-of-zips. Cleaner than
  introducing a second backup format, but it does mean restore
  has to know to crack open the outer archive and replay each
  inner `.novellum` against `/api/restore/project`. UI work for
  that is the natural next phase of trust-and-data.
- The legacy `restoreBackupSnapshot` (Dexie-side) is preserved
  unchanged so users with old backups can still restore.

---

## [2026-05-26 12:00] Agent: Reviewer Agent (GitHub Copilot)

**Reviewer sign-off.** Walked the checklist + evidence + linked
source files for this phase. All implementation and post-impl
boxes are checked, the evidence file cites DoD line items by
identifier, and the test counts in the log match the current
suite size on master. Phase status flipped `review` → `complete`.

**No outstanding actions.** Documented limitations / follow-ups
in the phase's `evidence/notes-*.md` (where present) are
explicitly post-V1 and do not block closeout.

---
