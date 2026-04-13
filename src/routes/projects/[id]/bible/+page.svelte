<script lang="ts">
	let { data } = $props<{ data: { projectId: string } }>();

	const sections = $derived([
		{ id: 'characters', label: 'Characters', href: `/projects/${data.projectId}/bible/characters` },
		{ id: 'locations', label: 'Locations', href: `/projects/${data.projectId}/bible/locations` },
		{ id: 'lore', label: 'Lore', href: `/projects/${data.projectId}/bible/lore` },
		{
			id: 'plot-threads',
			label: 'Plot Threads',
			href: `/projects/${data.projectId}/bible/plot-threads`,
		},
		{ id: 'timeline', label: 'Timeline', href: `/projects/${data.projectId}/bible/timeline` },
	]);
</script>

<svelte:head>
	<title>Story Bible — Novellum</title>
</svelte:head>

<div class="bible-hub">
	<h1>Story Bible</h1>
	<p class="subtitle">Select a section to manage your world-building entities.</p>
	<nav class="section-grid" aria-label="Story Bible sections">
		{#each sections as section (section.id)}
			<a class="section-card" href={section.href}>
				<span class="section-label">{section.label}</span>
			</a>
		{/each}
	</nav>
</div>

<style>
	.bible-hub {
		padding: var(--space-4) 0;
	}

	.bible-hub h1 {
		margin-bottom: var(--space-2);
	}

	.subtitle {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		margin-bottom: var(--space-6);
	}

	.section-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: var(--space-3);
	}

	.section-card {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-6) var(--space-4);
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: var(--transition-border), var(--transition-color);
	}

	.section-card:hover {
		border-color: var(--color-teal);
		text-decoration: none;
	}

	.section-label {
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}
</style>
