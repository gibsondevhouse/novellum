<script lang="ts">
	import { getProjectMetrics } from '../services/hub-metrics-service.js';
	import type { ProjectMetrics } from '../types.js';
	import StructuralMetricCard from './StructuralMetricCard.svelte';

	let { projectId }: { projectId: string } = $props();

	let metrics = $state<ProjectMetrics | null>(null);

	$effect(() => {
		getProjectMetrics(projectId).then((m) => (metrics = m));
	});

	const cards = $derived(
		metrics
			? [
					{
						label: 'Arcs',
						count: metrics.arcs.count,
						ready: metrics.arcs.ready,
						statusLine: metrics.arcs.ready ? 'Ready' : 'Not available yet',
						href: `/projects/${projectId}/arcs`,
					},
					{
						label: 'Acts',
						count: metrics.acts.count,
						ready: metrics.acts.ready,
						statusLine: metrics.acts.ready ? 'Ready' : 'Not available yet',
						href: `/projects/${projectId}/acts`,
					},
					{
						label: 'Chapters',
						count: metrics.chapters.count,
						ready: metrics.chapters.ready,
						statusLine: metrics.chapters.ready ? 'Ready' : 'Not available yet',
						href: `/projects/${projectId}/outline`,
					},
					{
						label: 'Scenes',
						count: metrics.scenes.count,
						ready: metrics.scenes.ready,
						statusLine: metrics.scenes.ready ? 'Ready' : 'Not available yet',
						href: `/projects/${projectId}/outline`,
					},
				]
			: null,
	);
</script>

<section class="metrics-carousel" aria-label="Story structure metrics">
	{#if cards}
		{#each cards as card (card.label)}
			<StructuralMetricCard {...card} />
		{/each}
	{:else}
		{#each Array(4) as _, i (i)}
			<div class="metric-skeleton"></div>
		{/each}
	{/if}
</section>

<style>
	.metrics-carousel {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-4);
	}
	.metric-skeleton {
		height: 120px;
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		--_dur: 1.5s;
		animation: pulse var(--_dur) var(--ease-standard) infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 0.7;
		}
	}
	@media (max-width: 767px) {
		.metrics-carousel {
			display: flex;
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			gap: var(--space-4);
			padding-bottom: var(--space-2);
		}
		.metrics-carousel > :global(*) {
			flex: 0 0 calc(100% - var(--space-8));
			max-width: 280px;
			scroll-snap-align: start;
		}
		.metric-skeleton {
			flex: 0 0 calc(100% - var(--space-8));
			max-width: 280px;
			scroll-snap-align: start;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.metric-skeleton {
			animation: none;
		}
	}
</style>
