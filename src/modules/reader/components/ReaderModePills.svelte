<script lang="ts">
	export type ReaderMode = 'classic' | 'book' | 'fullscreen';

	interface Props {
		mode: ReaderMode;
		onModeChange: (mode: ReaderMode) => void;
	}

	let { mode, onModeChange }: Props = $props();

	const items: Array<{ value: ReaderMode; label: string }> = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'book', label: 'Book' },
		{ value: 'fullscreen', label: 'Full Screen' },
	];
</script>

<div class="reader-mode-pills" role="group" aria-label="Reader mode">
	{#each items as item (item.value)}
		<button
			type="button"
			class="reader-mode-pills__button"
			class:reader-mode-pills__button--active={mode === item.value}
			aria-pressed={mode === item.value}
			onclick={() => onModeChange(item.value)}
		>
			{item.label}
		</button>
	{/each}
</div>

<style>
	.reader-mode-pills {
		display: inline-flex;
		gap: var(--space-1);
		padding: var(--space-1);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		background: var(--color-surface-base);
	}

	.reader-mode-pills__button {
		appearance: none;
		border: none;
		background: transparent;
		color: var(--color-text-muted);
		font: inherit;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.reader-mode-pills__button:hover {
		color: var(--color-text-secondary);
	}

	.reader-mode-pills__button:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.reader-mode-pills__button--active {
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
	}
</style>
