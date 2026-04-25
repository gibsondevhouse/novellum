<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		ariaLabel,
		attributesColumns = 2,
		media,
		identity,
		attributes,
	}: {
		ariaLabel?: string;
		attributesColumns?: 2 | 3;
		media?: Snippet;
		identity?: Snippet;
		attributes?: Snippet;
	} = $props();
</script>

<div
	class="entity-detail-header"
	class:entity-detail-header--cols-3={attributesColumns === 3}
	aria-label={ariaLabel}
>
	{#if media}
		<div class="entity-detail-header__media">
			{@render media()}
		</div>
	{/if}
	<div class="entity-detail-header__info">
		{#if identity}
			<div class="entity-detail-header__identity">
				{@render identity()}
			</div>
		{/if}
		{#if attributes}
			<div class="entity-detail-header__attributes">
				{@render attributes()}
			</div>
		{/if}
	</div>
</div>

<style>
	.entity-detail-header {
		display: grid;
		grid-template-columns: minmax(220px, 260px) 1fr;
		gap: var(--space-5);
		align-items: start;
		padding-bottom: var(--space-5);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-default) 55%, transparent);
	}

	.entity-detail-header__media {
		width: 100%;
	}

	.entity-detail-header__info {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-2) 0;
	}

	.entity-detail-header__identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.entity-detail-header__attributes {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2) var(--space-3);
	}

	.entity-detail-header--cols-3 .entity-detail-header__attributes {
		grid-template-columns: repeat(3, 1fr);
	}

	/* Canonical descendant selectors — entity wrappers reuse these class names */
	.entity-detail-header :global(.dossier-eyebrow) {
		margin: 0;
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.entity-detail-header :global(.entity-name) {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.entity-detail-header :global(.entity-role) {
		margin: 0;
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-semibold);
	}

	.entity-detail-header :global(.entity-summary) {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		max-width: 60ch;
		line-height: var(--leading-relaxed);
	}

	.entity-detail-header :global(textarea.entity-summary) {
		resize: vertical;
		min-height: 4.5rem;
	}

	.entity-detail-header :global(.role-row) {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.entity-detail-header :global(.role-separator) {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.entity-detail-header :global(.identity-tags) {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.entity-detail-header :global(.identity-tags span) {
		padding: 0.3rem 0.6rem;
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-surface-overlay) 78%, transparent);
		border: 1px solid var(--color-border-default);
	}

	.entity-detail-header :global(.attribute-item) {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding-bottom: var(--space-1);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent);
	}

	.entity-detail-header :global(.attribute-label) {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-semibold);
	}

	.entity-detail-header :global(.attribute-value) {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		line-height: var(--leading-relaxed);
	}

	.entity-detail-header :global(.input-inline) {
		width: 100%;
		border: 1px solid transparent;
		background: transparent;
		color: inherit;
		padding: 0.15rem 0.2rem;
		border-radius: var(--radius-sm);
		font: inherit;
	}

	.entity-detail-header :global(.input-inline:hover) {
		border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent);
	}

	.entity-detail-header :global(.input-inline:focus) {
		outline: none;
		border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent);
	}

	@media (max-width: 1024px) {
		.entity-detail-header {
			grid-template-columns: 1fr;
		}

		.entity-detail-header--cols-3 .entity-detail-header__attributes {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.entity-detail-header {
			gap: var(--space-4);
		}

		.entity-detail-header__attributes,
		.entity-detail-header--cols-3 .entity-detail-header__attributes {
			grid-template-columns: 1fr;
		}
	}
</style>
