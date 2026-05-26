<!--
	plan-027 stage-003 phase-003 part-002 — Revision Pack card.

	Renders a parsed `vibe-author.revision-pack` artifact as a
	severity-ranked issue list with per-issue Acknowledge controls. No
	action mutates the manuscript; Acknowledge emits an `onAcknowledge`
	callback that a later plan will wire into the editor.
-->
<script lang="ts">
	import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
	import {
		AUTHOR_SEVERITY_ORDER,
		type AuthorRevisionPack,
	} from '$lib/ai/pipeline/author-schemas.js';

	interface Props {
		envelope: PipelineArtifactEnvelope<AuthorRevisionPack>;
		onAcknowledge?: (
			issueId: string,
			envelope: PipelineArtifactEnvelope<AuthorRevisionPack>,
		) => void;
	}

	let { envelope, onAcknowledge }: Props = $props();

	const payload = $derived(envelope.payload);

	let acknowledged = $state<Record<string, true>>({});

	const sortedIssues = $derived(
		[...payload.issues].sort(
			(a, b) => AUTHOR_SEVERITY_ORDER[a.severity] - AUTHOR_SEVERITY_ORDER[b.severity],
		),
	);

	function handleAcknowledge(issueId: string): void {
		acknowledged = { ...acknowledged, [issueId]: true };
		onAcknowledge?.(issueId, envelope);
	}
</script>

<article
	class="revision-pack-card"
	aria-label="Author revision pack"
	data-testid="nova-revision-pack-card"
	data-task-key={envelope.taskKey}
>
	<header class="revision-pack-header">
		<h3 class="revision-pack-title">Revision pack</h3>
		<p class="revision-pack-summary">{payload.summary}</p>
	</header>

	<ul class="revision-pack-list" aria-label="Revision issues">
		{#each sortedIssues as issue (issue.id)}
			<li
				class="revision-pack-issue"
				data-severity={issue.severity}
				data-testid="nova-revision-issue"
			>
				<header class="revision-pack-issue-header">
					<span
						class="revision-pack-severity"
						data-severity={issue.severity}
						aria-label={`Severity ${issue.severity}`}
					>
						{issue.severity}
					</span>
					<span class="revision-pack-kind">{issue.kind}</span>
					<code class="revision-pack-location">{issue.location}</code>
				</header>
				<p class="revision-pack-description">{issue.description}</p>
				<p class="revision-pack-recommendation">
					<span class="revision-pack-label">Recommendation:</span>
					{issue.recommendation}
				</p>
				<button
					type="button"
					class="revision-pack-btn"
					data-testid="nova-revision-acknowledge"
					aria-label={`Acknowledge revision issue ${issue.id}`}
					disabled={acknowledged[issue.id] === true}
					onclick={() => handleAcknowledge(issue.id)}
				>
					{acknowledged[issue.id] ? 'Acknowledged' : 'Acknowledge'}
				</button>
			</li>
		{/each}
	</ul>
</article>

<style>
	.revision-pack-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		color: var(--color-text-primary);
	}

	.revision-pack-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.revision-pack-title {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}

	.revision-pack-summary {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.revision-pack-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.revision-pack-issue {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-2);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-ground);
		font-size: var(--text-sm);
	}

	.revision-pack-issue-header {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: baseline;
	}

	.revision-pack-severity {
		text-transform: uppercase;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.04em;
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-default);
	}

	.revision-pack-severity[data-severity='critical'] {
		color: var(--color-error);
		border-color: var(--color-error);
	}

	.revision-pack-severity[data-severity='high'] {
		color: var(--color-warning);
		border-color: var(--color-warning);
	}

	.revision-pack-kind {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.revision-pack-location {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
	}

	.revision-pack-description {
		margin: 0;
	}

	.revision-pack-recommendation {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.revision-pack-label {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.revision-pack-btn {
		align-self: flex-start;
		font: inherit;
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.revision-pack-btn:focus-visible {
		outline: 2px solid var(--color-candle);
		outline-offset: 2px;
	}

	.revision-pack-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
