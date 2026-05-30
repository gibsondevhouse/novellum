<script lang="ts">
	import GenerateButton from './GenerateButton.svelte';

	interface Props {
		projectId?: string | null;
	}

	let { projectId = null }: Props = $props();
</script>

<section class="empty-state" aria-labelledby="empty-factions-title">
	<h2 id="empty-factions-title">No faction selected</h2>
	<p>Create a faction from the left rail to start building its dossier, relationships, and notable members.</p>
	{#if projectId}
		<div class="empty-state-actions">
			<GenerateButton {projectId} entityKind="faction" count={1} label="✦ Generate a faction" />
		</div>
	{/if}
</section>

<style>
	.empty-state {
		max-width: 760px;
		width: 100%;
		border: 1px solid color-mix(in srgb, var(--color-border-default) 70%, transparent);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-overlay) 22%, transparent);
		padding: var(--space-6);
	}

	h2 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-lg);
		color: var(--color-text-primary);
	}

	p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
	}

	.empty-state-actions {
		margin-top: var(--space-4);
	}
</style>
