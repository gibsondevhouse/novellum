<script lang="ts">
	import type { Snippet } from 'svelte';
	import PageHeader from './PageHeader.svelte';

	let {
		eyebrow,
		title,
		description,
		actions,
		metrics,
	}: {
		eyebrow?: string;
		title: string;
		description?: string;
		actions?: Snippet;
		metrics?: Snippet;
	} = $props();
</script>

<div class="workspace-hero">
	<PageHeader {eyebrow} {title} {description} {actions} meta={metrics} />
</div>

<style>
	.workspace-hero {
		display: block;
	}
</style>
