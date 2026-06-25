<script lang="ts">
	import {
		buildDossierLinkHref,
		resolveDossierLinks,
		type DossierLinkIndex,
		type DossierLinkTarget,
	} from '../services/dossier-link-resolver.js';

	let { text, index, projectId, onNavigate } = $props<{
		text: string;
		index: DossierLinkIndex;
		projectId: string;
		onNavigate: (target: DossierLinkTarget) => void;
	}>();

	const segments = $derived(resolveDossierLinks(text, index));

	function handleNavigate(event: MouseEvent, target: DossierLinkTarget): void {
		event.preventDefault();
		onNavigate(target);
	}
</script>

<div class="biography-panel" aria-label="Resolved dossier references">
	{#if segments.length === 0}
		<p>No details recorded.</p>
	{:else}
		<p>
			{#each segments as segment, index (index)}
				{#if segment.type === 'link'}
					<a
						href={buildDossierLinkHref(projectId, segment.target)}
						onclick={(event) => handleNavigate(event, segment.target)}
						data-target-kind={segment.target.kind}
						data-target-id={segment.target.id}>{segment.text}</a
					>
				{:else}
					{segment.text}
				{/if}
			{/each}
		</p>
	{/if}
</div>

<style>
	.biography-panel {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 68%, transparent);
		padding: var(--space-3);
	}

	p {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	a {
		color: var(--color-nova-blue);
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	a:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}
</style>
