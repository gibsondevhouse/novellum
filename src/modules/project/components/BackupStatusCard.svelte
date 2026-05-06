<script lang="ts">
	import { SurfaceCard, SecondaryButton } from '$lib/components/ui/index.js';
	import { formatRelative } from '../utils/format-relative.js';

	let {
		lastBackupAt,
		projectId,
	}: {
		lastBackupAt: string | null;
		projectId: string;
	} = $props();

	const relativeTime = $derived(formatRelative(lastBackupAt));
	const neverBacked = $derived(lastBackupAt === null);

	function handleBackup() {
		console.log('backup triggered', { projectId });
	}
</script>

<SurfaceCard class="hub-status-card">
	<span class="hub-card__label">Last Backup</span>
	{#if neverBacked}
		<span class="hub-card__value hub-card__value--warn">Never backed up</span>
	{:else}
		<span class="hub-card__value">{relativeTime}</span>
	{/if}
	<div class="hub-card__actions">
		<SecondaryButton onclick={handleBackup}>Back up now</SecondaryButton>
	</div>
</SurfaceCard>

<style>
	:global(.hub-status-card) {
		display: flex !important;
		flex-direction: column !important;
		gap: var(--space-2) !important;
		padding: var(--space-6) !important;
	}

	.hub-card__label {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.hub-card__value {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		line-height: 1.2;
	}

	.hub-card__value--warn {
		color: var(--color-warning, var(--color-text-secondary));
	}

	.hub-card__actions {
		margin-top: var(--space-3);
	}
</style>
