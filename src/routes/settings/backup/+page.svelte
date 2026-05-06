<script lang="ts">
	import { onMount } from 'svelte';
	import { getPreference } from '$lib/preferences.js';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import ImportBackupDialog from '$modules/export/components/ImportBackupDialog.svelte';

	let lastBackupAt = $state<string | null>(null);
	let dialogOpen = $state(false);

	onMount(async () => {
		lastBackupAt = await getPreference<string | null>('backup.lastCompletedAt', null);
	});

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
				Manually create a full backup of all your projects and preferences.
			</p>
			<!-- TODO: wire to plan-017 backup service when available -->
			<PrimaryButton disabled>Create backup</PrimaryButton>
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
</style>
