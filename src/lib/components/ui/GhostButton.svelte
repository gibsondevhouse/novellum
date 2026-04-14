<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
		class?: string;
	}

	let { children, class: className = '', ...rest }: Props = $props();
</script>

<button class="btn-ghost {className}" {...rest}>
	{@render children?.()}
</button>

<style>
	.btn-ghost {
		background: none;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-4);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		font-family: var(--font-sans);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			background-color var(--duration-fast) var(--ease-standard);
	}

	.btn-ghost:not(:disabled):hover {
		border-color: var(--color-border-strong);
		color: var(--color-text-primary);
		background-color: var(--color-surface-hover);
	}

	.btn-ghost:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.btn-ghost:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	@media (prefers-reduced-motion: reduce) {
		.btn-ghost {
			transition: none;
		}
	}
</style>
