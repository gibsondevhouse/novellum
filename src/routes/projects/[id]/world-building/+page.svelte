<script lang="ts">
	import { SurfaceCard, SectionHeader } from '$lib/components/ui/index.js';

	let { data } = $props<{ data: { projectId: string } }>();

	const sections = $derived([
		{
			id: 'characters',
			label: 'Characters',
			description: 'Dramatis personae, arcs, and traits.',
			href: `/projects/${data.projectId}/world-building/characters`,
			icon: '👤',
		},
		{
			id: 'locations',
			label: 'Locations',
			description: 'Key settings and environmental details.',
			href: `/projects/${data.projectId}/world-building/locations`,
			icon: '📍',
		},
		{
			id: 'lore',
			label: 'Lore',
			description: 'History, myths, and world rules.',
			href: `/projects/${data.projectId}/world-building/lore`,
			icon: '📜',
		},
		{
			id: 'plot-threads',
			label: 'Plot Threads',
			description: 'Subplots and narrative tracking.',
			href: `/projects/${data.projectId}/world-building/plot-threads`,
			icon: '🧵',
		},
		{
			id: 'timeline',
			label: 'Timeline',
			description: 'Chronological order of events.',
			href: `/projects/${data.projectId}/world-building/timeline`,
			icon: '⏳',
		},
	]);
</script>

<svelte:head>
	<title>World Building — Novellum</title>
</svelte:head>

<div class="wb-hub">
	<SectionHeader
		title="World Building"
		description="Select a section to manage your world-building entities."
	/>

	<nav class="section-grid" aria-label="World Building sections">
		{#each sections as section (section.id)}
			<SurfaceCard href={section.href} class="section-card">
				<div class="section-icon">{section.icon}</div>
				<div class="section-content">
					<span class="section-label">{section.label}</span>
					<span class="section-desc">{section.description}</span>
				</div>
			</SurfaceCard>
		{/each}
	</nav>
</div>

<style>
	.wb-hub {
		padding: var(--space-6) 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.section-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-4);
	}

	:global(.section-card) {
		display: flex !important;
		flex-direction: row !important;
		align-items: flex-start !important;
		gap: var(--space-4) !important;
		padding: var(--space-6) !important;
		text-decoration: none !important;
	}

	.section-icon {
		font-size: var(--text-2xl);
		line-height: 1;
		padding-top: var(--space-1);
	}

	.section-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.section-label {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.section-desc {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: var(--leading-normal);
	}
</style>
