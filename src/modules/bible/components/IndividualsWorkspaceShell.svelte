<script lang="ts">
	import type { Snippet } from 'svelte';

	type CharacterOption = {
		id: string;
		name: string;
	};

	let {
		characterOptions,
		selectedCharacterId,
		onSelectCharacter,
		onCreateCharacter,
		hasSelection,
		dossier,
		empty,
	}: {
		characterOptions: CharacterOption[];
		selectedCharacterId: string | null;
		onSelectCharacter: (id: string) => void;
		onCreateCharacter: () => void | Promise<void>;
		hasSelection: boolean;
		dossier?: Snippet;
		empty?: Snippet;
	} = $props();
</script>

<div class="individuals-workspace">
	<aside class="individuals-sidebar" aria-label="Character names">
		<div class="names-scroll">
			<ul class="names-list">
				<li>
					<button type="button" class="name-item name-item--new" onclick={() => void onCreateCharacter()}>new +</button>
				</li>
				{#each characterOptions as character (character.id)}
					<li>
						<button
							type="button"
							class="name-item"
							class:name-item--selected={selectedCharacterId === character.id}
							onclick={() => onSelectCharacter(character.id)}
						>
							{character.name}
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
		grid-template-columns: 200px 1fr;
		gap: var(--space-4);
		padding: var(--space-6);
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	.individuals-sidebar {
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--color-border-default);
		padding-right: var(--space-4);
		height: 100%;
		overflow: hidden;
		min-height: 0;
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

	.name-item {
		width: 100%;
		padding: var(--space-2) var(--space-2);
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-primary);
		text-align: center;
		cursor: pointer;
		font-size: var(--text-sm);
		transition: background-color var(--duration-fast) var(--ease-standard);
	}

	.name-item:hover {
		background: var(--color-surface-overlay);
		border-color: var(--color-border-default);
	}

	.name-item--new {
		font-weight: var(--font-weight-semibold);
		color: var(--color-nova-blue);
		margin-bottom: var(--space-2);
		border-color: color-mix(in srgb, var(--color-nova-blue) 22%, transparent);
	}

	.name-item--new:hover {
		background: color-mix(in srgb, var(--color-nova-blue) 8%, var(--color-surface-overlay));
		border-color: color-mix(in srgb, var(--color-nova-blue) 35%, transparent);
	}

	.name-item--selected {
		background: color-mix(in srgb, var(--color-nova-blue) 10%, var(--color-surface-overlay));
		border-color: color-mix(in srgb, var(--color-nova-blue) 35%, var(--color-border-default));
		box-shadow: inset 2px 0 0 color-mix(in srgb, var(--color-nova-blue) 70%, transparent);
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

	@media (max-width: 768px) {
		.individuals-workspace {
			grid-template-columns: 1fr;
			gap: var(--space-3);
			padding: var(--space-4);
			height: auto;
			overflow: visible;
		}

		.individuals-sidebar {
			max-height: 200px;
			display: grid;
			place-items: center;
			height: auto;
		}

		.individuals-main {
			height: auto;
			overflow: visible;
		}
	}
</style>
