<script lang="ts">
	import { untrack } from 'svelte';
	import { GhostButton } from '$lib/components/ui/index.js';

	let { beatNumber, content, onChange, onDelete } = $props<{
		beatNumber: number;
		content: string;
		onChange: (text: string) => void;
		onDelete: () => void;
	}>();

	// eslint-disable-next-line svelte/prefer-writable-derived
	let draft = $state(untrack(() => content));
	let inputEl = $state<HTMLInputElement | undefined>(undefined);

	$effect(() => {
		draft = content;
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Backspace' && draft === '') {
			e.preventDefault();
			onDelete();
		}
	}

	function handleBlur() {
		const trimmed = draft.trim();
		if (trimmed !== content) onChange(trimmed);
	}
</script>

<div class="beat-number-field" role="listitem">
	<span class="beat-prefix" aria-label="Beat {beatNumber}">#{beatNumber}</span>
	<input
		bind:this={inputEl}
		class="beat-input"
		type="text"
		bind:value={draft}
		onblur={handleBlur}
		onkeydown={handleKeydown}
		aria-label="Beat {beatNumber} content"
		placeholder="What happens here?"
	/>
	<GhostButton
		class="beat-delete"
		type="button"
		onclick={onDelete}
		aria-label="Delete beat {beatNumber}"
		tabindex={-1}>×</GhostButton
	>
</div>

<style>
	.beat-number-field {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
		border: 1px solid var(--color-border-subtle);
		transition: border-color var(--duration-fast) var(--ease-standard);
	}

	.beat-number-field:focus-within {
		border-color: var(--color-border-default);
		box-shadow: var(--focus-ring);
	}

	.beat-prefix {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		min-width: 22px;
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
		user-select: none;
	}

	.beat-input {
		flex: 1;
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-family: inherit;
		padding: 0;
		min-width: 0;
		outline: none;
	}

	.beat-input:focus {
		color: var(--color-text-primary);
	}

	:global(.beat-delete) {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: var(--text-sm);
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
		line-height: 1;
		opacity: 0;
		transition:
			opacity 0.1s,
			color 0.1s;
	}

	.beat-number-field:hover :global(.beat-delete),
	.beat-number-field:focus-within :global(.beat-delete) {
		opacity: 1;
	}

	:global(.beat-delete:hover) {
		color: var(--color-error);
	}

	:global(.beat-delete:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
		opacity: 1;
	}
</style>
