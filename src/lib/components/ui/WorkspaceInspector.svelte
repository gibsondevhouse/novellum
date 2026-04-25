<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import SurfacePanel from './SurfacePanel.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		header?: Snippet;
		sections?: Snippet;
		metadata?: Snippet;
		footer?: Snippet;
		class?: string;
	}

	let {
		children,
		header,
		sections,
		metadata,
		footer,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<SurfacePanel class={`workspace-inspector ${className}`.trim()} {...rest}>
	{#if children}
		{@render children()}
	{:else}
		{#if header}
			<div class="workspace-inspector__header">{@render header()}</div>
		{/if}
		{#if sections}
			<div class="workspace-inspector__sections">{@render sections()}</div>
		{/if}
		{#if metadata}
			<div class="workspace-inspector__metadata">{@render metadata()}</div>
		{/if}
		{#if footer}
			<div class="workspace-inspector__footer">{@render footer()}</div>
		{/if}
	{/if}
</SurfacePanel>

<style>
	:global(.workspace-inspector) {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: min(920px, 100%);
		height: 100%;
		overflow-y: auto;
		padding-right: var(--space-2);
	}
</style>
