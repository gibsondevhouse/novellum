<script lang="ts">
	import type { Project, WritingStyle } from '$lib/db/types.js';
	import {
		ProjectHubHero,
		StructuralMetricsCarousel,
		HubProgressCard,
		HubNextStepCard,
		HubDetailsPanel,
	} from '$modules/project';

	let { data }: {
		data: { project: Project; currentWordCount: number; writingStyles: WritingStyle[] };
	} = $props();

	const project = $derived(data.project);
</script>

<div class="hub">
	<!-- Layer 1: Story Hero -->
	<ProjectHubHero {project} />

	<!-- Layer 2: Structural Metrics -->
	<StructuralMetricsCarousel projectId={project.id} />

	<!-- Layer 3: Dashboard Grid -->
	<div class="hub-grid">
		<HubProgressCard
			currentWordCount={data.currentWordCount}
			targetWordCount={project.targetWordCount}
		/>
		<HubNextStepCard projectId={project.id} currentWordCount={data.currentWordCount} />
		<HubDetailsPanel {project} writingStyles={data.writingStyles} />
	</div>
</div>

<style>
	.hub {
		max-width: 1120px;
		margin: 0 auto;
		width: 100%;
		padding: var(--space-8) 0 var(--space-10);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* ── Dashboard grid (rows 2+) ── */
	.hub-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-4);
		align-items: stretch;
	}

	/* ── Responsive ── */
	@media (max-width: 767px) {
		.hub {
			padding: var(--space-6) 0 var(--space-8);
		}

		.hub-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 640px) {
		.hub {
			padding: var(--space-6) 0;
		}
		.hub-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
