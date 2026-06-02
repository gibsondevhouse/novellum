<!--
	Plan-038 — Author Draft Engine v1 (Outline → Scene Drafts → Explicit Apply)

	Review card for a single Scene + its best AuthorDraftCheckpoint (if any).
	Explicit user actions only:
	- Accept: applies checkpoint prose to scenes.content via server validation gates.
	- Reject: marks checkpoint rejected with a reason (retained in project_metadata).
	- Regenerate: creates a new checkpoint and supersedes any active draft/review.
-->
<script lang="ts">
	import type { Scene } from '$lib/db/domain-types.js';
	import type { AuthorDraftCheckpoint } from '$lib/ai/pipeline/author-draft-contract.js';
	import { toast } from '$lib/stores/toast.svelte.js';
	import { editorDirty } from '$lib/stores/editor-dirty.svelte.js';
	import { dispatchSceneContentApplied } from '$lib/events/scene-content.js';
	import {
		acceptSceneDraftCheckpoint,
		fetchSceneById,
		rejectSceneDraftCheckpoint,
		type AuthorDraftApiError,
	} from '../services/author-draft-api.js';

	interface Props {
		projectId: string | null;
		scene: Scene;
		checkpoint: AuthorDraftCheckpoint | null;
		isGenerating?: boolean;
		onRegenerate?: () => void;
		onCheckpointUpdated?: (checkpoint: AuthorDraftCheckpoint) => void;
	}

	let {
		projectId,
		scene,
		checkpoint,
		isGenerating = false,
		onRegenerate,
		onCheckpointUpdated,
	}: Props = $props();

	type AcceptState = 'idle' | 'confirming' | 'accepting' | 'stale' | 'accepted' | 'failed';
	type RejectState = 'idle' | 'confirming' | 'rejecting' | 'rejected' | 'failed';

	let acceptState = $state<AcceptState>('idle');
	let rejectState = $state<RejectState>('idle');
	let rejectReasonDraft = $state('');
	let errorMessage = $state<string | null>(null);
	let pendingForceOverwrite = $state(false);

	function computeWordCount(html: string): number {
		const normalized = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').trim();
		if (!normalized) return 0;
		return normalized.split(/\s+/).filter(Boolean).length;
	}

	const existingWordCount = $derived.by(() => {
		if (typeof scene.wordCount === 'number' && Number.isFinite(scene.wordCount)) return Math.max(0, scene.wordCount);
		return computeWordCount(scene.content ?? '');
	});

	const hasExistingContent = $derived(existingWordCount > 0);

	const draftWordCount = $derived(checkpoint?.artifactEnvelope.wordCount ?? 0);
	const draftProse = $derived(checkpoint?.artifactEnvelope.prose ?? '');
	const draftSidecar = $derived(checkpoint?.artifactEnvelope.sidecar ?? null);

	const isSuperseded = $derived(
		Boolean(checkpoint?.lifecycle === 'rejected' && checkpoint.rejectReason === 'Superseded by regeneration'),
	);

	const isGenerationFailed = $derived(
		Boolean(
			checkpoint?.lifecycle === 'rejected' &&
				typeof checkpoint.rejectReason === 'string' &&
				checkpoint.rejectReason.startsWith('Generation failed:'),
		),
	);

	const overwriteSummary = $derived.by(() => {
		if (!hasExistingContent) return 'Will create new content';
		return `Will replace existing content (${existingWordCount} words)`;
	});

	const editorConflict = $derived.by(() => {
		if (!editorDirty.sceneId) return false;
		return editorDirty.sceneId === scene.id && editorDirty.isDirty;
	});

	function resetUiState(): void {
		acceptState = 'idle';
		rejectState = 'idle';
		errorMessage = null;
		pendingForceOverwrite = false;
	}

	$effect(() => {
		// Reset per-scene confirmation UI whenever the checkpoint changes.
		const _checkpointId = checkpoint?.id;
		resetUiState();
	});

	function canAccept(): boolean {
		if (!projectId) return false;
		if (!checkpoint) return false;
		if (checkpoint.lifecycle !== 'review') return false;
		if (acceptState === 'accepting') return false;
		return true;
	}

	function canReject(): boolean {
		if (!projectId) return false;
		if (!checkpoint) return false;
		if (checkpoint.lifecycle !== 'review') return false;
		if (rejectState === 'rejecting') return false;
		return true;
	}

	function handleBeginAccept(): void {
		errorMessage = null;
		if (!canAccept()) return;

		// Mandatory safety: never overwrite existing work or dirty editor state without explicit confirmation.
		if (hasExistingContent || editorConflict) {
			acceptState = 'confirming';
			return;
		}

		void applyAccept(false);
	}

	async function applyAccept(forceOverwrite: boolean): Promise<void> {
		if (!projectId || !checkpoint) return;
		acceptState = 'accepting';
		errorMessage = null;

		try {
			const { checkpoint: updated } = await acceptSceneDraftCheckpoint(projectId, checkpoint.id, scene.id, {
				forceOverwrite,
			});
			onCheckpointUpdated?.(updated);

			const updatedScene = await fetchSceneById(scene.id);
			dispatchSceneContentApplied({
				projectId,
				sceneId: scene.id,
				content: updatedScene.content ?? '',
				wordCount: updatedScene.wordCount ?? 0,
				updatedAt: updatedScene.updatedAt,
			});

			acceptState = 'accepted';
			toast('Applied draft to scene.', 'success');
		} catch (err) {
			const apiErr = err as Partial<AuthorDraftApiError> | Error;
			const status = typeof (apiErr as { status?: unknown }).status === 'number' ? (apiErr as { status: number }).status : null;
			const code = typeof (apiErr as { code?: unknown }).code === 'string' ? (apiErr as { code: string }).code : null;

			if (status === 409 && code === 'stale_target') {
				acceptState = 'stale';
				pendingForceOverwrite = true;
				errorMessage = 'This scene changed since the draft was generated. Review before overwriting.';
				return;
			}

			acceptState = 'failed';
			errorMessage = apiErr instanceof Error ? apiErr.message : 'Accept failed.';
		}
	}

	function handleConfirmAccept(): void {
		if (!canAccept()) return;
		const force = pendingForceOverwrite || acceptState === 'stale';
		void applyAccept(force);
	}

	function handleCancelAccept(): void {
		acceptState = 'idle';
		pendingForceOverwrite = false;
	}

	function handleBeginReject(): void {
		errorMessage = null;
		if (!canReject()) return;
		rejectReasonDraft = '';
		rejectState = 'confirming';
	}

	async function handleReject(): Promise<void> {
		if (!projectId || !checkpoint) return;
		const reason = rejectReasonDraft.trim();
		if (!reason) {
			errorMessage = 'Provide a reject reason.';
			return;
		}
		rejectState = 'rejecting';
		errorMessage = null;
		try {
			const { checkpoint: updated } = await rejectSceneDraftCheckpoint(projectId, checkpoint.id, reason);
			onCheckpointUpdated?.(updated);
			rejectState = 'rejected';
			toast('Rejected draft checkpoint.', 'success');
		} catch (err) {
			rejectState = 'failed';
			errorMessage = err instanceof Error ? err.message : 'Reject failed.';
		}
	}

	function handleCancelReject(): void {
		rejectState = 'idle';
		rejectReasonDraft = '';
	}

	function lifecycleLabel(value: AuthorDraftCheckpoint['lifecycle'] | 'none'): string {
		switch (value) {
			case 'review':
				return 'Draft ready';
			case 'accepted':
				return 'Accepted';
			case 'rejected':
				return 'Rejected';
			default:
				return 'No draft';
		}
	}

	function prosePreview(text: string): string {
		const trimmed = text.trim();
		if (trimmed.length <= 600) return trimmed;
		return `${trimmed.slice(0, 600)}…`;
	}
</script>

<article class="checkpoint-card" aria-label="Scene draft checkpoint" data-testid="author-draft-checkpoint-card">
	<header class="checkpoint-header">
		<div class="checkpoint-identity">
			<p class="checkpoint-title">{scene.title?.trim() || 'Untitled scene'}</p>
			<p class="checkpoint-meta">
				<span>Scene <code>{scene.id}</code></span>
				·
				<span>{overwriteSummary}</span>
				{#if checkpoint}
					·
					<span>Draft {draftWordCount} words</span>
				{/if}
			</p>
		</div>

		<div class="checkpoint-status" data-lifecycle={checkpoint?.lifecycle ?? 'none'}>
			{#if isGenerating}
				<span class="status-chip status-chip-running">Generating…</span>
			{:else}
				<span class="status-chip">{lifecycleLabel(checkpoint?.lifecycle ?? 'none')}</span>
			{/if}
		</div>
	</header>

	{#if !checkpoint}
		<p class="checkpoint-muted">No draft for this scene yet.</p>
		<div class="checkpoint-actions">
			<button type="button" class="checkpoint-btn checkpoint-btn-secondary" onclick={onRegenerate} disabled={!projectId || isGenerating}>
				Generate
			</button>
		</div>
	{:else}
		{#if isGenerationFailed}
			<p class="checkpoint-error" aria-live="polite">{checkpoint.rejectReason}</p>
		{:else if checkpoint.lifecycle === 'rejected' && checkpoint.rejectReason}
			<p class="checkpoint-muted" aria-live="polite">
				{isSuperseded ? 'Superseded by regeneration.' : checkpoint.rejectReason}
			</p>
		{/if}

		{#if checkpoint.lifecycle === 'accepted'}
			<p class="checkpoint-muted" aria-live="polite">Applied to scene.</p>
		{/if}

		{#if draftProse.trim().length > 0}
			<section class="checkpoint-prose" aria-label="Draft prose preview">
				<p>{prosePreview(draftProse)}</p>
			</section>
		{/if}

		{#if draftSidecar && (draftSidecar.uncertainties.length > 0 || draftSidecar.continuityRisks.length > 0 || draftSidecar.usedCanonRefs.length > 0)}
			<details class="checkpoint-sidecar">
				<summary>Sidecar</summary>
				{#if draftSidecar.usedCanonRefs.length > 0}
					<p class="checkpoint-sidecar-label">Used canon refs</p>
					<ul class="checkpoint-sidecar-list">
						{#each draftSidecar.usedCanonRefs as item, i (i)}
							<li>{item}</li>
						{/each}
					</ul>
				{/if}
				{#if draftSidecar.uncertainties.length > 0}
					<p class="checkpoint-sidecar-label">Uncertainties</p>
					<ul class="checkpoint-sidecar-list">
						{#each draftSidecar.uncertainties as item, i (i)}
							<li>{item}</li>
						{/each}
					</ul>
				{/if}
				{#if draftSidecar.continuityRisks.length > 0}
					<p class="checkpoint-sidecar-label">Continuity risks</p>
					<ul class="checkpoint-sidecar-list">
						{#each draftSidecar.continuityRisks as item, i (i)}
							<li>{item}</li>
						{/each}
					</ul>
				{/if}
			</details>
		{/if}

		{#if errorMessage}
			<p class="checkpoint-error" role="alert">{errorMessage}</p>
		{/if}

		{#if checkpoint.lifecycle === 'review'}
			<div class="checkpoint-actions" aria-label="Draft actions">
				<button
					type="button"
					class="checkpoint-btn checkpoint-btn-primary"
					disabled={!canAccept()}
					onclick={handleBeginAccept}
				>
					{acceptState === 'accepting' ? 'Accepting…' : 'Accept'}
				</button>
				<button
					type="button"
					class="checkpoint-btn checkpoint-btn-danger"
					disabled={!canReject()}
					onclick={handleBeginReject}
				>
					{rejectState === 'rejecting' ? 'Rejecting…' : 'Reject'}
				</button>
				<button
					type="button"
					class="checkpoint-btn checkpoint-btn-secondary"
					onclick={onRegenerate}
					disabled={!projectId || isGenerating || acceptState === 'accepting' || rejectState === 'rejecting'}
				>
					Regenerate
				</button>
			</div>

			{#if acceptState === 'confirming' || acceptState === 'stale'}
				<div class="checkpoint-confirm" aria-label="Overwrite confirmation">
					<p class="checkpoint-confirm-title">Confirm apply</p>
					<ul class="checkpoint-confirm-list">
						{#if editorConflict}
							<li>Editor has unsaved changes for this scene.</li>
						{/if}
						{#if hasExistingContent}
							<li>This will replace the existing scene content.</li>
						{/if}
						{#if acceptState === 'stale'}
							<li>The scene changed since this draft was generated.</li>
						{/if}
					</ul>
					<div class="checkpoint-confirm-actions">
						<button
							type="button"
							class="checkpoint-btn checkpoint-btn-secondary"
							onclick={handleCancelAccept}
						>
							Cancel
						</button>
						<button type="button" class="checkpoint-btn checkpoint-btn-primary" onclick={handleConfirmAccept}>
							Apply anyway
						</button>
					</div>
				</div>
			{/if}

			{#if rejectState === 'confirming'}
				<div class="checkpoint-confirm" aria-label="Reject confirmation">
					<p class="checkpoint-confirm-title">Reject draft</p>
					<label class="checkpoint-reason">
						<span class="checkpoint-reason-label">Reason</span>
						<input
							class="checkpoint-reason-input"
							type="text"
							bind:value={rejectReasonDraft}
							placeholder="Why are you rejecting this draft?"
						/>
					</label>
					<div class="checkpoint-confirm-actions">
						<button type="button" class="checkpoint-btn checkpoint-btn-danger" onclick={() => void handleReject()}>
							Confirm reject
						</button>
						<button type="button" class="checkpoint-btn checkpoint-btn-secondary" onclick={handleCancelReject}>
							Cancel
						</button>
					</div>
				</div>
			{/if}
		{:else}
			<div class="checkpoint-actions">
				<button type="button" class="checkpoint-btn checkpoint-btn-secondary" onclick={onRegenerate} disabled={!projectId || isGenerating}>
					Regenerate
				</button>
			</div>
		{/if}
	{/if}
</article>

<style>
	.checkpoint-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		color: var(--color-text-primary);
	}

	.checkpoint-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.checkpoint-title {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}

	.checkpoint-meta {
		margin: 0;
		font-size: 11px;
		color: var(--color-text-secondary);
	}

	.checkpoint-meta code {
		font-family: var(--font-mono);
		color: var(--color-text-secondary);
	}

	.status-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-ground);
		font-size: 11px;
		color: var(--color-text-secondary);
		white-space: nowrap;
	}

	.status-chip-running {
		border-color: color-mix(in srgb, var(--color-candle) 60%, var(--color-border-default));
		color: var(--color-text-primary);
	}

	.checkpoint-muted {
		margin: 0;
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.checkpoint-error {
		margin: 0;
		font-size: 12px;
		color: var(--color-error);
	}

	.checkpoint-prose {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	.checkpoint-prose p {
		margin: 0;
		white-space: pre-wrap;
	}

	.checkpoint-sidecar {
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.checkpoint-sidecar summary {
		cursor: pointer;
		user-select: none;
	}

	.checkpoint-sidecar-label {
		margin: var(--space-2) 0 var(--space-1);
		font-size: 11px;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.checkpoint-sidecar-list {
		margin: 0;
		padding-left: var(--space-3);
	}

	.checkpoint-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}

	.checkpoint-btn {
		font: inherit;
		padding: 6px 10px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.checkpoint-btn:focus-visible {
		outline: 2px solid var(--color-candle);
		outline-offset: 2px;
	}

	.checkpoint-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.checkpoint-btn-primary {
		border-color: color-mix(in srgb, var(--color-candle) 72%, var(--color-border-default));
	}

	.checkpoint-btn-secondary {
		color: var(--color-text-secondary);
	}

	.checkpoint-btn-danger {
		border-color: color-mix(in srgb, var(--color-error) 70%, var(--color-border-default));
	}

	.checkpoint-confirm {
		padding: var(--space-2);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-ground) 92%, var(--color-surface-overlay));
		border: 1px solid color-mix(in srgb, var(--color-border-default) 70%, transparent);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.checkpoint-confirm-title {
		margin: 0;
		font-size: 12px;
		font-weight: var(--font-weight-semibold);
	}

	.checkpoint-confirm-list {
		margin: 0;
		padding-left: var(--space-3);
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.checkpoint-confirm-actions {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		flex-wrap: wrap;
	}

	.checkpoint-reason {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.checkpoint-reason-label {
		font-size: 11px;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.checkpoint-reason-input {
		font: inherit;
		padding: 8px 10px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
	}
</style>
