<!--
	Renders a parsed `vibe-author.outline` artifact as an explicit draft.
	No outline rows are written to canon from this card.
-->
<script lang="ts">
	import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
	import type { AuthorOutline } from '$lib/ai/pipeline/author-schemas.js';

	interface Props {
		envelope: PipelineArtifactEnvelope<AuthorOutline>;
	}

	let { envelope }: Props = $props();

	let copied = $state(false);
	const payload = $derived(envelope.payload);
	const counts = $derived({
		arcs: payload.arcs.length,
		acts: payload.acts.length,
		milestones: payload.milestones.length,
		chapters: payload.chapters.length,
		scenes: payload.scenes.length,
	});

	function titleOf(value: Record<string, unknown>, fallback: string): string {
		const candidate = value.title ?? value.name ?? value.label ?? value.id;
		return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : fallback;
	}

	async function handleCopy(): Promise<void> {
		try {
			await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 1500);
		} catch {
			copied = false;
		}
	}
</script>

<article
	class="outline-card"
	aria-label="Author outline draft"
	data-testid="nova-outline-card"
	data-task-key={envelope.taskKey}
>
	<header class="outline-card__header">
		<div>
			<p class="outline-card__eyebrow">Draft artifact</p>
			<h3 class="outline-card__title">Generated outline</h3>
		</div>
		<span class="outline-card__lifecycle">{envelope.lifecycle}</span>
	</header>

	<dl class="outline-card__metrics" aria-label="Outline artifact counts">
		<div><dt>Arcs</dt><dd>{counts.arcs}</dd></div>
		<div><dt>Acts</dt><dd>{counts.acts}</dd></div>
		<div><dt>Milestones</dt><dd>{counts.milestones}</dd></div>
		<div><dt>Chapters</dt><dd>{counts.chapters}</dd></div>
		<div><dt>Scenes</dt><dd>{counts.scenes}</dd></div>
	</dl>

	{#if payload.chapters.length > 0}
		<section class="outline-card__section" aria-label="Chapter draft preview">
			<h4>Chapter pass</h4>
			<ol class="outline-card__list">
				{#each payload.chapters.slice(0, 8) as chapter, index (index)}
					<li>{titleOf(chapter, `Chapter ${index + 1}`)}</li>
				{/each}
			</ol>
			{#if payload.chapters.length > 8}
				<p class="outline-card__more">+ {payload.chapters.length - 8} more chapters in JSON payload</p>
			{/if}
		</section>
	{/if}

	<details class="outline-card__payload">
		<summary>JSON payload</summary>
		<pre>{JSON.stringify(payload, null, 2)}</pre>
	</details>

	<footer class="outline-card__actions">
		<button type="button" class="outline-card__btn" onclick={handleCopy}>
			{copied ? 'Copied' : 'Copy JSON'}
		</button>
		<p class="outline-card__note">Draft only. Nothing is applied to the outline until an accept flow is wired.</p>
	</footer>
</article>

<style>
	.outline-card {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
	}

	.outline-card__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.outline-card__eyebrow {
		margin: 0;
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.outline-card__title {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}

	.outline-card__lifecycle {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-candle);
		border: 1px solid color-mix(in srgb, var(--color-candle) 45%, var(--color-border-default));
		border-radius: var(--radius-sm);
		padding: 0 var(--space-1);
	}

	.outline-card__metrics {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: var(--space-1);
		margin: 0;
	}

	.outline-card__metrics div {
		padding: var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: var(--color-surface-ground);
	}

	.outline-card__metrics dt {
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.outline-card__metrics dd {
		margin: 0;
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
	}

	.outline-card__section h4 {
		margin: 0 0 var(--space-1);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.outline-card__list {
		margin: 0;
		padding-left: var(--space-4);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.outline-card__more,
	.outline-card__note {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.outline-card__payload {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.outline-card__payload summary {
		cursor: pointer;
	}

	.outline-card__payload pre {
		max-height: 260px;
		overflow: auto;
		margin: var(--space-2) 0 0;
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface-ground);
		white-space: pre-wrap;
	}

	.outline-card__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.outline-card__btn {
		font: inherit;
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.outline-card__btn:focus-visible {
		outline: 2px solid var(--color-candle);
		outline-offset: 2px;
	}
</style>
