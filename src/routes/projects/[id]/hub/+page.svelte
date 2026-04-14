<script lang="ts">
	import { getContext } from 'svelte';
	import type { Project } from '$lib/db/types.js';
	import ProjectHubHero from '$modules/project/components/ProjectHubHero.svelte';
	import StructuralMetricsCarousel from '$modules/project/components/StructuralMetricsCarousel.svelte';

	let { data } = $props<{ data: { project: Project; currentWordCount: number } }>();

	const { openExport, openDelete } = getContext<{ openExport: () => void; openDelete: () => void }>(
		'projectActions',
	);

	const project = $derived(data.project);
	const hasProgress = $derived(data.currentWordCount > 0);
	const hasTarget = $derived(project.targetWordCount > 0);

	const progressPercent = $derived(
		hasTarget
			? Math.min(100, Math.round((data.currentWordCount / project.targetWordCount) * 100))
			: 0,
	);

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	function formatWords(n: number): string {
		return n.toLocaleString();
	}
</script>

<div class="hub">
	<!-- Layer 1: Story Hero -->
	<ProjectHubHero {project} />

	<!-- Hero utility actions -->
	<div class="hub-hero-actions">
		<button class="hub-util-btn" onclick={openExport}>Export</button>
		<button class="hub-util-btn hub-util-btn--danger" onclick={openDelete}>Delete</button>
	</div>

	<!-- Layer 2: Structural Metrics -->
	<StructuralMetricsCarousel projectId={project.id} />

	<!-- Layer 3: Dashboard Grid -->
	<div class="hub-grid">
		<!-- Progress card -->
		<section class="hub-card" aria-labelledby="mod-progress">
			<span class="hub-card__label" id="mod-progress">Progress</span>
			<span class="hub-card__value">
				{hasProgress ? formatWords(data.currentWordCount) : '0'}
			</span>
			<div
				class="progress-track"
				role="progressbar"
				aria-valuenow={hasProgress ? progressPercent : 0}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={hasProgress
					? `${progressPercent}% of target word count`
					: 'No writing started yet'}
			>
				<div class="progress-fill" style:width="{hasProgress ? progressPercent : 0}%"></div>
			</div>
			<span class="hub-card__sub">
				{#if hasProgress && hasTarget}
					{progressPercent}% of {formatWords(project.targetWordCount)}
				{:else if hasTarget}
					Target: {formatWords(project.targetWordCount)}
				{:else if hasProgress}
					{formatWords(data.currentWordCount)} words
				{:else}
					No target set
				{/if}
			</span>
		</section>

		<!-- Next Step card -->
		<a
			class="hub-card hub-card--action"
			href="/projects/{project.id}/editor"
			aria-label={hasProgress ? 'Continue writing your story' : 'Begin writing your story'}
		>
			<span class="hub-card__label">Next Step</span>
			<span class="hub-card__action-title">
				{hasProgress ? 'Continue Writing' : 'Begin Writing'}
			</span>
			<span class="hub-card__sub">
				{hasProgress ? 'Pick up where you left off.' : 'Start your first scene.'}
			</span>
			<span class="hub-card__arrow" aria-hidden="true">→</span>
		</a>

		<!-- Details card -->
		<section class="hub-card hub-card--wide" aria-labelledby="mod-details">
			<span class="hub-card__label" id="mod-details">Details</span>
			<dl class="details-list">
				<div class="details-row">
					<dt class="details-key">Status</dt>
					<dd class="details-val">{project.status}</dd>
				</div>
				<div class="details-row">
					<dt class="details-key">Created</dt>
					<dd class="details-val">{formatDate(project.createdAt)}</dd>
				</div>
				{#if hasTarget}
					<div class="details-row">
						<dt class="details-key">Target</dt>
						<dd class="details-val">{formatWords(project.targetWordCount)} words</dd>
					</div>
				{/if}
			</dl>
		</section>
	</div>
</div>

<style>
	.hub {
		max-width: 1000px;
		margin: 0 auto;
		width: 100%;
		padding: var(--space-10) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* ── Hero utility actions ── */
	.hub-hero-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: calc(-1 * var(--space-3));
	}
	.hub-util-btn {
		background: none;
		border: none;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		opacity: 0.6;
		transition:
			color var(--duration-base) var(--ease-standard),
			opacity var(--duration-base) var(--ease-standard);
	}
	.hub-util-btn:hover {
		opacity: 1;
		color: var(--color-text-secondary);
	}
	.hub-util-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		opacity: 1;
	}
	.hub-util-btn--danger:hover {
		color: var(--color-error);
	}

	/* ── Dashboard grid (rows 2+) ── */
	.hub-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-4);
	}

	/* ── Shared card chrome ── */
	.hub-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-6);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
	}
	.hub-card--wide {
		grid-column: span 2;
	}
	.hub-card__label {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.5;
	}
	.hub-card__value {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		line-height: 1;
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-tight);
	}
	.hub-card__sub {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	/* ── Progress card ── */
	.progress-track {
		height: 6px;
		background: var(--color-surface-elevated);
		border-radius: var(--radius-full);
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-nova-blue), var(--color-teal));
		border-radius: var(--radius-full);
		transition: width var(--duration-slow) var(--ease-decelerate);
		min-width: 0;
	}

	/* ── Next Step action card ── */
	.hub-card--action {
		text-decoration: none;
		border-color: color-mix(in srgb, var(--color-nova-blue) 20%, var(--color-border-default));
		transition:
			background-color var(--duration-base) var(--ease-standard),
			box-shadow var(--duration-base) var(--ease-standard);
	}
	.hub-card--action:hover {
		background: var(--color-surface-elevated);
		box-shadow: var(--shadow-sm);
		text-decoration: none;
	}
	.hub-card--action:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
	.hub-card__action-title {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-nova-blue);
		line-height: var(--leading-tight);
	}
	.hub-card__arrow {
		font-size: var(--text-lg);
		color: var(--color-nova-blue);
		opacity: 0.6;
		margin-top: auto;
		align-self: flex-end;
		transition: transform var(--duration-base) var(--ease-standard);
	}
	.hub-card--action:hover .hub-card__arrow {
		transform: translateX(4px);
		opacity: 1;
	}

	/* ── Details card ── */
	.details-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin: var(--space-2) 0 0;
		padding: 0;
	}
	.details-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--color-border-subtle);
	}
	.details-row:last-child {
		border-bottom: none;
	}
	.details-key {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
	.details-val {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: capitalize;
		text-align: right;
	}

	/* ── Responsive ── */
	@media (max-width: 767px) {
		.hub-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 640px) {
		.hub {
			padding: var(--space-6) var(--space-4);
		}
		.hub-grid {
			grid-template-columns: 1fr;
		}
		.hub-card--wide {
			grid-column: span 1;
		}
	}
</style>
