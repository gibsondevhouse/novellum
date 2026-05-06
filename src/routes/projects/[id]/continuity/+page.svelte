<script lang="ts">
	import ContinuityPanel from '$modules/continuity/components/ContinuityPanel.svelte';
	import SurfacePanel from '$lib/components/ui/SurfacePanel.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { getOpenCount } from '$modules/continuity/stores/continuity-store.svelte.js';

	let { data } = $props<{ data: { projectId: string } }>();
</script>

<svelte:head>
	<title>Continuity — Novellum</title>
</svelte:head>

<div class="continuity">
	<PageHeader
		eyebrow="Continuity Command"
		title="Narrative Triage Center"
		description="Review structural issues, tune project-level constraints, and keep interventions grounded in verified context."
	>
		{#snippet meta()}
			<SurfacePanel>
				<div class="continuity-hero__metrics" aria-label="Continuity snapshot">
					<div>
						<span class="metric-label">Open Issues</span>
						<strong>{getOpenCount()}</strong>
					</div>
				</div>
			</SurfacePanel>
		{/snippet}
	</PageHeader>

	<section id="continuity-panel-issues" aria-label="Issue triage">
		<ContinuityPanel projectId={data.projectId} />
	</section>
</div>

<style>
	.continuity {
		padding: var(--space-5) 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.continuity-hero__metrics {
		display: grid;
		gap: var(--space-3);
		height: 100%;
	}

	.metric-label {
		display: block;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.continuity-hero__metrics strong {
		font-size: var(--text-lg);
	}
</style>
