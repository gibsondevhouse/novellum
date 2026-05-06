<script lang="ts">
	import { onMount } from 'svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	interface Props {
		onNext: () => void;
	}
	let { onNext }: Props = $props();

	let appDataDir = $state<string | null>(null);

	onMount(async () => {
		try {
			const res = await fetch('/api/settings/storage-location');
			if (res.ok) {
				const data = (await res.json()) as { appDataDirectory?: string };
				appDataDir = data.appDataDirectory ?? null;
			}
		} catch {
			// Graceful fallback — leave appDataDir null
		}
	});
</script>

<div class="step">
	<h2 class="step-heading">Where your data lives</h2>
	<p class="step-body">
		All your projects, scenes, and notes are stored in a local database on your device.
	</p>
	{#if appDataDir}
		<div class="step-path">
			<span class="step-path-label">Data directory</span>
			<code class="step-path-value">{appDataDir}</code>
		</div>
	{:else}
		<div class="step-path">
			<span class="step-path-label">Data directory</span>
			<code class="step-path-value step-path-value--placeholder">
				~/Library/Application Support/Novellum
			</code>
		</div>
	{/if}
	<p class="step-note">
		You can view the exact path anytime from <strong>Settings → Storage</strong>.
	</p>
	<div class="step-actions">
		<PrimaryButton onclick={onNext}>Continue</PrimaryButton>
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
	.step-path {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-3);
		background: var(--color-surface-raised);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}
	.step-path-label {
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.step-path-value {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		word-break: break-all;
	}
	.step-path-value--placeholder {
		color: var(--color-text-muted);
	}
	.step-note {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}
	.step-actions {
		margin-top: var(--space-2);
	}
</style>
