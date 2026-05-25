<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className = '',
	}: {
		children: Snippet;
		class?: string;
	} = $props();
</script>

<p class="logline {className}">
	{@render children()}
</p>

<style>
	.logline {
		margin: 0;
		font-family: var(--font-prose);
		font-style: italic;
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
		max-width: 56ch;
	}
</style>
