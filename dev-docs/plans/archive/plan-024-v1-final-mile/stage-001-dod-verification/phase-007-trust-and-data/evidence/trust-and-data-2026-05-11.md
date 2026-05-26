# Trust and Data — DoD Verification Evidence — 2026-05-11

> **Phase:** stage-001 / phase-007 (Trust and Data)
> **Source checklist:** [`v1-dod-checklist.md` § Trust and Data](../../../../../qa-docs/v1-dod-checklist.md)

## DoD Items in this category

| # | DoD line | Status | Evidence |
|---|---|---|---|
| TD1 | Manual backup (Settings → Backup) creates a `.novellum.zip` in the expected location | ✅ **closed by this phase** | New endpoint `POST /api/backup/all` returns a `.novellum.zip` archive; `/settings/backup` "Create backup" button now wired via `createBackup()` and triggers a browser download. Filename pattern `novellum-backup-<YYYY-MM-DD>.novellum.zip`. |
| TD2 | Restore from a valid backup imports all projects correctly | ⚠️ **partial — single-project SQLite round-trip closed; multi-project UI restore is a follow-up** | Per-project: `POST /api/backup/projects/[id]` ↔ `POST /api/restore/project` works end-to-end (pre-existing infrastructure, validated). Multi-project: UI consumer of the new `.novellum.zip` format needs to be added in a follow-up phase. See `notes-2026-05-11.md`. |
| TD3 | Data location is displayed in Settings (user can find their database file) | ✅ **closed by this phase** | `/settings/backup` "Storage Location" section now fetches `/api/settings/storage-location` and renders database file path, app data directory, backups directory, and free-disk-space readout. |
| TD4 | Privacy policy is accessible at `/settings/privacy` | ✅ pre-existing | Route present; no change needed beyond F6 below. |
| TD5 | Privacy policy text matches `PRIVACY.md` | ✅ **closed by this phase** | `/settings/privacy/+page.svelte` now imports `../../../../PRIVACY.md?raw` and renders the canonical text directly. No inline duplication; drift impossible. |

Four of five Trust-and-Data items closed by this phase. TD2 is a
partial close — single-project SQLite round-trip is fully
operational; multi-project UI restore needs another phase.

## Implementation evidence

### Files

```text
src/routes/api/backup/all/+server.ts                        (new, ~110 LOC)
src/routes/settings/backup/+page.svelte                     (updated)
src/routes/settings/privacy/+page.svelte                    (rewritten)
tests/settings/settings-backup-page.test.ts                 (updated assertion)
```

### Key code citations

**Multi-project backup endpoint** —
[src/routes/api/backup/all/+server.ts:30-105](src/routes/api/backup/all/+server.ts):

```ts
const projectRows = db
  .prepare('SELECT id, title FROM projects ORDER BY createdAt ASC')
  .all() as Array<{ id: string; title: string }>;

for (const project of projectRows) {
  const result = await buildProjectBackup(db, project.id);
  zip.file(`projects/${project.id}/${result.filename}`, result.archive);
  manifestProjects.push({ id, title, archive: ... });
}

zip.file('manifest.json', JSON.stringify(manifest, null, 2));
const archive = await zip.generateAsync({ type: 'uint8array', ... });
```

**Backup button wiring** —
[src/routes/settings/backup/+page.svelte:46-79](src/routes/settings/backup/+page.svelte:46):

```ts
async function createBackup(): Promise<void> {
  creating = true;
  createError = null;
  try {
    const response = await fetch('/api/backup/all', { method: 'POST' });
    if (!response.ok) { ... }
    const blob = await response.blob();
    const filename = filenameFromContentDisposition(response.headers.get('content-disposition'))
      || `novellum-backup-${todayIso}.novellum.zip`;
    // synthetic <a> click → browser download
    ...
    await setPreference('backup.lastCompletedAt', completedAt);
    lastBackupAt = completedAt;
  } catch (err) { createError = err.message; }
  finally { creating = false; }
}
```

**Privacy `?raw` import** —
[src/routes/settings/privacy/+page.svelte:1-5](src/routes/settings/privacy/+page.svelte:1):

```svelte
<script lang="ts">
  import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
  import privacyText from '../../../../PRIVACY.md?raw';
</script>
```

**Storage location render** —
[src/routes/settings/backup/+page.svelte:103-131](src/routes/settings/backup/+page.svelte:103):

```svelte
{#if storage}
  <dl class="backup__paths">
    <div class="backup__path-row">
      <dt>Database file</dt>
      <dd><code>{storage.databasePath}</code></dd>
    </div>
    <div class="backup__path-row">
      <dt>App data directory</dt>
      <dd><code>{storage.appDataDirectory}</code></dd>
    </div>
    {#if storage.diskSpace}
      <div class="backup__path-row">
        <dt>Disk space</dt>
        <dd>{formatBytes(storage.diskSpace.bytesFree)} free of {formatBytes(storage.diskSpace.bytesTotal)}</dd>
      </div>
    {/if}
  </dl>
{/if}
```

### Gate verification

| Gate | Result |
| --- | --- |
| `pnpm check` | `COMPLETED 1600 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS` |
| `pnpm lint` | exit 0 — clean |
| `pnpm lint:css` | exit 0 — clean |
| `pnpm check:tokens` | `✓ Token enforcement: 312 files scanned, 0 violations.` |
| `pnpm test` | `Test Files 157 passed (157) / Tests 1040 passed (1040)` in 17s |

Test count delta: 0 (the change to `settings-backup-page.test.ts`
was an in-place update of an existing assertion, not a new test).
The previously-failing assertion ("Create backup button is
disabled") now correctly asserts the button is enabled in idle
state.
