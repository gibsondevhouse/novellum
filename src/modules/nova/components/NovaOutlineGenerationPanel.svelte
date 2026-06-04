<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import XCircle from '@lucide/svelte/icons/x-circle';
	import { untrack } from 'svelte';
	import type { RagContextResult } from '../types.js';
	import type { OutlineContextSufficiencyResult } from '$lib/ai/pipeline/outline-context-sufficiency.js';
	import { buildRagContext } from '../services/context-hooks.js';
	import type { OutlineGenerationRunnerSuccess } from '../services/outline-generation-runner.js';
	import {
		outlineGenerationState,
		type OutlineGenerationStateStore,
	} from '../stores/outline-generation-state.svelte.js';
	import NovaOutlineDraftCheckpointCard from './NovaOutlineDraftCheckpointCard.svelte';

	type PanelState =
		| 'empty'
		| 'loading'
		| 'blocked'
		| 'ready'
		| 'running'
		| 'failed'
		| 'cancelled'
		| 'accepted'
		| 'rejected'
		| 'review-ready';

	type ContextLoader = (projectId: string) => Promise<RagContextResult>;

	interface Props {
		projectId?: string | null;
		contextLoader?: ContextLoader;
		generationState?: OutlineGenerationStateStore;
		onGenerated?: (result: OutlineGenerationRunnerSuccess) => void;
	}

	let {
		projectId = null,
		contextLoader = loadOutlineContext,
		generationState = outlineGenerationState,
		onGenerated,
	}: Props = $props();

	let loading = $state(false);
	let readiness = $state<OutlineContextSufficiencyResult | null>(null);
	let contextError = $state<string | null>(null);
	let loadRequestId = 0;

	const currentProjectId = $derived(projectId?.trim() || null);
	const missingItems = $derived.by(() => {
		if (generationState.error?.missing && generationState.error.missing.length > 0) {
			return generationState.error.missing;
		}
		return readiness?.missing ?? [];
	});
	const sourceSummary = $derived.by(() => {
		const counts = readiness?.summary.sourceCounts;
		if (!counts) return '';
		const characterCount = counts.characters + counts.acceptedCheckpointCharacters;
		const threadCount = counts.plotThreads + counts.acceptedCheckpointPlotThreads;
		return `${characterCount} characters | ${threadCount} plot threads`;
	});
	const panelState = $derived.by<PanelState>(() => {
		if (!currentProjectId) return 'empty';
		if (generationState.status === 'running') return 'running';
		if (generationState.status === 'review-ready') return 'review-ready';
		if (generationState.status === 'accepted') return 'accepted';
		if (generationState.status === 'rejected') return 'rejected';
		if (generationState.status === 'cancelled') return 'cancelled';
		if (generationState.status === 'failed') return 'failed';
		if (loading) return 'loading';
		if (contextError) return 'failed';
		if (readiness && !readiness.ok) return 'blocked';
		if (readiness?.ok) return 'ready';
		return 'loading';
	});
	const generateDisabled = $derived(
		!currentProjectId ||
			loading ||
			!readiness?.ok ||
			generationState.active ||
			panelState === 'running',
	);
	const primaryLabel = $derived(
		panelState === 'failed' && generationState.error ? 'Retry' : 'Generate',
	);
	const primaryAriaLabel = $derived(
		primaryLabel === 'Retry' ? 'Retry outline generation' : 'Generate outline proposal',
	);
	const statusLabel = $derived.by(() => {
		if (panelState === 'empty') return 'No project';
		if (panelState === 'loading') return 'Checking context';
		if (panelState === 'blocked') return 'Context needed';
		if (panelState === 'ready') return 'Ready';
		if (panelState === 'running') return 'Generating';
		if (panelState === 'cancelled') return 'Cancelled';
		if (panelState === 'accepted') return 'Accepted';
		if (panelState === 'rejected') return 'Rejected';
		if (panelState === 'review-ready') return 'Review ready';
		return 'Failed';
	});
	const detailText = $derived.by(() => {
		if (panelState === 'empty') return 'Open a project to prepare outline generation.';
		if (panelState === 'loading') return 'Checking project and worldbuilding signals before generation.';
		if (panelState === 'blocked') return 'Add the missing signals, then refresh context.';
		if (panelState === 'ready') {
			const summary = sourceSummary || 'Context is sufficient';
			return `${summary}. Generate creates a review-only checkpoint.`;
		}
		if (panelState === 'running') return 'Generating a proposed outline checkpoint. Abort leaves the project unchanged.';
		if (panelState === 'cancelled') {
			return `${generationState.error?.message ?? 'Generation was cancelled.'} Generate again when ready.`;
		}
		if (panelState === 'accepted') {
			return generationState.checkpoint
				? `Checkpoint ${generationState.checkpoint.id} was accepted from the server response. Refresh to verify current outline state.`
				: 'Outline checkpoint was accepted from the server response. Refresh to verify current outline state.';
		}
		if (panelState === 'rejected') {
			return generationState.checkpoint
				? `Checkpoint ${generationState.checkpoint.id} was rejected. Generate again when ready.`
				: 'Outline checkpoint was rejected. Generate again when ready.';
		}
		if (panelState === 'review-ready') {
			return generationState.checkpoint
				? `Checkpoint ${generationState.checkpoint.id} is ready. Review, then accept or reject below.`
				: 'A proposed outline checkpoint is ready. Review, then accept or reject below.';
		}
		const message = generationState.error?.message ?? contextError ?? 'Outline generation failed.';
		return generationState.error
			? `${message} Retry reruns the outline request.`
			: `${message} Refresh context before generating.`;
	});

	async function loadOutlineContext(projectId: string): Promise<RagContextResult> {
		return buildRagContext({
			projectId,
			activeSceneId: null,
			policy: 'outline_scope',
		});
	}

	async function loadReadiness(nextProjectId: string | null): Promise<void> {
		const requestId = ++loadRequestId;
		if (!nextProjectId) {
			loading = false;
			readiness = null;
			contextError = null;
			return;
		}

		loading = true;
		readiness = null;
		contextError = null;

		try {
			const result = await contextLoader(nextProjectId);
			if (requestId !== loadRequestId) return;
			const packet = result.aiContext?.outlineContextPacket ?? null;
			if (!packet) {
				contextError = 'Outline readiness could not be evaluated.';
				readiness = null;
				return;
			}
			readiness = packet.readiness;
		} catch (err) {
			if (requestId !== loadRequestId) return;
			contextError = err instanceof Error ? err.message : 'Failed to check outline context.';
			readiness = null;
		} finally {
			if (requestId === loadRequestId) loading = false;
		}
	}

	async function handleGenerate(): Promise<void> {
		if (generateDisabled || !currentProjectId) return;
		const result = await generationState.generate(currentProjectId);
		if (result.ok) onGenerated?.(result);
	}

	async function handlePrimaryAction(): Promise<void> {
		if (panelState === 'failed' && generationState.canRetry) {
			const result = await generationState.retry();
			if (result.ok) onGenerated?.(result);
			return;
		}
		await handleGenerate();
	}

	function handleAbort(): void {
		generationState.cancel('Outline generation cancelled.');
	}

	$effect(() => {
		const nextProjectId = currentProjectId;
		untrack(() => generationState.setProject(nextProjectId));
		void loadReadiness(nextProjectId);
		if (nextProjectId) void generationState.loadPendingCheckpoints(nextProjectId);
	});
</script>

<section
	class="outline-generation-panel"
	data-state={panelState}
	data-testid="nova-outline-generation-panel"
	aria-label="Outline generation"
	aria-busy={panelState === 'loading' || panelState === 'running'}
>
	<header class="outline-panel-header">
		<div class="outline-title-group">
			<p class="outline-eyebrow">Outline</p>
			<p class="outline-title">Generate proposal</p>
		</div>
		<span class="outline-status" data-testid="nova-outline-generation-status" role="status">
			<span class="outline-status-dot" aria-hidden="true"></span>
			{statusLabel}
		</span>
	</header>

	<p class="outline-detail" aria-live="polite">{detailText}</p>

	{#if missingItems.length > 0}
		<ul
			class="missing-list"
			data-testid="nova-outline-generation-missing"
			aria-label="Missing outline prerequisites"
		>
			{#each missingItems as item (item.code)}
				<li>{item.message}</li>
			{/each}
		</ul>
	{/if}

	<div class="outline-actions">
		<button
			type="button"
			class="outline-btn outline-btn-primary"
			data-testid="nova-outline-generation-generate"
			aria-label={primaryAriaLabel}
			disabled={generateDisabled}
			onclick={() => void handlePrimaryAction()}
		>
			<Sparkles aria-hidden="true" />
			<span>{primaryLabel}</span>
		</button>

		<button
			type="button"
			class="outline-btn"
			data-testid="nova-outline-generation-refresh"
			aria-label="Refresh outline context"
			disabled={!currentProjectId || loading || generationState.active}
			onclick={() => {
				void loadReadiness(currentProjectId);
				if (currentProjectId) void generationState.loadPendingCheckpoints(currentProjectId);
			}}
		>
			<RefreshCw aria-hidden="true" />
			<span>Refresh</span>
		</button>

		{#if panelState === 'running'}
			<button
				type="button"
				class="outline-btn outline-btn-danger"
				data-testid="nova-outline-generation-abort"
				aria-label="Abort outline generation"
				onclick={handleAbort}
			>
				<XCircle aria-hidden="true" />
				<span>Abort</span>
			</button>
		{/if}
	</div>

	{#if generationState.checkpoint}
		<NovaOutlineDraftCheckpointCard
			checkpoint={generationState.checkpoint}
			projectId={currentProjectId}
			onCheckpointUpdated={(checkpoint) => generationState.applyCheckpointActionResult(checkpoint)}
		/>
	{/if}
</section>

<style>
	.outline-generation-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-2);
		border: var(--border-width-sm) solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-ground) 82%, var(--color-surface-overlay));
	}

	.outline-panel-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-2);
		align-items: start;
	}

	.outline-title-group {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: var(--space-1);
	}

	.outline-eyebrow,
	.outline-title,
	.outline-detail,
	.missing-list {
		margin: 0;
	}

	.outline-eyebrow {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--color-text-muted) 82%, var(--color-candle));
	}

	.outline-title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
		color: var(--color-text-primary);
	}

	.outline-status {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		min-height: var(--space-6);
		padding: var(--space-1) var(--space-2);
		border: var(--border-width-sm) solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-surface-overlay) 72%, transparent);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		line-height: var(--leading-tight);
		white-space: nowrap;
	}

	.outline-status-dot {
		inline-size: var(--size-dot-small);
		block-size: var(--size-dot-small);
		border-radius: var(--radius-full);
		background: var(--color-text-muted);
	}

	.outline-generation-panel[data-state='ready'] .outline-status-dot,
	.outline-generation-panel[data-state='review-ready'] .outline-status-dot,
	.outline-generation-panel[data-state='accepted'] .outline-status-dot {
		background: var(--color-success);
	}

	.outline-generation-panel[data-state='blocked'] .outline-status-dot,
	.outline-generation-panel[data-state='failed'] .outline-status-dot,
	.outline-generation-panel[data-state='rejected'] .outline-status-dot,
	.outline-generation-panel[data-state='cancelled'] .outline-status-dot {
		background: var(--color-warning);
	}

	.outline-generation-panel[data-state='running'] .outline-status-dot,
	.outline-generation-panel[data-state='loading'] .outline-status-dot {
		background: var(--color-candle);
		animation: outline-pulse var(--duration-pulse) infinite var(--ease-editorial);
	}

	.outline-detail {
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
		color: var(--color-text-secondary);
	}

	.missing-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-2);
		border: var(--border-width-sm) solid color-mix(in srgb, var(--color-warning) 42%, transparent);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-warning) 8%, transparent);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
		list-style: none;
	}

	.missing-list li::before {
		content: '';
		display: inline-block;
		inline-size: var(--size-dot-small);
		block-size: var(--size-dot-small);
		margin-inline-end: var(--space-1);
		border-radius: var(--radius-full);
		background: var(--color-warning);
		vertical-align: middle;
	}

	.outline-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.outline-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1);
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

	.outline-btn :global(svg) {
		inline-size: var(--space-4);
		block-size: var(--space-4);
		flex: none;
	}

	.outline-btn:hover:not(:disabled) {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.outline-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.outline-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.outline-btn-primary {
		border-color: color-mix(in srgb, var(--color-candle) 72%, var(--color-border-default));
		color: var(--color-text-primary);
	}

	.outline-btn-danger {
		border-color: color-mix(in srgb, var(--color-error) 62%, var(--color-border-default));
		color: var(--color-error);
	}

	@keyframes outline-pulse {
		0%,
		80%,
		100% {
			opacity: 0.35;
			transform: scale(0.82);
		}
		40% {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
