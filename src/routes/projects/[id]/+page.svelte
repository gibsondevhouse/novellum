<script lang="ts">
	import { getContext } from 'svelte';
	import type { Project } from '$lib/db/types.js';

	let { data } = $props<{ data: { project: Project; currentWordCount: number } }>();

	const { openEdit } = getContext<{ openEdit: () => void }>('projectActions');

	const project = $derived(data.project);
	const hasProgress = $derived(data.currentWordCount > 0);
	const hasTarget = $derived(project.targetWordCount > 0);

	const progressPercent = $derived(
		hasTarget
			? Math.min(100, Math.round((data.currentWordCount / project.targetWordCount) * 100))
			: 0,
	);

	const wordsRemaining = $derived(
		hasTarget ? Math.max(0, project.targetWordCount - data.currentWordCount) : 0,
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
	<div class="hub-grid">

		<!-- ── Left column: Story anchor + Progress ── -->
		<div class="hub-primary">

			<!-- Story block: cover + logline -->
			<section class="story-block" aria-labelledby="mod-story">
				<!-- Cover: faux book cover with 2:3 ratio -->
				<button
					class="cover"
					onclick={openEdit}
					aria-label="Add a book cover"
					title="Add cover"
				>
					<div class="cover-placeholder">
						<span class="cover-label">Add Cover</span>
					</div>
				</button>

				<!-- Story content -->
				<div class="story-content">
					<h2 class="story-content-label" id="mod-story">Story</h2>
					{#if project.logline}
						<blockquote class="logline">{project.logline}</blockquote>
					{:else}
						<button
							class="logline-empty"
							onclick={openEdit}
							aria-label="Add a logline to define this story"
						>
							Add a logline to define this story
						</button>
					{/if}
				</div>
			</section>

			<!-- Progress module -->
			<section class="progress-module" aria-labelledby="mod-progress">
				<h2 class="module-label" id="mod-progress">Progress</h2>
				<div class="progress-card">
					<div class="progress-numbers">
						{#if hasProgress}
							<div class="progress-stats">
								<span class="progress-count">{formatWords(data.currentWordCount)}</span>
								<span class="progress-of">
									{hasTarget ? `of ${formatWords(project.targetWordCount)}` : 'words'} written
								</span>
							</div>
						{:else}
							<p class="progress-empty-text">Your draft hasn't started yet.</p>
						{/if}

						{#if hasTarget && !hasProgress}
							<span class="progress-target-hint">
								Target: {formatWords(project.targetWordCount)} words
							</span>
						{/if}
					</div>

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

					{#if hasProgress && hasTarget}
						<p class="progress-remaining">
							{progressPercent}% complete
							{#if progressPercent < 100}
								· {formatWords(wordsRemaining)} words remaining
							{:else}
								· Target reached
							{/if}
						</p>
					{/if}
				</div>
			</section>

		</div>

		<!-- ── Right column: Action card + Metadata ── -->
		<aside class="hub-secondary">

			<!-- Action card -->
			<a
				class="action-card"
				href="/projects/{project.id}/editor"
				aria-label={hasProgress ? 'Continue writing your story' : 'Begin writing your story'}
			>
				<div class="action-card-body">
					<span class="action-card-eyebrow">Next step</span>
					<span class="action-card-title">
						{hasProgress ? 'Continue Writing' : 'Begin Writing'}
					</span>
					<p class="action-card-context">
						{#if hasProgress}
							Pick up where you left off.
						{:else}
							Start your first scene.
						{/if}
					</p>
				</div>
				<span class="action-card-arrow" aria-hidden="true">→</span>
			</a>

			<!-- Metadata panel -->
			<section class="metadata-panel" aria-labelledby="mod-meta">
				<h2 class="module-label" id="mod-meta">Details</h2>
				<dl class="metadata-list">
					<div class="metadata-row">
						<dt class="meta-key">Status</dt>
						<dd class="meta-val">{project.status}</dd>
					</div>
					<div class="metadata-row">
						<dt class="meta-key">Created</dt>
						<dd class="meta-val">{formatDate(project.createdAt)}</dd>
					</div>
					{#if hasTarget}
						<div class="metadata-row">
							<dt class="meta-key">Target</dt>
							<dd class="meta-val">{formatWords(project.targetWordCount)} words</dd>
						</div>
					{/if}
				</dl>
			</section>

		</aside>

	</div>
</div>

<style>
	/* ── Outer frame: aligned with header + mode switcher ── */
	.hub {
		max-width: 1000px;
		margin: 0 auto;
		width: 100%;
		padding: var(--space-10) var(--space-6);
	}

	/* ── Grid: 3fr left (story + progress) | 2fr right (action + meta) ── */
	.hub-grid {
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: var(--space-8);
		align-items: start;
	}

	.hub-primary {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.hub-secondary {
		position: sticky;
		top: var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* ── Shared module label ── */
	.module-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-4);
	}

	/* ─────────────────────────────────────
	   STORY BLOCK: cover + logline
	───────────────────────────────────── */
	.story-block {
		display: flex;
		gap: var(--space-5);
		align-items: flex-start;
	}

	/* Cover: 2:3 book proportion */
	.cover {
		flex-shrink: 0;
		width: 120px;
		aspect-ratio: 2 / 3;
		border-radius: var(--radius-md);
		overflow: hidden;
		border: 1px solid var(--color-border-subtle);
		background: none;
		padding: 0;
		cursor: pointer;
		display: block;
		transition:
			border-color var(--duration-base) var(--ease-standard),
			box-shadow var(--duration-base) var(--ease-standard);
	}

	.cover:hover {
		border-color: var(--color-border-default);
		box-shadow: var(--shadow-md);
	}

	.cover:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring-offset);
	}

	.cover-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(
			160deg,
			var(--color-surface-elevated) 0%,
			var(--color-surface-overlay) 100%
		);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
	}

	.cover-label {
		font-size: 10px;
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	/* Story content alongside cover */
	.story-content {
		flex: 1;
		min-width: 0;
		padding-top: 2px; /* optical alignment with cover top */
	}

	.story-content-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-4);
	}

	.logline {
		font-size: var(--text-base);
		font-style: italic;
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
		margin: 0;
		padding: 0;
		border: none;
	}

	.logline-empty {
		display: block;
		background: none;
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-md);
		padding: var(--space-4) var(--space-5);
		font-size: var(--text-base);
		font-style: italic;
		color: var(--color-text-muted);
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition:
			color var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard),
			background-color var(--duration-base) var(--ease-standard);
	}

	.logline-empty:hover {
		color: var(--color-text-secondary);
		border-color: var(--color-border-strong);
		background: var(--color-surface-overlay);
	}

	.logline-empty:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* ─────────────────────────────────────
	   PROGRESS MODULE
	───────────────────────────────────── */
	.progress-module {
		display: flex;
		flex-direction: column;
	}

	.progress-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-5) var(--space-5);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
	}

	.progress-numbers {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.progress-stats {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.progress-count {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		letter-spacing: var(--tracking-tight);
		font-variant-numeric: tabular-nums;
		line-height: var(--leading-tight);
	}

	.progress-of {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.progress-empty-text {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-style: italic;
		margin: 0;
	}

	.progress-target-hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

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

	.progress-remaining {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
		margin: 0;
	}

	/* ─────────────────────────────────────
	   ACTION CARD
	───────────────────────────────────── */
	.action-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-5) var(--space-5);
		background: var(--color-nova-blue);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition:
			background-color var(--duration-base) var(--ease-standard),
			box-shadow var(--duration-base) var(--ease-standard);
	}

	.action-card:hover {
		background: color-mix(in srgb, var(--color-nova-blue) 88%, white);
		box-shadow: var(--shadow-md);
		text-decoration: none;
	}

	.action-card:active {
		box-shadow: var(--shadow-sm);
	}

	.action-card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring-offset);
	}

	.action-card-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.action-card-eyebrow {
		font-size: 10px;
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: rgba(255, 255, 255, 0.6);
	}

	.action-card-title {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: #fff;
		line-height: var(--leading-tight);
	}

	.action-card-context {
		font-size: var(--text-xs);
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
		line-height: var(--leading-normal);
	}

	.action-card-arrow {
		font-size: var(--text-xl);
		color: rgba(255, 255, 255, 0.8);
		flex-shrink: 0;
		transition: transform var(--duration-base) var(--ease-standard);
	}

	.action-card:hover .action-card-arrow {
		transform: translateX(4px);
	}

	/* ─────────────────────────────────────
	   METADATA PANEL
	───────────────────────────────────── */
	.metadata-panel {
		display: flex;
		flex-direction: column;
	}

	.metadata-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.metadata-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.metadata-row:last-child {
		border-bottom: none;
	}

	.meta-key {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.meta-val {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: capitalize;
		text-align: right;
	}

	/* ─────────────────────────────────────
	   RESPONSIVE
	───────────────────────────────────── */
	@media (max-width: 700px) {
		.hub-grid {
			grid-template-columns: 1fr;
		}

		.hub-secondary {
			position: static;
		}

		.story-block {
			flex-direction: column;
		}

		.cover {
			width: 100px;
		}
	}
</style>
