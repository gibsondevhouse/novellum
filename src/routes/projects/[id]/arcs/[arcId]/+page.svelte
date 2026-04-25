<script lang="ts">
	import { page } from '$app/state';
	import { WorkspaceShell, WorkspaceHero } from '$lib/components/ui/index.js';

	const arcLabel = $derived((page.params.arcId || 'arc').replace(/[-_]+/g, ' '));
</script>

<svelte:head>
	<title>Arc Workspace — Novellum</title>
</svelte:head>

<WorkspaceShell mainLabel="Arc workspace placeholder">
	{#snippet hero()}
		<WorkspaceHero
			eyebrow="Arc Workspace"
			title={arcLabel}
			description="This arc workspace is being prepared. Continue refining thread records and continuity signals while planner controls are finalized."
		>
			{#snippet actions()}
				<div class="future-actions">
					<a class="future-primary" href="/projects/{page.params.id}/world-building/plot-threads">Back to Threads</a>
					<a class="future-secondary" href="/projects/{page.params.id}/continuity">Open Continuity</a>
				</div>
			{/snippet}
		</WorkspaceHero>
	{/snippet}

	{#snippet main()}
		<div class="future-placeholder" aria-live="polite">
			<p>Arc-level planner controls will land here.</p>
		</div>
	{/snippet}
</WorkspaceShell>

<style>
	.future-actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.future-primary,
	.future-secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.25rem;
		font-size: var(--text-sm);
		text-decoration: none;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		transition: background-color var(--duration-fast) var(--ease-standard);
	}

	.future-primary {
		color: var(--color-text-primary);
		border: 1px solid color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-nova-blue) 18%, transparent);
	}

	.future-secondary {
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, transparent);
	}

	.future-primary:hover,
	.future-secondary:hover {
		background: color-mix(in srgb, var(--color-nova-blue) 26%, transparent);
		color: var(--color-text-primary);
	}

	.future-primary:focus-visible,
	.future-secondary:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.future-placeholder {
		width: 100%;
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		border: 1px dashed var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 70%, transparent);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	.future-placeholder p {
		margin: 0;
	}
</style>
