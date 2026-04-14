<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		variant?: 'elevated' | 'flat' | 'inset';
		interactive?: boolean;
		class?: string;
		href?: string;
		element?: keyof HTMLElementTagNameMap;
	}

	let {
		children,
		variant = 'elevated',
		interactive = false,
		class: className = '',
		href,
		element = 'div',
		...rest
	}: Props = $props();
</script>

{#if href}
	<a
		{href}
		class="surface-card variant-{variant} interactive {className}"
		{...rest as any}
	>
		{@render children?.()}
	</a>
{:else}
	<svelte:element
		this={element}
		class="surface-card variant-{variant} {interactive ? 'interactive' : ''} {className}"
		tabindex={interactive ? 0 : undefined}
		role={interactive ? 'button' : undefined}
		{...rest}
	>
		{@render children?.()}
	</svelte:element>
{/if}

<style>
	.surface-card {
		padding: var(--space-4);
		border-radius: var(--radius-md);
		transition: var(--transition-color), box-shadow var(--duration-fast) var(--ease-standard);
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.variant-elevated {
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		box-shadow: var(--shadow-sm);
	}

	.variant-flat {
		background-color: transparent;
		border: 1px solid var(--color-border-subtle);
	}

	.variant-inset {
		background-color: var(--color-surface-base);
		border: 1px solid transparent;
		--_shadow: inset 0 2px 4px color-mix(in srgb, black 20%, transparent);
		box-shadow: var(--_shadow);
	}

	.interactive {
		cursor: pointer;
	}

	.interactive:hover {
		background-color: var(--color-surface-hover);
	}

	.interactive:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-color: var(--color-border-focus);
	}
	
	@media (prefers-reduced-motion: reduce) {
		.surface-card {
			transition: none;
		}
	}
</style>
