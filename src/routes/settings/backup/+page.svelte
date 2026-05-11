<script lang="ts">
	import { onMount } from 'svelte';
	import { getPreference, setPreference } from '$lib/preferences.js';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import ImportBackupDialog from '$modules/export/components/ImportBackupDialog.svelte';

	interface StorageLocation {
		mode: string;
		databasePath: string;
		appDataDirectory: string;
		backupDirectory: string | null;
		logDirectory: string | null;
		diskSpace: { bytesFree: number; bytesTotal: number } | null;
	}

	let lastBackupAt = $state<string | null>(null);
	let dialogOpen = $state(false);
	let creating = $state(false);
	let createError = $state<string | null>(null);
	let storage = $state<StorageLocation | null>(null);

	onMount(async () => {
		lastBackupAt = await getPreference<string | null>('backup.lastCompletedAt', null);
		try {
			const res = await fetch('/api/settings/storage-location');
			if (res.ok) {
				storage = (await res.json()) as StorageLocation;
			}
		} catch {
			// best-effort — UI degrades gracefully
		}
	});

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		const kb = bytes / 1024;
		if (kb < 1024) return `${kb.toFixed(1)} KB`;
		const mb = kb / 1024;
		if (mb < 1024) return `${mb.toFixed(1)} MB`;
		const gb = mb / 1024;
		return `${gb.toFixed(1)} GB`;
	}

	function formatDate(iso: string | null): string {
		if (!iso) return 'No backups yet';
		try {
			return new Intl.DateTimeFormat(undefined, {
				dateStyle: 'long',
				timeStyle: 'short',
			}).format(new Date(iso));
		} catch {
			return iso;
		}
	}

	function filenameFromContentDisposition(header: string | null): string {
		if (!header) return '';
		const match = /filename="?([^";]+)"?/i.exec(header);
		return match?.[1] ?? '';
	}

	async function createBackup(): Promise<void> {
		creating = true;
		createError = null;
		try {
			const response = await fetch('/api/backup/all', { method: 'POST' });
			if (!response.ok) {
				let detail = `${response.status}`;
				try {
					const body = (await response.json()) as { error?: string; reason?: string };
					detail = body.reason ?? body.error ?? detail;
				} catch {
					/* ignore */
				}
				throw new Error(`Backup failed: ${detail}`);
			}

			const blob = await response.blob();
			const filename =
				filenameFromContentDisposition(response.headers.get('content-disposition')) ||
				`novellum-backup-${new Date().toISOString().slice(0, 10)}.novellum.zip`;

			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			const completedAt = new Date().toISOString();
			await setPreference('backup.lastCompletedAt', completedAt);
			lastBackupAt = completedAt;
		} catch (err) {
			createError = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			creating = false;
		}
	}
</script>

<svelte:head>
	<title>Backup — Novellum</title>
</svelte:head>

<div class="backup">
	<h1 class="backup__title">Backup &amp; Restore</h1>

	<section class="backup__section" aria-labelledby="backup-status-heading">
		<h2 id="backup-status-heading" class="backup__heading">Last Backup</h2>
		<SurfaceCard variant="flat">
			<p class="backup__status">{formatDate(lastBackupAt)}</p>
		</SurfaceCard>
	</section>

	<section class="backup__section" aria-labelledby="backup-create-heading">
		<h2 id="backup-create-heading" class="backup__heading">Create Backup</h2>
		<SurfaceCard variant="flat">
			<p class="backup__description">
				Bundle every project in this device's database into a single
				<code>.novellum.zip</code> archive. Each project is included as
				its own <code>.novellum</code> file inside the archive.
			</p>
			<PrimaryButton onclick={createBackup} disabled={creating}>
				{creating ? 'Creating backup…' : 'Create backup'}
			</PrimaryButton>
			{#if createError}
				<p class="backup__error" role="alert">{createError}</p>
			{/if}
		</SurfaceCard>
	</section>

	<section class="backup__section" aria-labelledby="backup-restore-heading">
		<h2 id="backup-restore-heading" class="backup__heading">Restore from File</h2>
		<SurfaceCard variant="flat">
			<p class="backup__description">
				Load a previously exported backup archive to restore your projects and data.
			</p>
			<PrimaryButton onclick={() => (dialogOpen = true)}>
				Restore from backup file…
			</PrimaryButton>
		</SurfaceCard>
	</section>

	<section class="backup__section" aria-labelledby="backup-storage-heading">
		<h2 id="backup-storage-heading" class="backup__heading">Storage Location</h2>
		<SurfaceCard variant="flat">
			<p class="backup__description">
				Your project data is stored in a local SQLite database on this device. Use the
				<a href="/settings/data">Data tab</a> to access migration and portability tools.
			</p>
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
					{#if storage.backupDirectory}
						<div class="backup__path-row">
							<dt>Backups directory</dt>
							<dd><code>{storage.backupDirectory}</code></dd>
						</div>
					{/if}
					{#if storage.diskSpace}
						<div class="backup__path-row">
							<dt>Disk space</dt>
							<dd>
								{formatBytes(storage.diskSpace.bytesFree)} free of
								{formatBytes(storage.diskSpace.bytesTotal)}
							</dd>
						</div>
					{/if}
				</dl>
			{/if}
		</SurfaceCard>
	</section>
</div>

<ImportBackupDialog
	open={dialogOpen}
	onClose={() => (dialogOpen = false)}
	onRestoreComplete={() => (dialogOpen = false)}
/>

<style>
	.backup {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.backup__title {
		font: var(--font-heading-lg);
		color: var(--color-text-primary);
		margin: 0;
	}

	.backup__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.backup__heading {
		font: var(--font-label-md);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.backup__status,
	.backup__description {
		margin: 0 0 var(--space-4);
		color: var(--color-text-primary);
	}

	.backup__description a {
		color: var(--color-accent);
		text-decoration: underline;
	}

	.backup__description code {
		font-family: var(--font-mono);
		font-size: 0.95em;
		padding: 0 var(--space-1);
	}

	.backup__error {
		margin: var(--space-3) 0 0;
		color: var(--color-error);
		font-size: var(--text-sm);
	}

	.backup__paths {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: var(--space-3) 0 0;
	}

	.backup__path-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.backup__path-row dt {
		font: var(--font-label-sm);
		color: var(--color-text-secondary);
	}

	.backup__path-row dd {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		overflow-wrap: break-word;
	}

	.backup__path-row code {
		font-family: var(--font-mono);
		font-size: 0.95em;
	}
</style>
