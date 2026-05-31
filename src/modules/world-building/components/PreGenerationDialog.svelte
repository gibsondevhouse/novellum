<!--
  PreGenerationDialog — pre-generation context controls for worldbuilding entity generation.

  Surfaces candidate names extracted from the project title/synopsis and lets authors
  classify each as target/avoid/neutral before generation is dispatched.

  Uses position:fixed so it overlays the viewport regardless of container stacking.
-->
<script lang="ts">
	import { GhostButton } from '$lib/components/ui/index.js';
	import type { EntityKind } from '../services/worldbuilding-generation-service.js';
	import type { GenerationContextPayload, GenerationHintIntent } from '../services/generation-context.js';
	import { extractNameCandidates } from '../services/generation-context.js';

	interface Props {
		projectId: string;
		entityKind: EntityKind;
		onsubmit: (ctx: GenerationContextPayload | undefined) => void;
		oncancel: () => void;
	}

	let { projectId, entityKind, onsubmit, oncancel }: Props = $props();

	interface CandidateHint {
		name: string;
		intent: GenerationHintIntent;
	}

	const ENTITY_LABELS: Record<EntityKind, string> = {
		character: 'Characters',
		faction: 'Factions',
		lineage: 'Lineages',
		realm: 'Realms',
		landmark: 'Landmarks',
		'lore-entry': 'Lore Entries',
		'plot-thread': 'Plot Threads',
		'timeline-event': 'Timeline Events',
	};

	let loading = $state(true);
	let candidates = $state<CandidateHint[]>([]);
	let manualInput = $state('');

	$effect(() => {
		loading = true;
		void fetch(`/api/db/projects/${projectId}`)
			.then((r) => (r.ok ? (r.json() as Promise<Record<string, unknown>>) : Promise.reject(new Error('Not found'))))
			.then((project) => {
				const title = typeof project.title === 'string' ? project.title : '';
				const synopsis = typeof project.synopsis === 'string' ? project.synopsis : '';
				const extracted = extractNameCandidates(title, synopsis);
				candidates = extracted.map((name) => ({ name, intent: 'neutral' }));
			})
			.catch(() => {
				candidates = [];
			})
			.finally(() => {
				loading = false;
			});
	});

	function setIntent(index: number, intent: GenerationHintIntent): void {
		candidates = candidates.map((c, i) => (i === index ? { ...c, intent } : c));
	}

	function addManualCandidate(): void {
		const name = manualInput.trim().slice(0, 120);
		if (!name) return;
		const alreadyExists = candidates.some((c) => c.name.toLowerCase() === name.toLowerCase());
		if (!alreadyExists) {
			candidates = [...candidates, { name, intent: 'target' }];
		}
		manualInput = '';
	}

	function handleManualKeydown(e: KeyboardEvent): void {
		if (e.key === 'Enter') {
			e.preventDefault();
			addManualCandidate();
		}
	}

	function buildContext(): GenerationContextPayload | undefined {
		const hints = candidates
			.filter((c) => c.intent !== 'neutral')
			.map((c) => ({
				name: c.name,
				intent: c.intent,
				source: 'manual' as const,
			}));
		if (hints.length === 0) return undefined;
		return { hints };
	}

	function handleSubmit(): void {
		onsubmit(buildContext());
	}

	function handleBackdropClick(): void {
		oncancel();
	}

	function handleWindowKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			e.preventDefault();
			oncancel();
		}
	}

	const entityLabel = $derived(ENTITY_LABELS[entityKind] ?? entityKind);
	const hasCandidates = $derived(candidates.length > 0);
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div
	class="pregen-backdrop"
	role="presentation"
	onclick={handleBackdropClick}
></div>

<div
	class="pregen-dialog"
	role="dialog"
	aria-modal="true"
	aria-label="Generation context for {entityLabel}"
>
	<div class="pregen-header">
		<h3 class="pregen-title">Generate {entityLabel}</h3>
		<button type="button" class="pregen-close" aria-label="Cancel" onclick={oncancel}>×</button>
	</div>

	<div class="pregen-body">
		{#if loading}
			<div class="pregen-loading" aria-live="polite">
				<div class="pregen-spinner" aria-hidden="true"></div>
				<p class="pregen-loading-label">Loading project context…</p>
			</div>
		{:else}
			<p class="pregen-hint-label">
				{#if hasCandidates}
					Optionally mark names as <strong>target</strong> (prioritize) or <strong>avoid</strong> before generating. Unset names are neutral.
				{:else}
					No candidate names found in your project title or synopsis. You can still generate, or add names below.
				{/if}
			</p>

			{#if hasCandidates}
				<ul class="pregen-candidate-list" role="list" aria-label="Candidate names">
					{#each candidates as candidate, i (candidate.name)}
						<li class="pregen-candidate">
							<span class="pregen-candidate-name">{candidate.name}</span>
							<div
								class="pregen-intent-group"
								role="group"
								aria-label="Intent for {candidate.name}"
							>
								{#each (['target', 'avoid', 'neutral'] as const) as intent (intent)}
									<button
										type="button"
										class="pregen-intent-btn"
										class:is-active={candidate.intent === intent}
										class:is-target={intent === 'target' && candidate.intent === 'target'}
										class:is-avoid={intent === 'avoid' && candidate.intent === 'avoid'}
										onclick={() => setIntent(i, intent)}
										aria-pressed={candidate.intent === intent}
									>
										{intent}
									</button>
								{/each}
							</div>
						</li>
					{/each}
				</ul>
			{/if}

			<div class="pregen-manual-row">
				<input
					type="text"
					class="pregen-manual-input"
					placeholder="Add a name…"
					bind:value={manualInput}
					onkeydown={handleManualKeydown}
					aria-label="Add a name hint"
					maxlength="120"
				/>
				<button
					type="button"
					class="pregen-manual-add"
					onclick={addManualCandidate}
					disabled={!manualInput.trim()}
				>
					Add
				</button>
			</div>
		{/if}
	</div>

	<div class="pregen-footer">
		<GhostButton type="button" onclick={oncancel}>Cancel</GhostButton>
		<button
			type="button"
			class="pregen-generate-btn"
			disabled={loading}
			onclick={handleSubmit}
		>
			Generate
		</button>
	</div>
</div>

<style>
	.pregen-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--color-surface-base) 40%, transparent);
		z-index: 100;
	}

	.pregen-dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 101;
		width: min(480px, calc(100vw - var(--space-8)));
		max-height: min(560px, calc(100vh - var(--space-8)));
		display: flex;
		flex-direction: column;
		background: var(--color-surface-ground);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
	}

	.pregen-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		flex-shrink: 0;
	}

	.pregen-title {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.pregen-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-6);
		height: var(--space-6);
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		line-height: 1;
		cursor: pointer;
	}

	.pregen-close:hover {
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
	}

	.pregen-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.pregen-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-6) 0;
	}

	.pregen-spinner {
		width: var(--space-6);
		height: var(--space-6);
		border-radius: 50%;
		border: 2px solid var(--color-border-subtle);
		border-top-color: var(--color-text-muted);
		animation: pregen-spin var(--duration-spinner) linear infinite;
	}

	@keyframes pregen-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.pregen-loading-label {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.pregen-hint-label {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}

	.pregen-candidate-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.pregen-candidate {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 30%, transparent);
	}

	.pregen-candidate-name {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		font-weight: var(--font-weight-medium);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.pregen-intent-group {
		display: flex;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.pregen-intent-btn {
		font-size: var(--text-xs);
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-subtle);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		line-height: 1.5;
		transition:
			background var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.pregen-intent-btn:hover:not(.is-active) {
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
	}

	.pregen-intent-btn.is-active {
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		border-color: var(--color-border-default);
		font-weight: var(--font-weight-semibold);
	}

	.pregen-intent-btn.is-target {
		background: color-mix(in srgb, var(--color-nova-blue) 15%, transparent);
		color: var(--color-nova-blue);
		border-color: color-mix(in srgb, var(--color-nova-blue) 40%, transparent);
	}

	.pregen-intent-btn.is-avoid {
		background: color-mix(in srgb, var(--color-warning) 12%, transparent);
		color: var(--color-text-secondary);
		border-color: color-mix(in srgb, var(--color-warning) 30%, transparent);
	}

	.pregen-manual-row {
		display: flex;
		gap: var(--space-2);
	}

	.pregen-manual-input {
		flex: 1;
		min-width: 0;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-xs);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-base);
		color: var(--color-text-primary);
		outline: none;
		font-family: inherit;
	}

	.pregen-manual-input:focus {
		border-color: var(--color-nova-blue);
	}

	.pregen-manual-add {
		flex-shrink: 0;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-xs);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
		cursor: pointer;
		font-family: inherit;
		transition: background var(--duration-fast) var(--ease-standard);
	}

	.pregen-manual-add:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.pregen-manual-add:hover:not(:disabled) {
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
	}

	.pregen-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--color-border-subtle);
		flex-shrink: 0;
	}

	.pregen-generate-btn {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		background: var(--color-nova-blue);
		color: var(--color-text-inverse, #fff);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		border: none;
		cursor: pointer;
		transition: opacity var(--duration-fast) var(--ease-standard);
	}

	.pregen-generate-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pregen-generate-btn:hover:not(:disabled) {
		opacity: 0.88;
	}
</style>
