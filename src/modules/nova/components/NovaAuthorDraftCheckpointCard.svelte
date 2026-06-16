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
	import { reviewGateStatusLabel } from '$lib/review-gate-labels.js';
	import { toast } from '$lib/stores/toast.svelte.js';
	import { editorDirty } from '$lib/stores/editor-dirty.svelte.js';
	import { dispatchSceneContentApplied } from '$lib/events/scene-content.js';
	import { formatSceneDisplayLabel } from '../services/artifact-display.js';
	import {
		acceptSceneDraftCheckpoint,
		fetchSceneById,
		rejectSceneDraftCheckpoint,
		type AuthorDraftApiError,
	} from '../services/author-draft-api.js';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/ui/SecondaryButton.svelte';
	import DestructiveButton from '$lib/components/ui/DestructiveButton.svelte';
	import Input from '$lib/components/ui/Input.svelte';

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
	const sceneDisplayLabel = $derived(formatSceneDisplayLabel({ title: scene.title, id: scene.id }));

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
				return reviewGateStatusLabel('review');
			case 'accepted':
				return reviewGateStatusLabel('accepted');
			case 'rejected':
				return reviewGateStatusLabel('rejected');
			default:
				return reviewGateStatusLabel('none');
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
				<span>{sceneDisplayLabel}</span>
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
			<SecondaryButton size="sm" onclick={onRegenerate} disabled={!projectId || isGenerating}>
				Generate
			</SecondaryButton>
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
				<summary>Author notes</summary>
				{#if draftSidecar.usedCanonRefs.length > 0}
					<p class="checkpoint-sidecar-label">Referenced canon</p>
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
				<PrimaryButton
					size="sm"
					disabled={!canAccept()}
					onclick={handleBeginAccept}
				>
					{acceptState === 'accepting' ? 'Accepting…' : 'Accept'}
				</PrimaryButton>
				<DestructiveButton
					size="sm"
					disabled={!canReject()}
					onclick={handleBeginReject}
				>
					{rejectState === 'rejecting' ? 'Rejecting…' : 'Reject'}
				</DestructiveButton>
				<SecondaryButton
					size="sm"
					onclick={onRegenerate}
					disabled={!projectId || isGenerating || acceptState === 'accepting' || rejectState === 'rejecting'}
				>
					Regenerate
				</SecondaryButton>
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
						<SecondaryButton size="sm" onclick={handleCancelAccept}>
							Cancel
						</SecondaryButton>
						<PrimaryButton size="sm" onclick={handleConfirmAccept}>
							Apply anyway
						</PrimaryButton>
					</div>
				</div>
			{/if}

			{#if rejectState === 'confirming'}
				<div class="checkpoint-confirm" aria-label="Reject confirmation">
					<p class="checkpoint-confirm-title">Reject draft</p>
					<Input
						id="checkpoint-reject-reason"
						label="Reason"
						type="text"
						bind:value={rejectReasonDraft}
						placeholder="Why are you rejecting this draft?"
					/>
					<div class="checkpoint-confirm-actions">
						<DestructiveButton size="sm" onclick={() => void handleReject()}>
							Confirm reject
						</DestructiveButton>
						<SecondaryButton size="sm" onclick={handleCancelReject}>
							Cancel
						</SecondaryButton>
					</div>
				</div>
			{/if}
		{:else}
			<div class="checkpoint-actions">
				<SecondaryButton size="sm" onclick={onRegenerate} disabled={!projectId || isGenerating}>
					Regenerate
				</SecondaryButton>
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

	/* Button styles delegated to shared PrimaryButton / SecondaryButton / DestructiveButton */

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

	/* Reject-reason input delegated to shared Input component */
</style>
