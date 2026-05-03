<script lang="ts">
	import { GhostButton } from '$lib/components/ui/index.js';

	type CharacterOption = {
		id: string;
		name: string;
		role?: string;
		summary?: string;
	};

	let {
		id,
		label = 'Character',
		value,
		options,
		excludeId,
		placeholder = 'Select a character',
		onChange,
	}: {
		id: string;
		label?: string;
		value: string;
		options: CharacterOption[];
		excludeId?: string;
		placeholder?: string;
		onChange: (id: string) => void;
	} = $props();

	let isOpen = $state(false);
	let query = $state('');
	let highlightedIndex = $state(0);
	let rootEl = $state<HTMLElement | null>(null);

	const filteredOptions = $derived.by(() => {
		const normalized = query.trim().toLowerCase();
		return options.filter((option) => {
			if (excludeId && option.id === excludeId) return false;
			if (!normalized) return true;
			return option.name.toLowerCase().includes(normalized) || (option.role || '').toLowerCase().includes(normalized);
		});
	});

	const selectedLabel = $derived(options.find((option) => option.id === value)?.name || '');

	$effect(() => {
		if (!isOpen && selectedLabel) {
			query = selectedLabel;
		}
	});

	function openMenu() {
		isOpen = true;
		highlightedIndex = 0;
	}

	function chooseOption(id: string) {
		onChange(id);
		isOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
			openMenu();
			event.preventDefault();
			return;
		}
		if (!isOpen) return;

		if (event.key === 'ArrowDown') {
			highlightedIndex = Math.min(highlightedIndex + 1, Math.max(filteredOptions.length - 1, 0));
			event.preventDefault();
		}
		if (event.key === 'ArrowUp') {
			highlightedIndex = Math.max(highlightedIndex - 1, 0);
			event.preventDefault();
		}
		if (event.key === 'Enter' && filteredOptions[highlightedIndex]) {
			chooseOption(filteredOptions[highlightedIndex].id);
			event.preventDefault();
		}
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}

	function handleFocusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (rootEl && next && rootEl.contains(next)) return;
		isOpen = false;
	}
</script>

<div class="character-select" bind:this={rootEl} onfocusout={handleFocusOut}>
	<label class="field-label" for={id}>{label}</label>
	<input
		id={id}
		type="text"
		class="select-input"
		role="combobox"
		aria-expanded={isOpen}
		aria-controls="character-select-list"
		aria-autocomplete="list"
		placeholder={placeholder}
		value={isOpen ? query : selectedLabel}
		onfocus={openMenu}
		oninput={(event) => {
			query = (event.currentTarget as HTMLInputElement).value;
			isOpen = true;
			highlightedIndex = 0;
		}}
		onkeydown={handleKeydown}
	/>

	{#if isOpen}
		<ul id="character-select-list" class="options-list" role="listbox">
			{#if filteredOptions.length === 0}
				<li class="empty-option" role="option" aria-selected="false" aria-disabled="true">No matching characters</li>
			{:else}
				{#each filteredOptions as option, index (option.id)}
					<li>
						<GhostButton
							type="button"
							class={`option-item ${index === highlightedIndex ? 'option-item--highlighted' : ''}`}
							role="option"
							aria-selected={value === option.id}
							onclick={() => chooseOption(option.id)}
						>
							<span class="option-name">{option.name}</span>
							{#if option.role}
								<span class="option-meta">{option.role}</span>
							{/if}
						</GhostButton>
					</li>
				{/each}
			{/if}
		</ul>
	{/if}
</div>

<style>
	.character-select {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		position: relative;
	}

	.select-input {
		width: 100%;
		border: 1px solid transparent;
		background: transparent;
		color: var(--color-text-primary);
		padding: 0.2rem 0.25rem;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
	}

	.select-input:hover {
		border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent);
	}

	.select-input:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent);
	}

	.options-list {
		position: absolute;
		top: calc(100% + 0.25rem);
		left: 0;
		right: 0;
		z-index: 5;
		margin: 0;
		padding: 0.25rem;
		list-style: none;
		border: 1px solid color-mix(in srgb, var(--color-border-default) 80%, transparent);
		border-radius: var(--radius-md);
		background: var(--color-surface-ground);
		max-height: 220px;
		overflow-y: auto;
	}

	:global(.option-item) {
		width: 100%;
		border: none;
		background: transparent;
		text-align: left;
		padding: 0.35rem 0.45rem;
		border-radius: var(--radius-sm);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	:global(.option-item--highlighted),
	:global(.option-item:hover) {
		background: color-mix(in srgb, var(--color-surface-overlay) 50%, transparent);
	}

	.option-name {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.option-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.empty-option {
		padding: 0.4rem 0.45rem;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}
</style>
