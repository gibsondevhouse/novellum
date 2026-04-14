<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
		class?: string;
	}

	let { children, class: className = '', ...rest }: Props = $props();
</script>

<button class="btn-danger {className}" {...rest}>
	{@render children?.()}
</button>

<style>
	.btn-danger {
		background-color: var(--color-error);
		color: var(--color-text-on-dark);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		font-family: var(--font-sans);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		transition: opacity var(--duration-fast) var(--ease-standard);
	}

	.btn-danger:not(:disabled):hover {
		background-color: var(--color-error-dark);
		border-color: var(--color-error-dark);
	}

	.btn-danger:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.btn-danger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.btn-danger {
			transition: none;
		}
	}
</style>
