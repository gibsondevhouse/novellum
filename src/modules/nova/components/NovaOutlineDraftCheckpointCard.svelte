<script lang="ts">
	import {
		OUTLINE_DRAFT_SCHEMA_VERSION,
		type OutlineDraftCheckpointRecord,
		type OutlineDraftLifecycle,
	} from '$lib/ai/pipeline/outline-draft-contract.js';
	import type { OutlineMergeNodeKey } from '$lib/ai/pipeline/outline-checkpoint-contract.js';
	import {
		OutlineCheckpointActionError,
		createOutlineCheckpointActions,
		type OutlineCheckpointActions,
	} from '../services/outline-checkpoint-actions.js';
	import {
		artifactLifecycleLabel,
		debugMetadataLabel,
		formatArtifactTimestamp,
		formatDebugValue,
	} from '../services/artifact-display.js';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/ui/SecondaryButton.svelte';
	import DestructiveButton from '$lib/components/ui/DestructiveButton.svelte';
	import OutlineMergeTree from './OutlineMergeTree.svelte';

	interface Props {
		checkpoint: OutlineDraftCheckpointRecord;
		projectId?: string | null;
		actions?: OutlineCheckpointActions;
		onCheckpointUpdated?: (checkpoint: OutlineDraftCheckpointRecord) => void;
	}

	let {
		checkpoint,
		projectId = null,
		actions = createOutlineCheckpointActions(),
		onCheckpointUpdated,
	}: Props = $props();

	type AcceptState = 'idle' | 'confirming' | 'accepting' | 'accepted' | 'conflict' | 'failed';
	type RejectState = 'idle' | 'confirming' | 'rejecting' | 'rejected' | 'failed';

	function collectDraftNodeIds(draft: OutlineDraftCheckpointRecord['draft']): OutlineMergeNodeKey[] {
		return draft.arcs.flatMap((arc) => [
			`arc:${arc.id}` as OutlineMergeNodeKey,
			...arc.acts.flatMap((act) => [
				`act:${act.id}` as OutlineMergeNodeKey,
				...act.chapters.flatMap((chapter) => [
					`chapter:${chapter.id}` as OutlineMergeNodeKey,
					...chapter.scenes.map((scene) => `scene:${scene.id}` as OutlineMergeNodeKey),
				]),
			]),
		]);
	}

	let returnedCheckpoint = $state<OutlineDraftCheckpointRecord | null>(null);
	let acceptState = $state<AcceptState>('idle');
	let rejectState = $state<RejectState>('idle');
	let rejectReasonDraft = $state('');
	let errorMessage = $state<string | null>(null);
	let selectedNodeIds = $state<OutlineMergeNodeKey[]>([]);
	const pendingReviewLabel = 'Pending review';

	const activeCheckpoint = $derived(returnedCheckpoint ?? checkpoint);
	const lifecycleWord = $derived.by(() => {
		if (activeCheckpoint.lifecycle === 'accepted') return 'Accepted';
		if (activeCheckpoint.lifecycle === 'rejected') return 'Rejected';
		if (activeCheckpoint.lifecycle === 'draft') return 'Draft';
		return 'Proposed';
	});
	const lifecycleTitle = $derived(`${lifecycleWord} outline`);
	const generatedLabel = $derived(formatArtifactTimestamp(activeCheckpoint.createdAt));
	const versionWarning = $derived(
		activeCheckpoint.version === OUTLINE_DRAFT_SCHEMA_VERSION
			? null
			: 'This proposal uses an older outline format. Review carefully before accepting.',
	);
	const includedDomains = $derived(
		activeCheckpoint.draft.sourceContext.includedDomains.length > 0
			? activeCheckpoint.draft.sourceContext.includedDomains.join(', ')
			: 'No source domains listed',
	);
	const entityCounts = $derived(
		Object.entries(activeCheckpoint.draft.sourceContext.entityCounts)
			.filter(([, count]) => count > 0)
			.map(([key, count]) => `${key}: ${count}`),
	);
	const currentProjectId = $derived(projectId?.trim() || activeCheckpoint.projectId);
	const actionBusy = $derived(acceptState === 'accepting' || rejectState === 'rejecting');
	const hasMergeSelection = $derived(selectedNodeIds.length > 0);
	const actionErrorHeading = $derived.by(() => {
		if (acceptState === 'conflict') return 'Accept blocked.';
		if (acceptState === 'failed') return 'Accept failed.';
		if (rejectState === 'failed') return 'Reject failed.';
		return null;
	});
	const validationWarnings = $derived.by(() => {
		const record = activeCheckpoint as unknown as { validationWarnings?: unknown; warnings?: unknown };
		const warnings = Array.isArray(record.validationWarnings)
			? record.validationWarnings
			: Array.isArray(record.warnings)
				? record.warnings
				: [];
		return warnings.filter((warning): warning is string => typeof warning === 'string' && warning.trim().length > 0);
	});

	function resetActionState(nextCheckpoint: OutlineDraftCheckpointRecord): void {
		acceptState = 'idle';
		rejectState = 'idle';
		rejectReasonDraft = '';
		errorMessage = null;
		selectedNodeIds = collectDraftNodeIds(nextCheckpoint.draft);
	}

	$effect(() => {
		const nextCheckpoint = checkpoint;
		returnedCheckpoint = null;
		resetActionState(nextCheckpoint);
	});

	function canAccept(): boolean {
		return Boolean(
			currentProjectId &&
				activeCheckpoint.lifecycle === 'review' &&
				hasMergeSelection &&
				!actionBusy,
		);
	}

	function canReject(): boolean {
		return Boolean(
			currentProjectId &&
				(activeCheckpoint.lifecycle === 'draft' || activeCheckpoint.lifecycle === 'review') &&
				!actionBusy,
		);
	}

	function applyReturnedCheckpoint(updated: OutlineDraftCheckpointRecord): void {
		returnedCheckpoint = updated;
		onCheckpointUpdated?.(updated);
	}

	function actionErrorMessage(err: unknown, fallback: string): string {
		if (err instanceof OutlineCheckpointActionError) {
			if (err.code === 'outline_conflict') {
				const manualConflictMessage = manualSceneConflictMessage(err.meta);
				if (manualConflictMessage) return manualConflictMessage;
			}
			if (err.code === 'materialization_failed') {
				return 'Materialization failed and was rolled back. This proposal is still pending review; check the project state and retry accept when ready.';
			}
			if (err.code === 'stale_checkpoint') {
				return 'This proposal changed before acceptance. Refresh the checkpoint and try again.';
			}
		}
		return err instanceof Error ? err.message : fallback;
	}

	function isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}

	function manualSceneConflictMessage(meta: unknown): string | null {
		if (!isRecord(meta)) return null;
		const manualSceneConflicts = meta.manualSceneConflicts;
		if (!Array.isArray(manualSceneConflicts) || manualSceneConflicts.length === 0) return null;
		const preflightMessage =
			typeof meta.preflightMessage === 'string'
				? meta.preflightMessage
				: 'Existing manuscript scene prose requires review before outline merge.';
		const sceneLabel = manualSceneConflicts.length === 1 ? 'scene has' : 'scenes have';
		return `${preflightMessage} ${manualSceneConflicts.length} ${sceneLabel} drafted content or notes.`;
	}

	function handleBeginAccept(): void {
		if (!canAccept()) return;
		errorMessage = null;
		rejectState = 'idle';
		acceptState = 'confirming';
	}

	function handleCancelAccept(): void {
		acceptState = 'idle';
		errorMessage = null;
	}

	async function handleConfirmAccept(): Promise<void> {
		if (!canAccept()) return;
		acceptState = 'accepting';
		errorMessage = null;
		try {
			const result = await actions.accept({
				projectId: currentProjectId,
				checkpoint: activeCheckpoint,
				acceptedBy: 'author',
				selectedNodeIds,
			});
			applyReturnedCheckpoint(result.checkpoint);
			acceptState = 'accepted';
		} catch (err) {
			acceptState = err instanceof OutlineCheckpointActionError && err.status === 409 ? 'conflict' : 'failed';
			errorMessage = actionErrorMessage(err, 'Accept failed.');
		}
	}

	function handleBeginReject(): void {
		if (!canReject()) return;
		errorMessage = null;
		acceptState = 'idle';
		rejectReasonDraft = '';
		rejectState = 'confirming';
	}

	function handleCancelReject(): void {
		rejectState = 'idle';
		rejectReasonDraft = '';
		errorMessage = null;
	}

	async function handleReject(): Promise<void> {
		if (!canReject()) return;
		const reason = rejectReasonDraft.trim();
		if (!reason) {
			errorMessage = 'Provide a rejection reason.';
			return;
		}
		rejectState = 'rejecting';
		errorMessage = null;
		try {
			const result = await actions.reject({
				projectId: currentProjectId,
				checkpoint: activeCheckpoint,
				rejectedBy: 'author',
				reason,
			});
			applyReturnedCheckpoint(result.checkpoint);
			rejectState = 'rejected';
		} catch (err) {
			rejectState = 'failed';
			errorMessage = actionErrorMessage(err, 'Reject failed.');
		}
	}

	function lifecycleChip(lifecycle: OutlineDraftLifecycle): string {
		if (lifecycle === 'draft') return artifactLifecycleLabel('draft');
		if (lifecycle === 'review') return pendingReviewLabel;
		return artifactLifecycleLabel(lifecycle);
	}
</script>

<article
	class="outline-draft-card"
	data-lifecycle={activeCheckpoint.lifecycle}
	data-testid="nova-outline-draft-checkpoint-card"
	aria-label={lifecycleTitle}
>
	<header class="draft-card-header">
		<div class="draft-card-title-group">
			<p class="draft-card-eyebrow">{lifecycleTitle}</p>
			<h3>{activeCheckpoint.draft.title}</h3>
		</div>
		<span class="draft-card-lifecycle">{lifecycleChip(activeCheckpoint.lifecycle)}</span>
	</header>

	<section class="source-context" aria-label="Source context">
		<p>{activeCheckpoint.draft.sourceContext.summary}</p>
		<dl>
			<div>
				<dt>Generated</dt>
				<dd><time datetime={activeCheckpoint.createdAt}>{generatedLabel}</time></dd>
			</div>
			<div>
				<dt>Domains</dt>
				<dd>{includedDomains}</dd>
			</div>
		</dl>
		<details class="source-advanced">
			<summary>Advanced details</summary>
			<dl>
				<div>
					<dt>{debugMetadataLabel('contextHash')}</dt>
					<dd>{formatDebugValue(activeCheckpoint.draft.sourceContext.contextHash)}</dd>
				</div>
				<div>
					<dt>{debugMetadataLabel('promptVersion')}</dt>
					<dd>{formatDebugValue(activeCheckpoint.draft.sourceContext.promptVersion)}</dd>
				</div>
				<div>
					<dt>{debugMetadataLabel('schemaVersion')}</dt>
					<dd>{formatDebugValue(activeCheckpoint.version)}</dd>
				</div>
			</dl>
		</details>
		{#if versionWarning}
			<p class="warning-copy">{versionWarning}</p>
		{/if}
		{#if entityCounts.length > 0}
			<ul class="source-counts" aria-label="Source entity counts">
				{#each entityCounts as count (count)}
					<li>{count}</li>
				{/each}
			</ul>
		{/if}
		{#if validationWarnings.length > 0}
			<ul class="warning-list" aria-label="Validation warnings">
				{#each validationWarnings as warning (warning)}
					<li>{warning}</li>
				{/each}
			</ul>
		{/if}
	</section>

	{#if activeCheckpoint.lifecycle === 'accepted'}
		<p class="action-status" aria-live="polite">
			Accepted outline checkpoint. The server response controls what was materialized.
			{#if activeCheckpoint.acceptance?.acceptedAt}
				<span>{activeCheckpoint.acceptance.acceptedAt}</span>
			{/if}
		</p>
	{:else if activeCheckpoint.lifecycle === 'rejected'}
		<p class="action-status" aria-live="polite">
			Rejected outline checkpoint. Generate another proposal when ready.
			{#if activeCheckpoint.rejection?.reason}
				<span>{activeCheckpoint.rejection.reason}</span>
			{/if}
		</p>
	{/if}

	{#if errorMessage}
		<p class="action-error" role="alert">
			{#if actionErrorHeading}
				<strong>{actionErrorHeading}</strong>
			{/if}
			<span>{errorMessage}</span>
		</p>
	{/if}

	{#if activeCheckpoint.lifecycle === 'review'}
		<div class="draft-card-actions" aria-label="Outline checkpoint actions">
			<PrimaryButton
				size="sm"
				data-testid="nova-outline-accept"
				aria-label="Accept proposed outline checkpoint"
				disabled={!canAccept()}
				onclick={handleBeginAccept}
			>
				{acceptState === 'accepting' ? 'Accepting...' : 'Accept'}
			</PrimaryButton>
			<DestructiveButton
				size="sm"
				data-testid="nova-outline-reject"
				aria-label="Reject proposed outline checkpoint"
				disabled={!canReject()}
				onclick={handleBeginReject}
			>
				{rejectState === 'rejecting' ? 'Rejecting...' : 'Reject'}
			</DestructiveButton>
		</div>

		{#if acceptState === 'confirming'}
			<div class="action-confirm" aria-label="Accept outline confirmation">
				<p class="action-confirm-title">Confirm accept</p>
				<p class="action-confirm-copy">
					The server will materialize this proposal only if conflict and transaction checks pass.
				</p>
				<div class="action-confirm-actions">
					<SecondaryButton size="sm" onclick={handleCancelAccept}>Cancel</SecondaryButton>
					<PrimaryButton
						size="sm"
						data-testid="nova-outline-confirm-accept"
						aria-label="Confirm outline checkpoint acceptance"
						onclick={() => void handleConfirmAccept()}
					>
						Confirm accept
					</PrimaryButton>
				</div>
			</div>
		{/if}

		{#if rejectState === 'confirming'}
			<div class="action-confirm" aria-label="Reject outline confirmation">
				<p class="action-confirm-title">Reject outline</p>
				<label class="action-reason">
					<span>Reason</span>
					<textarea
						data-testid="nova-outline-reject-reason"
						bind:value={rejectReasonDraft}
						placeholder="Why are you rejecting this outline?"
					></textarea>
				</label>
				<div class="action-confirm-actions">
					<DestructiveButton
						size="sm"
						data-testid="nova-outline-confirm-reject"
						aria-label="Confirm outline checkpoint rejection"
						disabled={rejectReasonDraft.trim().length === 0}
						onclick={() => void handleReject()}
					>
						Confirm reject
					</DestructiveButton>
					<SecondaryButton size="sm" onclick={handleCancelReject}>Cancel</SecondaryButton>
				</div>
			</div>
		{/if}
	{/if}

	<OutlineMergeTree
		draft={activeCheckpoint.draft}
		labelPrefix={lifecycleWord}
		disabled={activeCheckpoint.lifecycle !== 'review' || actionBusy}
		onSelectionChange={(nextSelectedNodeIds) => {
			selectedNodeIds = nextSelectedNodeIds;
		}}
	/>
</article>

<style>
	.outline-draft-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3);
		border: var(--border-width-sm) solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-ground) 76%, var(--color-surface-overlay));
	}

	.draft-card-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-2);
		align-items: start;
	}

	.draft-card-title-group {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: var(--space-1);
	}

	.draft-card-eyebrow,
	.draft-card-title-group h3,
	.source-context p,
	.action-status,
	.action-error,
	.action-confirm-title,
	.action-confirm-copy,
	.source-counts,
	.warning-list {
		margin: 0;
	}

	.draft-card-eyebrow,
	.source-context dt {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
	}

	.draft-card-title-group h3 {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
		color: var(--color-text-primary);
	}

	.draft-card-lifecycle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--space-6);
		padding: var(--space-1) var(--space-2);
		border: var(--border-width-sm) solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-candle) 12%, transparent);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		line-height: var(--leading-tight);
		white-space: nowrap;
	}

	.outline-draft-card[data-lifecycle='accepted'] .draft-card-lifecycle {
		background: color-mix(in srgb, var(--color-success) 14%, transparent);
		border-color: color-mix(in srgb, var(--color-success) 38%, var(--color-border-subtle));
	}

	.outline-draft-card[data-lifecycle='rejected'] .draft-card-lifecycle {
		background: color-mix(in srgb, var(--color-error) 12%, transparent);
		border-color: color-mix(in srgb, var(--color-error) 34%, var(--color-border-subtle));
	}

	.source-context {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-2);
		border: var(--border-width-sm) solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-overlay) 64%, transparent);
	}

	.source-context p,
	.action-status,
	.action-error,
	.action-confirm-copy {
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
		color: var(--color-text-secondary);
	}

	.source-context dl {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		grid-template-columns: repeat(auto-fit, minmax(var(--space-16), 1fr));
	}

	.source-context dd {
		margin: 0;
		color: var(--color-text-primary);
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
		overflow-wrap: anywhere;
	}

	.source-advanced {
		border-top: var(--border-width-sm) solid var(--color-border-subtle);
		padding-block-start: var(--space-2);
	}

	.source-advanced summary {
		width: fit-content;
		cursor: pointer;
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
	}

	.source-advanced dl {
		margin-block-start: var(--space-2);
	}

	.warning-copy {
		padding: var(--space-2);
		border: var(--border-width-sm) solid color-mix(in srgb, var(--color-warning) 32%, var(--color-border-subtle));
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-warning) 10%, transparent);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
	}

	.source-counts,
	.warning-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		padding: 0;
		list-style: none;
	}

	.source-counts li,
	.warning-list li {
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		line-height: var(--leading-tight);
	}

	.warning-list li {
		background: color-mix(in srgb, var(--color-warning) 12%, var(--color-surface-overlay));
	}

	.action-status {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-2);
		border: var(--border-width-sm) solid color-mix(in srgb, var(--color-success) 32%, var(--color-border-subtle));
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-success) 8%, transparent);
	}

	.action-error {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-2);
		border: var(--border-width-sm) solid color-mix(in srgb, var(--color-error) 38%, var(--color-border-subtle));
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-error) 8%, transparent);
		color: var(--color-error);
	}

	.action-error strong {
		color: var(--color-error);
		font-size: var(--text-xs);
		line-height: var(--leading-tight);
	}

	.draft-card-actions,
	.action-confirm-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	/* Button styles delegated to shared PrimaryButton / SecondaryButton / DestructiveButton */

	.action-reason textarea:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.action-confirm {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-2);
		border: var(--border-width-sm) solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-overlay) 72%, transparent);
	}

	.action-confirm-title,
	.action-reason span {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
		color: var(--color-text-primary);
	}

	.action-reason {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.action-reason textarea {
		min-block-size: var(--space-16);
		padding: var(--space-2);
		border: var(--border-width-sm) solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
		font: inherit;
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
		resize: vertical;
	}

</style>
