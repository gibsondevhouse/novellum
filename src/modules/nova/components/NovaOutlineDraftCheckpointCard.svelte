<script lang="ts">
	import {
		OUTLINE_DRAFT_SCHEMA_VERSION,
		type OutlineDraftCheckpointRecord,
		type OutlineDraftLifecycle,
	} from '$lib/ai/pipeline/outline-draft-contract.js';
	import {
		OutlineCheckpointActionError,
		createOutlineCheckpointActions,
		type OutlineCheckpointActions,
	} from '../services/outline-checkpoint-actions.js';

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

	let returnedCheckpoint = $state<OutlineDraftCheckpointRecord | null>(null);
	let acceptState = $state<AcceptState>('idle');
	let rejectState = $state<RejectState>('idle');
	let rejectReasonDraft = $state('');
	let errorMessage = $state<string | null>(null);

	const activeCheckpoint = $derived(returnedCheckpoint ?? checkpoint);
	const lifecycleWord = $derived.by(() => {
		if (activeCheckpoint.lifecycle === 'accepted') return 'Accepted';
		if (activeCheckpoint.lifecycle === 'rejected') return 'Rejected';
		if (activeCheckpoint.lifecycle === 'draft') return 'Draft';
		return 'Proposed';
	});
	const lifecycleTitle = $derived(`${lifecycleWord} outline`);
	const versionLabel = $derived(
		activeCheckpoint.version === OUTLINE_DRAFT_SCHEMA_VERSION
			? `Schema ${activeCheckpoint.version}`
			: `Unknown schema ${activeCheckpoint.version}`,
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

	function resetActionState(): void {
		acceptState = 'idle';
		rejectState = 'idle';
		rejectReasonDraft = '';
		errorMessage = null;
	}

	$effect(() => {
		const nextCheckpoint = checkpoint;
		returnedCheckpoint = null;
		void nextCheckpoint;
		resetActionState();
	});

	function canAccept(): boolean {
		return Boolean(currentProjectId && activeCheckpoint.lifecycle === 'review' && !actionBusy);
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
			if (err.code === 'materialization_failed') {
				return 'Materialization failed and was rolled back. This proposal is still pending review; check the project state and retry accept when ready.';
			}
			if (err.code === 'stale_checkpoint') {
				return 'This proposal changed before acceptance. Refresh the checkpoint and try again.';
			}
		}
		return err instanceof Error ? err.message : fallback;
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

	function nodeLabel(kind: 'arc' | 'act' | 'chapter' | 'scene'): string {
		return `${lifecycleWord} ${kind}`;
	}

	function lifecycleChip(lifecycle: OutlineDraftLifecycle): string {
		if (lifecycle === 'review') return 'Pending review';
		return lifecycle.charAt(0).toUpperCase() + lifecycle.slice(1);
	}

	function orderLabel(order: number): string {
		return String(order + 1).padStart(2, '0');
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
				<dd><time datetime={activeCheckpoint.createdAt}>{activeCheckpoint.createdAt}</time></dd>
			</div>
			<div>
				<dt>Context</dt>
				<dd>{activeCheckpoint.draft.sourceContext.contextHash ?? 'No context hash'}</dd>
			</div>
			<div>
				<dt>Prompt</dt>
				<dd>{activeCheckpoint.draft.sourceContext.promptVersion ?? 'No prompt version'}</dd>
			</div>
			<div>
				<dt>Domains</dt>
				<dd>{includedDomains}</dd>
			</div>
			<div>
				<dt>Version</dt>
				<dd>{versionLabel}</dd>
			</div>
		</dl>
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
			<button
				type="button"
				class="draft-card-btn draft-card-btn-primary"
				data-testid="nova-outline-accept"
				aria-label="Accept proposed outline checkpoint"
				disabled={!canAccept()}
				onclick={handleBeginAccept}
			>
				{acceptState === 'accepting' ? 'Accepting...' : 'Accept'}
			</button>
			<button
				type="button"
				class="draft-card-btn draft-card-btn-danger"
				data-testid="nova-outline-reject"
				aria-label="Reject proposed outline checkpoint"
				disabled={!canReject()}
				onclick={handleBeginReject}
			>
				{rejectState === 'rejecting' ? 'Rejecting...' : 'Reject'}
			</button>
		</div>

		{#if acceptState === 'confirming'}
			<div class="action-confirm" aria-label="Accept outline confirmation">
				<p class="action-confirm-title">Confirm accept</p>
				<p class="action-confirm-copy">
					The server will materialize this proposal only if conflict and transaction checks pass.
				</p>
				<div class="action-confirm-actions">
					<button type="button" class="draft-card-btn" onclick={handleCancelAccept}>Cancel</button>
					<button
						type="button"
						class="draft-card-btn draft-card-btn-primary"
						data-testid="nova-outline-confirm-accept"
						aria-label="Confirm outline checkpoint acceptance"
						onclick={() => void handleConfirmAccept()}
					>
						Confirm accept
					</button>
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
					<button
						type="button"
						class="draft-card-btn draft-card-btn-danger"
						data-testid="nova-outline-confirm-reject"
						aria-label="Confirm outline checkpoint rejection"
						disabled={rejectReasonDraft.trim().length === 0}
						onclick={() => void handleReject()}
					>
						Confirm reject
					</button>
					<button type="button" class="draft-card-btn" onclick={handleCancelReject}>Cancel</button>
				</div>
			</div>
		{/if}
	{/if}

	<div class="outline-tree" aria-label="Proposed hierarchy">
		{#each activeCheckpoint.draft.arcs as arc (arc.id)}
			<details class="outline-node outline-node--arc" open>
				<summary>
					<span>{nodeLabel('arc')}</span>
					<strong>{orderLabel(arc.order)} {arc.title}</strong>
				</summary>
				{#if arc.summary}
					<p class="node-summary">{arc.summary}</p>
				{/if}
				{#if arc.purpose}
					<p class="node-purpose">{arc.purpose}</p>
				{/if}
				{#each arc.acts as act (act.id)}
					<details class="outline-node outline-node--act" open>
						<summary>
							<span>{nodeLabel('act')}</span>
							<strong>{orderLabel(act.order)} {act.title}</strong>
						</summary>
						{#if act.summary}
							<p class="node-summary">{act.summary}</p>
						{/if}
						{#each act.chapters as chapter (chapter.id)}
							<details class="outline-node outline-node--chapter" open>
								<summary>
									<span>{nodeLabel('chapter')}</span>
									<strong>{orderLabel(chapter.order)} {chapter.title}</strong>
								</summary>
								{#if chapter.summary}
									<p class="node-summary">{chapter.summary}</p>
								{/if}
								<div class="scene-list">
									{#each chapter.scenes as scene (scene.id)}
										<article class="scene-card" aria-label={`${nodeLabel('scene')}: ${scene.title}`}>
											<header>
												<p>{nodeLabel('scene')}</p>
												<h4>{orderLabel(scene.order)} {scene.title}</h4>
											</header>
											{#if scene.summary}
												<p class="node-summary">{scene.summary}</p>
											{/if}
											<dl class="intent-grid">
												<div>
													<dt>Goal</dt>
													<dd>{scene.intent.goal}</dd>
												</div>
												<div>
													<dt>Conflict</dt>
													<dd>{scene.intent.conflict}</dd>
												</div>
												<div>
													<dt>Turn</dt>
													<dd>{scene.intent.turn}</dd>
												</div>
												<div>
													<dt>Outcome</dt>
													<dd>{scene.intent.outcome}</dd>
												</div>
											</dl>
										</article>
									{/each}
								</div>
							</details>
						{/each}
					</details>
				{/each}
			</details>
		{/each}
	</div>
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
	.node-summary,
	.node-purpose,
	.scene-card h4,
	.scene-card header p,
	.source-counts,
	.warning-list {
		margin: 0;
	}

	.draft-card-eyebrow,
	.outline-node summary span,
	.scene-card header p,
	.source-context dt {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
	}

	.draft-card-title-group h3,
	.scene-card h4 {
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
	.action-confirm-copy,
	.node-summary,
	.node-purpose {
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
		color: var(--color-text-secondary);
	}

	.source-context dl,
	.intent-grid {
		display: grid;
		gap: var(--space-2);
		margin: 0;
	}

	.source-context dl {
		grid-template-columns: repeat(auto-fit, minmax(var(--space-16), 1fr));
	}

	.source-context dd,
	.intent-grid dd {
		margin: 0;
		color: var(--color-text-primary);
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
		overflow-wrap: anywhere;
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

	.draft-card-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--space-7);
		padding: var(--space-1) var(--space-3);
		border: var(--border-width-sm) solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
		font: inherit;
		font-size: var(--text-xs);
		line-height: var(--leading-tight);
		cursor: pointer;
	}

	.draft-card-btn:hover:not(:disabled) {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.draft-card-btn:focus-visible,
	.action-reason textarea:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.draft-card-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.draft-card-btn-primary {
		border-color: color-mix(in srgb, var(--color-candle) 72%, var(--color-border-default));
		color: var(--color-text-primary);
	}

	.draft-card-btn-danger {
		border-color: color-mix(in srgb, var(--color-error) 62%, var(--color-border-default));
		color: var(--color-error);
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

	.outline-tree,
	.scene-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.outline-node {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-2);
		border: var(--border-width-sm) solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-ground) 86%, transparent);
	}

	.outline-node summary {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-1);
		cursor: pointer;
	}

	.outline-node summary strong {
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-tight);
		overflow-wrap: anywhere;
	}

	.outline-node--act,
	.outline-node--chapter {
		margin-block-start: var(--space-2);
	}

	.scene-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-2);
		border: var(--border-width-sm) solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: var(--color-surface-overlay);
	}

	.scene-card header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.intent-grid div {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.intent-grid dt {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
	}
</style>
