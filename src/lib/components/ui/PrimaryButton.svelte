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
	<a {href} class="btn-primary {className}">
		{@render children?.()}
	</a>
{:else}
	<button class="btn-primary {className}" {...rest}>
		{@render children?.()}
	</button>
{/if}

<style>
	.btn-primary {
		background-color: var(--color-nova-blue);
		color: var(--color-text-on-dark);
		border: none;
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
		text-decoration: none;
	}

	.btn-primary:not(:disabled):hover {
		opacity: 0.88;
	}

	.btn-primary:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	@media (prefers-reduced-motion: reduce) {
		.btn-primary {
			transition: none;
		}
	}
</style>
