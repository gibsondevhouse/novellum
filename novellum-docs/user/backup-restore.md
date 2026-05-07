# Backup & Restore

> Last verified: 2026-05-07

Your work lives in a single SQLite file on your machine. Backups are explicit `.novellum.zip` bundles you control.

## Backup

1. Open the project.
2. **Settings → Data → Backup project**.
3. Pick a save location.
4. A `.novellum.zip` is written.

That bundle contains everything needed to restore the project: manifest, all entity tables (project, arcs, acts, chapters, scenes, beats, characters, locations, lore, threads, timeline, snapshots, settings), and your image assets.

It explicitly does **not** contain your OpenRouter API key. Keys live in the OS keyring and stay out of backups by design.

## Restore

1. **Settings → Data → Restore from backup**.
2. Select a `.novellum.zip`.
3. Preview shows the project name, entity counts, and schema version.
4. Confirm. Restore is transactional — either it succeeds wholly or your DB is unchanged.

## Recommended cadence

- Manual backup at the end of each major writing session.
- Manual backup before any major restructuring (renaming arcs, mass-moving chapters).
- Long-term archive: keep at least the most recent monthly backup off-machine (e.g., on a USB drive).

## Recovery scenarios

### Disk failure

Restore from your most recent `.novellum.zip` on a new machine. Install Novellum, open the app, **Settings → Data → Restore**, point at the bundle.

### Project corruption

If a project misbehaves, export it as a backup first (the export still works), then restore that backup over the live data. Snapshots in the bundle let you recover scenes that may have been damaged.

### Migration to a new machine

1. Backup all projects on the old machine.
2. Install Novellum on the new machine.
3. Restore each `.novellum.zip` in turn.
4. Re-enter your OpenRouter key under Settings → AI (keys do not transfer with backups).

## Where the live database lives

**Settings → Data → Storage location** shows the active path. On a fresh install, it's in the OS app-data folder for Novellum. You can move it to another path; the app will use the new location on next launch.

## See also

- [export.md](./export.md) — manuscript-only exports for sharing.
- [local-first.md](./local-first.md) — what local-first means.
