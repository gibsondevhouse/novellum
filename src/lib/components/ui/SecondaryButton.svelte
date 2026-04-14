<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
		class?: string;
		href?: string;
	}

	let { children, class: className = '', href, ...rest }: Props = $props();
</script>

{#if href}
	<a {href} class="btn-secondary {className}">
		{@render children?.()}
	</a>
{:else}
	<button class="btn-secondary {className}" {...rest}>
		{@render children?.()}
	</button>
{/if}

<style>
	.btn-secondary {
		background: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border-default);
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
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
		text-decoration: none;
	}

	.btn-secondary:not(:disabled):hover {
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
		border-color: var(--color-border-strong);
	}

	.btn-secondary:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.btn-secondary {
			transition: none;
		}
	}
</style>
