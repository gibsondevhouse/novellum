<!--
	plan-027 stage-003 phase-003 part-002 — Scene Draft card.

	Renders a parsed `vibe-author.scene-draft` artifact (prose + sidecar)
	alongside explicit Accept / Reject / Copy controls. Accept first saves
	a durable checkpoint, then requires explicit confirmation before the
	editor bridge can apply it. Reject must persist through the callback.
-->
<script lang="ts">
	import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
	import type { AuthorSceneDraftPayload } from '$lib/ai/pipeline/author-agent.js';
	import type { AuthorDraftCheckpoint } from '$lib/ai/pipeline/author-draft-contract.js';
	import type { NovaArtifactActionResult } from '../services/artifact-action-types.js';
	import type { StageInlineSceneDraftResultData } from '../services/inline-scene-draft-actions.js';

	interface Props {
		envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>;
		onAccept?: (
			envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>,
		) => Promise<NovaArtifactActionResult<StageInlineSceneDraftResultData>>;
		onConfirmAccept?: (
			envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>,
			checkpoint: AuthorDraftCheckpoint,
			options?: { forceOverwrite?: boolean },
		) => Promise<NovaArtifactActionResult<StageInlineSceneDraftResultData>>;
		onReject?: (
			envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>,
		) => Promise<NovaArtifactActionResult<StageInlineSceneDraftResultData>>;
	}

	let { envelope, onAccept, onConfirmAccept, onReject }: Props = $props();

	type ActionState =
		| 'idle'
		| 'saving'
		| 'confirming'
		| 'applying'
		| 'stale'
		| 'accepted'
		| 'rejecting'
		| 'rejected'
		| 'blocked'
		| 'failed';

	let actionState = $state<ActionState>('idle');
	let actionMessage = $state<string | null>(null);
	let stagedCheckpoint = $state<AuthorDraftCheckpoint | null>(null);
	let copied = $state(false);

	const payload = $derived(envelope.payload);
	const sidecar = $derived(payload.sidecar);
	const actionBusy = $derived(
		actionState === 'saving' || actionState === 'applying' || actionState === 'rejecting',
	);
	const actionFinal = $derived(actionState === 'accepted' || actionState === 'rejected');
	const canStartAction = $derived(
		!actionBusy && !actionFinal && actionState !== 'confirming' && actionState !== 'stale',
	);

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

	function applyActionResult(
		result: NovaArtifactActionResult<StageInlineSceneDraftResultData>,
		successState: ActionState,
	): void {
		actionMessage = result.message;
		if (result.data?.checkpoint) stagedCheckpoint = result.data.checkpoint;

		if (result.status === 'succeeded') {
			actionState = successState;
			return;
		}

		actionState = result.status === 'stale_target' ? 'stale' : result.status === 'insufficient_context' ? 'blocked' : 'failed';
	}

	async function handleAccept(): Promise<void> {
		if (!canStartAction) return;
		if (!onAccept) {
			actionState = 'blocked';
			actionMessage = 'This draft cannot be saved for review from the current chat context.';
			return;
		}

		actionState = 'saving';
		actionMessage = null;
		const result = await onAccept(envelope);
		applyActionResult(result, 'confirming');
	}

	async function handleConfirmAccept(forceOverwrite = false): Promise<void> {
		if (!stagedCheckpoint || !onConfirmAccept || actionBusy || actionFinal) return;

		actionState = 'applying';
		actionMessage = null;
		const result = await onConfirmAccept(envelope, stagedCheckpoint, { forceOverwrite });
		applyActionResult(result, 'accepted');
	}

	function handleCancelConfirm(): void {
		actionState = 'idle';
		actionMessage = null;
		stagedCheckpoint = null;
	}

	async function handleReject(): Promise<void> {
		if (!canStartAction) return;
		if (!onReject) {
			actionState = 'blocked';
			actionMessage = 'This draft cannot be rejected from the current chat context.';
			return;
		}

		actionState = 'rejecting';
		actionMessage = null;
		const result = await onReject(envelope);
		applyActionResult(result, 'rejected');
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
			<span aria-label="POV character">POV <code>{sidecar.povCharacterId ?? 'unset'}</code></span>
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
			aria-label="Save scene draft as checkpoint for review and confirmation"
			disabled={!canStartAction}
			onclick={() => void handleAccept()}
		>
			{actionState === 'saving' ? 'Saving...' : 'Accept'}
		</button>
		<button
			type="button"
			class="scene-draft-btn scene-draft-btn-reject"
			data-testid="nova-scene-draft-reject"
			aria-label="Reject scene draft"
			disabled={!canStartAction}
			onclick={() => void handleReject()}
		>
			{actionState === 'rejecting' ? 'Rejecting...' : 'Reject'}
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
		{#if actionMessage}
			<p class="scene-draft-status" data-state={actionState} role={actionState === 'failed' || actionState === 'blocked' ? 'alert' : 'status'}>
				{actionMessage}
			</p>
		{/if}
		{#if (actionState === 'confirming' || actionState === 'applying') && stagedCheckpoint}
			<div class="scene-draft-confirm" aria-label="Confirm scene draft apply">
				<p class="scene-draft-confirm-title">Confirm apply</p>
				<p class="scene-draft-confirm-copy">
					This saved review checkpoint will replace the target scene only if server checks pass.
				</p>
				<div class="scene-draft-confirm-actions">
					<button type="button" class="scene-draft-btn" onclick={handleCancelConfirm}>
						Cancel
					</button>
					<button
						type="button"
						class="scene-draft-btn scene-draft-btn-accept"
						data-testid="nova-scene-draft-confirm-accept"
						disabled={actionBusy}
						onclick={() => void handleConfirmAccept(false)}
					>
						{actionState === 'applying' ? 'Applying...' : 'Confirm apply'}
					</button>
				</div>
			</div>
		{:else if actionState === 'stale' && stagedCheckpoint}
			<div class="scene-draft-confirm" aria-label="Scene draft stale target">
				<p class="scene-draft-confirm-title">Scene changed</p>
				<p class="scene-draft-confirm-copy">
					Review the current scene before replacing it with this saved draft.
				</p>
				<div class="scene-draft-confirm-actions">
					<button type="button" class="scene-draft-btn" onclick={handleCancelConfirm}>
						Cancel
					</button>
					<button
						type="button"
						class="scene-draft-btn scene-draft-btn-accept"
						data-testid="nova-scene-draft-force-accept"
						disabled={actionBusy}
						onclick={() => void handleConfirmAccept(true)}
					>
						Apply anyway
					</button>
				</div>
			</div>
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

	.scene-draft-status[data-state='failed'],
	.scene-draft-status[data-state='blocked'],
	.scene-draft-status[data-state='stale'] {
		color: var(--color-error);
	}

	.scene-draft-confirm {
		flex-basis: 100%;
		display: grid;
		gap: var(--space-2);
		padding: var(--space-2);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-ground);
	}

	.scene-draft-confirm-title,
	.scene-draft-confirm-copy {
		margin: 0;
		font-size: var(--text-xs);
	}

	.scene-draft-confirm-title {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.scene-draft-confirm-copy {
		color: var(--color-text-secondary);
	}

	.scene-draft-confirm-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
</style>
