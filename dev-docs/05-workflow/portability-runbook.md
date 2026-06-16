# Portability Runbook

> Last verified: 2026-06-16

Novellum stores everything in a single SQLite file. Portability comes from `.novellum.zip` bundles produced by the backup pipeline. This runbook covers expected operations and recovery procedures.

## Backup format

A `.novellum.zip` bundle contains:

- `manifest.json` — schema version, project ID, creation timestamp, integrity checksums.
- One JSON file per entity table for the project.
- `assets/` — image binaries referenced by the project.
- **No keyring data.** The OpenRouter API key is never bundled. The credential-exclusion test under [tests/backup/](../../tests/backup/) guards this.

The Dexie schema mirror in [src/lib/db/](../../src/lib/db/) defines the on-disk JSON shape (currently v11).

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/backup/projects/[id]` | Stream a `.novellum.zip` for the project. |
| `POST /api/restore/preview` | Inspect a `.novellum.zip` without committing. Returns manifest + diff summary. |
| `POST /api/restore/project` | Apply a `.novellum.zip` to live SQLite. |

## Standard backup procedure

1. From the Settings → Data surface, click **Backup project**.
2. The browser/desktop saves the `.novellum.zip` to a chosen location.
3. Verify by opening the file in any zip viewer; manifest should list current schema version.

## Standard restore procedure

1. From Settings → Data, click **Restore from backup**.
2. Select the `.novellum.zip`.
3. Preview shows the project name, entity counts, schema version.
4. Confirm. Restore writes into SQLite atomically (transaction-bounded).

## Recovery scenarios

### Corrupt SQLite file

1. Stop the app (close window or kill desktop process).
2. Move the corrupt `novellum.db` aside (do not delete yet).
3. Restart; a fresh DB is created.
4. From Settings → Data → Restore, select your most recent `.novellum.zip`.

### Database in an unexpected location

- Check `NOVELLUM_DB_PATH` env var.
- In desktop builds, the path is shown under Settings → Data → Storage location.

### Migration failure on launch

1. The app refuses to start; check the log (Tauri log plugin writes to OS-standard log dir).
2. Identify the failing migration version.
3. Restore the most recent backup against a fresh DB.
4. File a bug with the failing migration version + log excerpt.

### Lost OpenRouter key

- Keys are stored in OS keyring and are **not** in backups by design.
- Re-enter the key under Settings → AI. No data is lost; only the credential needs re-supplying.

## Round-trip test

[tests/portability/](../../tests/portability/) and [tests/backup/](../../tests/backup/) include a full round-trip: create project → backup → wipe DB → restore → assert byte-equivalent JSON projection per entity. Run with `pnpm test`.

## See also

- [../02-architecture/data-model.md](../02-architecture/data-model.md)
- [../02-architecture/backend.md](../02-architecture/backend.md) — endpoint surface.
- Plan: [plan-006-portability-backup-and-restore](../plans/archive/plan-006-portability-backup-and-restore/plan.md).
