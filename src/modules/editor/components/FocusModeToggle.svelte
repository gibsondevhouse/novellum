<script lang="ts">
	interface Props {
		focusMode: boolean;
		onToggle: () => void;
	}

	let { focusMode, onToggle }: Props = $props();
</script>

<button
	type="button"
	class="focus-btn"
	class:active={focusMode}
	onclick={onToggle}
	aria-pressed={focusMode}
	title={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
>
	{focusMode ? 'Exit Focus' : 'Focus'}
</button>

<style>
	.focus-btn {
		background: none;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
	}

	.focus-btn:hover {
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.focus-btn.active {
		background-color: color-mix(in srgb, var(--color-nova-blue) 12%, transparent);
		color: var(--color-nova-blue);
		border-color: color-mix(in srgb, var(--color-nova-blue) 30%, transparent);
	}
</style>
