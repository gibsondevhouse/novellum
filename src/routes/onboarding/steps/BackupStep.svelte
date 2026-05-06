<script lang="ts">
	import { goto } from '$app/navigation';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	interface Props {
		onNext: () => void;
	}
	let { onNext }: Props = $props();
</script>

<div class="step">
	<h2 class="step-heading">Back up your work</h2>
	<p class="step-body">
		Novellum does not back up your work automatically. Your data lives only on this device.
	</p>
	<div class="step-warning">
		<strong>No automatic cloud backup.</strong> If this device is lost or damaged, your projects
		could be lost too. Export a <code>.novellum</code> backup regularly.
	</div>
	<p class="step-note">
		You can create a backup anytime from <strong>Settings → Backup</strong> or from the Project Hub.
	</p>
	<div class="step-actions">
		<PrimaryButton onclick={onNext}>I understand</PrimaryButton>
		<GhostButton onclick={() => goto('/settings/backup')}>Open Backup Settings</GhostButton>
	</div>
</div>

<style>
	.step {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.step-heading {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}
	.step-body {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
	}
	.step-warning {
		padding: var(--space-3);
		background: var(--color-warning-surface, var(--color-surface-raised));
		border-left: 3px solid var(--color-warning, var(--color-accent));
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		line-height: var(--leading-relaxed);
	}
	.step-note {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}
	.step-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
</style>
