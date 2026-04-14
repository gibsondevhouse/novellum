<script lang="ts">
	import {
		AVAILABLE_MODELS,
		getSelectedModelOption,
		setSelectedModel,
	} from '$lib/stores/model-selection.svelte.js';

	let open = $state(false);
	let current = $derived(getSelectedModelOption());

	function toggle(event: MouseEvent) {
		event.stopPropagation();
		open = !open;
	}

	function select(modelId: string) {
		setSelectedModel(modelId);
		open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			open = false;
		}
	}
</script>

<svelte:window onclick={() => (open = false)} onkeydown={handleKeydown} />

<div class="model-selector">
	<button
		class="model-selector__trigger"
		onclick={toggle}
		aria-haspopup="listbox"
		aria-expanded={open}
	>
		<span class="model-selector__label">{current.label}</span>
		<svg class="model-selector__chevron" class:model-selector__chevron--open={open} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>

	{#if open}
		<ul class="model-selector__menu" role="listbox" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && (open = false)}>
			{#each AVAILABLE_MODELS as model (model.id)}
				<li
					class="model-selector__option"
					class:model-selector__option--active={model.id === current.id}
					role="option"
					aria-selected={model.id === current.id}
					onclick={() => select(model.id)}
					onkeydown={(e) => e.key === 'Enter' && select(model.id)}
					tabindex="0"
				>
					<span class="model-selector__option-label">{model.label}</span>
					<span class="model-selector__option-provider">{model.provider}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.model-selector {
		position: relative;
	}

	.model-selector__trigger {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding: 4px 8px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-glass);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: inherit;
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
		white-space: nowrap;
	}

	.model-selector__trigger:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-border-strong);
	}

	.model-selector__label {
		line-height: 1;
	}

	.model-selector__chevron {
		transition: transform var(--duration-fast) var(--ease-standard);
		color: var(--color-text-muted);
	}

	.model-selector__chevron--open {
		transform: rotate(180deg);
	}

	.model-selector__menu {
		position: absolute;
		top: calc(100% + 4px);
		right: 0;
		min-width: 220px;
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		list-style: none;
		padding: var(--space-1) 0;
		z-index: 100;
	}

	.model-selector__option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard);
	}

	.model-selector__option:hover {
		background: var(--color-surface-hover);
	}

	.model-selector__option:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: -2px;
	}

	.model-selector__option--active {
		background: var(--color-surface-glass);
	}

	.model-selector__option-label {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		font-weight: var(--font-weight-medium);
	}

	.model-selector__option--active .model-selector__option-label {
		color: var(--color-nova-blue);
	}

	.model-selector__option-provider {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>
