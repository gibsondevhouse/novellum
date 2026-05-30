<!--
	plan-027 stage-003 phase-003 part-002 — Scene Draft card.

	Renders a parsed `vibe-author.scene-draft` artifact (prose + sidecar)
	alongside explicit Accept / Reject / Copy controls. NEVER mutates
	the manuscript directly — Accept emits an `onAccept` callback the
	editor accept-pipeline will consume in a later plan. Reject and
	Copy are local-only effects.
-->
<script lang="ts">
	import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
	import type { AuthorSceneDraftPayload } from '$lib/ai/pipeline/author-agent.js';

	interface Props {
		envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>;
		onAccept?: (envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>) => void;
		onReject?: (envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>) => void;
	}

	let { envelope, onAccept, onReject }: Props = $props();

	let acted = $state<'accepted' | 'rejected' | null>(null);
	let copied = $state(false);

	const payload = $derived(envelope.payload);
	const sidecar = $derived(payload.sidecar);

	function formatProducedAt(value: string): string {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleString();
	}

	async function handleCopy(): Promise<void> {
		try {
			if (typeof navigator !== 'undefined' && navigator.clipboard) {
				await navigator.clipboard.writeText(payload.prose);
				copied = true;
				setTimeout(() => {
					copied = false;
				}, 1500);
			}
		} catch {
			// Clipboard may be blocked; the explicit-action requirement
			// still holds — we just surface no toast on this path.
			copied = false;
		}
	}

	function handleAccept(): void {
		acted = 'accepted';
		onAccept?.(envelope);
	}

	function handleReject(): void {
		acted = 'rejected';
		onReject?.(envelope);
	}
</script>

<article
	class="scene-draft-card"
	aria-label="Author scene draft suggestion"
	data-testid="nova-scene-draft-card"
	data-task-key={envelope.taskKey}
>
	<header class="scene-draft-header">
		<h3 class="scene-draft-title">Scene draft suggestion</h3>
		<p class="scene-draft-meta">
			<span aria-label="Scene id">Scene <code>{sidecar.sceneId}</code></span>
			·
			<span aria-label="Word count">{sidecar.wordCount} words</span>
			·
			<span aria-label="POV character">POV <code>{sidecar.povCharacterId}</code></span>
		</p>
		<p class="scene-draft-provenance" aria-label="Artifact provenance">
			<span>Task <code>{envelope.taskKey}</code></span>
			·
			<span>Model <code>{envelope.model ?? 'unknown-model'}</code></span>
			·
			<span>Generated {formatProducedAt(envelope.producedAt)}</span>
		</p>
	</header>

	<section class="scene-draft-prose" aria-label="Drafted prose preview">
		<p>{payload.prose}</p>
	</section>

	{#if sidecar.uncertainties.length > 0 || sidecar.continuityRisks.length > 0}
		<details class="scene-draft-callouts">
			<summary>Author callouts</summary>
			{#if sidecar.uncertainties.length > 0}
				<p class="scene-draft-callout-label">Uncertainties</p>
				<ul class="scene-draft-callout-list">
					{#each sidecar.uncertainties as item, i (i)}
						<li>{item}</li>
					{/each}
				</ul>
			{/if}
			{#if sidecar.continuityRisks.length > 0}
				<p class="scene-draft-callout-label">Continuity risks</p>
				<ul class="scene-draft-callout-list">
					{#each sidecar.continuityRisks as item, i (i)}
						<li>{item}</li>
					{/each}
				</ul>
			{/if}
		</details>
	{/if}

	<footer class="scene-draft-actions" aria-label="Scene draft actions">
		<button
			type="button"
			class="scene-draft-btn scene-draft-btn-accept"
			data-testid="nova-scene-draft-accept"
			aria-label="Accept scene draft and emit accept event"
			disabled={acted !== null}
			onclick={handleAccept}
		>
			Accept
		</button>
		<button
			type="button"
			class="scene-draft-btn scene-draft-btn-reject"
			data-testid="nova-scene-draft-reject"
			aria-label="Reject scene draft"
			disabled={acted !== null}
			onclick={handleReject}
		>
			Reject
		</button>
		<button
			type="button"
			class="scene-draft-btn scene-draft-btn-copy"
			data-testid="nova-scene-draft-copy"
			aria-label="Copy drafted prose to clipboard"
			onclick={handleCopy}
		>
			{copied ? 'Copied' : 'Copy'}
		</button>
		{#if acted !== null}
			<p class="scene-draft-status" role="status">Marked as {acted}</p>
		{/if}
	</footer>
</article>

<style>
	.scene-draft-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		color: var(--color-text-primary);
	}

	.scene-draft-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.scene-draft-title {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}

	.scene-draft-meta {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.scene-draft-provenance {
		margin: 0;
		font-size: 11px;
		color: var(--color-text-muted);
	}

	.scene-draft-meta code {
		font-family: var(--font-mono);
		color: var(--color-text-primary);
	}

	.scene-draft-provenance code {
		font-family: var(--font-mono);
		color: var(--color-text-secondary);
	}

	.scene-draft-prose {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	.scene-draft-prose p {
		margin: 0;
		white-space: pre-wrap;
	}

	.scene-draft-callouts {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.scene-draft-callouts summary {
		cursor: pointer;
	}

	.scene-draft-callout-label {
		margin: var(--space-2) 0 var(--space-1);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.scene-draft-callout-list {
		margin: 0;
		padding-left: var(--space-3);
	}

	.scene-draft-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}

	.scene-draft-btn {
		font: inherit;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.scene-draft-btn:focus-visible {
		outline: 2px solid var(--color-candle);
		outline-offset: 2px;
	}

	.scene-draft-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.scene-draft-btn-accept {
		border-color: var(--color-candle);
	}

	.scene-draft-btn-reject {
		border-color: var(--color-error);
	}

	.scene-draft-status {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}
</style>
