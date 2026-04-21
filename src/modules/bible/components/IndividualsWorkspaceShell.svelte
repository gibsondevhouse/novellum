<script lang="ts">
	import type { Snippet } from 'svelte';

	type CharacterOption = {
		id: string;
		name: string;
		subtitle?: string;
		meta?: string;
	};

	let {
		characterOptions,
		selectedCharacterId,
		onSelectCharacter,
		onCreateCharacter,
		hasSelection,
		listAriaLabel = 'Character names',
		createLabel = 'new +',
		dossier,
		empty,
	}: {
		characterOptions: CharacterOption[];
		selectedCharacterId: string | null;
		onSelectCharacter: (id: string) => void;
		onCreateCharacter: () => void | Promise<void>;
		hasSelection: boolean;
		listAriaLabel?: string;
		createLabel?: string;
		dossier?: Snippet;
		empty?: Snippet;
	} = $props();

	const itemCount = $derived(characterOptions.length);
</script>

<div class="individuals-workspace">
	<aside class="individuals-sidebar" aria-label={listAriaLabel}>
		<div class="index-header">
			<div>
				<p class="index-eyebrow">Index</p>
				<h2>{listAriaLabel}</h2>
			</div>
			<span class="index-count" aria-label={`${itemCount} records`}>{itemCount}</span>
		</div>

		<button type="button" class="name-item name-item--new" onclick={() => void onCreateCharacter()}>
			{createLabel}
		</button>

		<div class="names-scroll">
			<ul class="names-list">
				{#if characterOptions.length === 0}
					<li class="names-empty">No records yet.</li>
				{/if}
				{#each characterOptions as option (option.id)}
					<li>
						<button
							type="button"
							class="name-item"
							class:name-item--selected={selectedCharacterId === option.id}
							onclick={() => onSelectCharacter(option.id)}
							aria-current={selectedCharacterId === option.id ? 'true' : undefined}
						>
							<span class="name-item__title">{option.name}</span>
							{#if option.subtitle}
								<span class="name-item__subtitle">{option.subtitle}</span>
							{/if}
							{#if option.meta}
								<span class="name-item__meta">{option.meta}</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</aside>
	<main class="individuals-main">
		<div class="dossier-scroll">
			{#if hasSelection}
				{@render dossier?.()}
			{:else}
				{@render empty?.()}
			{/if}
		</div>
	</main>
</div>

<style>
	.individuals-workspace {
		display: grid;
		grid-template-columns: minmax(15rem, 19rem) minmax(0, 1fr);
		gap: var(--space-4);
		padding: var(--space-5);
		height: 100%;
		min-height: 0;
		overflow: hidden;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		background: linear-gradient(160deg, color-mix(in srgb, var(--color-surface-overlay) 92%, transparent), var(--color-surface-ground));
		box-shadow: var(--shadow-xs);
	}

	.individuals-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		border-right: 1px solid var(--color-border-subtle);
		padding-right: var(--space-4);
		height: 100%;
		overflow: hidden;
		min-height: 0;
	}

	.index-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.index-header h2,
	.index-eyebrow {
		margin: 0;
	}

	.index-header h2 {
		font-size: var(--text-base);
	}

	.index-eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.index-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2rem;
		padding-inline: var(--space-2);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.names-scroll {
		height: 100%;
		overflow-y: auto;
		overscroll-behavior: contain;
		min-height: 0;
	}

	.names-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.names-empty {
		padding: var(--space-3);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-align: center;
	}

	.name-item {
		width: 100%;
		display: grid;
		gap: 0.2rem;
		padding: var(--space-2) var(--space-3);
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-primary);
		text-align: left;
		cursor: pointer;
		font-size: var(--text-sm);
		transition: background-color var(--duration-fast) var(--ease-standard);
	}

	.name-item__title {
		font-weight: var(--font-weight-semibold);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name-item__subtitle,
	.name-item__meta {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name-item__subtitle {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.name-item__meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		letter-spacing: 0.03em;
	}

	.name-item:hover {
		background: var(--color-surface-overlay);
		border-color: var(--color-border-default);
	}

	.name-item--new {
		font-weight: var(--font-weight-semibold);
		color: var(--color-nova-blue);
		border-color: color-mix(in srgb, var(--color-nova-blue) 22%, transparent);
		text-align: center;
	}

	.name-item--new:hover {
		background: color-mix(in srgb, var(--color-nova-blue) 8%, var(--color-surface-overlay));
		border-color: color-mix(in srgb, var(--color-nova-blue) 35%, transparent);
	}

	.name-item--selected {
		background: color-mix(in srgb, var(--color-nova-blue) 10%, var(--color-surface-overlay));
		border-color: color-mix(in srgb, var(--color-nova-blue) 35%, var(--color-border-default));
		box-shadow: var(--shadow-xs);
	}

	.individuals-main {
		display: flex;
		justify-content: center;
		height: 100%;
		overflow: hidden;
		min-height: 0;
	}

	.dossier-scroll {
		height: 100%;
		width: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		min-height: 0;
		display: flex;
		justify-content: center;
	}

	.dossier-scroll :global(.character-dossier) {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
		max-width: 920px;
		width: 100%;
		padding-right: var(--space-6);
	}

	.dossier-scroll :global(.dossier-flow) {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.dossier-scroll :global(.dossier-footer-actions) {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		flex-wrap: wrap;
		padding-top: var(--space-2);
		padding-bottom: var(--space-6);
	}

	@media (max-width: 768px) {
		.individuals-workspace {
			grid-template-columns: 1fr;
			gap: var(--space-3);
			padding: var(--space-4);
			height: auto;
			overflow: visible;
		}

		.individuals-sidebar {
			border-right: none;
			padding-right: 0;
			height: auto;
		}

		.names-scroll {
			max-height: 14rem;
		}

		.individuals-main {
			height: auto;
			overflow: visible;
		}

		.dossier-scroll :global(.character-dossier) {
			padding-right: 0;
		}
	}
</style>
