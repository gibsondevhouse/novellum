<script lang="ts">
	import { getContext, tick } from 'svelte';
	import type { Project } from '$lib/db/types.js';
	import ProjectHubHero from '$modules/project/components/ProjectHubHero.svelte';
	import StructuralMetricsCarousel from '$modules/project/components/StructuralMetricsCarousel.svelte';
	import { SurfacePanel, SectionHeader, PrimaryButton, GhostButton, Input } from '$lib/components/ui/index.js';
	import { submitUpdate } from '$modules/project/stores/project-hub.svelte.js';
	import { STYLE_PRESETS } from '$lib/ai/style-presets.js';

	let { data } = $props<{ data: { project: Project; currentWordCount: number; writingStyles: import('$lib/db/types.js').WritingStyle[] } }>();

	const { openExport, openDelete } = getContext<{ openExport: () => void; openDelete: () => void }>(
		'projectActions',
	);

	let editingTarget = $state(false);

	async function startEditTarget() {
		targetValue = project.targetWordCount;
		editingTarget = true;
		await tick();
		const el = document.querySelector<HTMLInputElement>('.target-input input');
		el?.focus();
	}

	async function confirmTarget() {
		await submitUpdate(project.id, { targetWordCount: Number(targetValue) });
		editingTarget = false;
	}
	let targetValue = $state(0);

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
		<GhostButton onclick={openExport}>Export</GhostButton>
		<GhostButton onclick={openDelete} class="hub-util-btn--danger">Delete</GhostButton>
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
		<SurfacePanel class="hub-card hub-card--wide">
			<SectionHeader title="Details" />
			<dl class="details-list">
				<div class="details-row">
					<dt class="details-key">Writing Style</dt>
					<dd class="details-val">
						<select
							value={project.stylePresetId ?? ''}
							onchange={(e) => submitUpdate(project.id, { stylePresetId: e.currentTarget.value })}
							class="details-select"
						>
							<option value="">— None —</option>
							{#if data.writingStyles.length > 0}
								<optgroup label="Your Styles">
									{#each data.writingStyles as style}
										<option value={style.id}>{style.title}</option>
									{/each}
								</optgroup>
							{/if}
							<optgroup label="Built-in Presets">
								{#each STYLE_PRESETS as preset}
									<option value={preset.id}>{preset.name}</option>
								{/each}
							</optgroup>
						</select>
					</dd>
				</div>
				<div class="details-row">
					<dt class="details-key">Status</dt>
					<dd class="details-val">
						<select
							value={project.status}
							onchange={(e) => submitUpdate(project.id, { status: e.currentTarget.value as any })}
							class="details-select"
						>
							<option value="draft">Drafting</option>
							<option value="revision">In Revision</option>
							<option value="completed">Completed</option>
							<option value="archived">Archived</option>
						</select>
					</dd>
				</div>
				<div class="details-row">
					<dt class="details-key">Created</dt>
					<dd class="details-val">{formatDate(project.createdAt)}</dd>
				</div>
				<div class="details-row">
					<dt class="details-key">Target Word Count</dt>
					<dd class="details-val">
						{#if editingTarget}
							<div class="target-edit">
								<Input
									type="number"
									bind:value={targetValue as any}
									min="0"
									step="1000"
									class="target-input"
									onkeydown={(e) => {
										if (e.key === 'Enter') confirmTarget();
										if (e.key === 'Escape') editingTarget = false;
									}}
								/>
								<PrimaryButton onclick={confirmTarget} class="target-btn">Save</PrimaryButton>
							</div>
						{:else}
							<button class="details-val-btn" onclick={startEditTarget}>
								{hasTarget ? `${formatWords(project.targetWordCount)} words` : 'Set target'}
							</button>
						{/if}
					</dd>
				</div>
			</dl>
		</SurfacePanel>
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
	:global(.hub-util-btn--danger:hover) {
		color: var(--color-error) !important;
		border-color: var(--color-error) !important;
	}

	/* ── Dashboard grid (rows 2+) ── */
	.hub-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-4);
	}

	/* ── Shared card chrome ── */
	:global(.hub-card) {
		display: flex !important;
		flex-direction: column !important;
		gap: var(--space-2) !important;
		padding: var(--space-6) !important;
	}
	:global(.hub-card--wide) {
		grid-column: span 2 !important;
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
		margin: 0;
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
		text-align: right;
	}

	.details-select {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-family: inherit;
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		transition: background-color var(--duration-base) var(--ease-standard);
	}

	.details-select:hover {
		background: var(--color-surface-hover);
	}

	.details-val-btn {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-family: inherit;
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		transition: background-color var(--duration-base) var(--ease-standard);
	}

	.details-val-btn:hover {
		background: var(--color-surface-hover);
	}

	.target-edit {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	:global(.target-input) {
		width: 120px !important;
	}

	:global(.target-btn) {
		padding: var(--space-1) var(--space-2) !important;
		font-size: var(--text-xs) !important;
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
		:global(.hub-card--wide) {
			grid-column: span 1 !important;
		}
	}
</style>
