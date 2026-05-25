<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className = '',
		element = 'p',
	}: {
		children: Snippet;
		class?: string;
		element?: 'p' | 'span' | 'div';
	} = $props();
</script>

<svelte:element this={element} class="editorial-eyebrow {className}">
	{@render children()}
</svelte:element>

<style>
	.editorial-eyebrow {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 9px;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}
</style>
