<!--
  PreGenerationDialog — pre-generation context controls for worldbuilding entity generation.

  Lets authors name specific entities they want profiles generated for.
  Existing project records are shown as informational context (server already prevents duplicates).

  Uses position:fixed so it overlays the viewport regardless of container stacking.
-->
<script lang="ts">
	import { GhostButton } from '$lib/components/ui/index.js';
	import type { EntityKind } from '../services/worldbuilding-generation-service.js';
	import type { GenerationContextPayload } from '../services/generation-context.js';

	interface Props {
		projectId: string;
		entityKind: EntityKind;
		onsubmit: (ctx: GenerationContextPayload | undefined) => void;
		oncancel: () => void;
	}

	let { projectId, entityKind, onsubmit, oncancel }: Props = $props();

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

	const ENTITY_SINGULAR: Record<EntityKind, string> = {
		character: 'character',
		faction: 'faction',
		lineage: 'lineage',
		realm: 'realm',
		landmark: 'landmark',
		'lore-entry': 'lore entry',
		'plot-thread': 'plot thread',
		'timeline-event': 'timeline event',
	};

	// Map entityKind to its DB endpoint (best-effort — graceful on failure)
	const ENTITY_ENDPOINT: Partial<Record<EntityKind, string>> = {
		character: '/api/db/characters',
		faction: '/api/db/factions',
	};

	let loading = $state(true);
	let existingNames = $state<string[]>([]);
	let targets = $state<string[]>([]);
	let manualInput = $state('');

	$effect(() => {
		loading = true;
		const endpoint = ENTITY_ENDPOINT[entityKind];
		const fetchPromise = endpoint
			? fetch(`${endpoint}?projectId=${encodeURIComponent(projectId)}`)
					.then((r) => (r.ok ? (r.json() as Promise<unknown[]>) : Promise.resolve([])))
					.then((rows) => {
						existingNames = (rows as Record<string, unknown>[])
							.map((c) => String(c.name ?? ''))
							.filter(Boolean);
					})
			: Promise.resolve();
		void fetchPromise
			.catch(() => { existingNames = []; })
			.finally(() => { loading = false; });
	});

	function addTarget(name: string): void {
		const n = name.trim().slice(0, 120);
		if (!n) return;
		const lower = n.toLowerCase();
		if (targets.some((t) => t.toLowerCase() === lower)) return;
		targets = [...targets, n];
		manualInput = '';
	}

	function removeTarget(name: string): void {
		targets = targets.filter((t) => t !== name);
	}

	function handleManualKeydown(e: KeyboardEvent): void {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTarget(manualInput);
		}
	}

	function buildContext(): GenerationContextPayload | undefined {
		if (targets.length === 0) return undefined;
		return {
			hints: targets.map((name) => ({
				name,
				intent: 'target' as const,
				source: 'manual' as const,
			})),
		};
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
	const singular = $derived(ENTITY_SINGULAR[entityKind] ?? entityKind);
	const generateLabel = $derived(
		targets.length === 1
			? `Generate profile for ${targets[0]}`
			: targets.length > 1
				? `Generate ${targets.length} ${entityLabel.toLowerCase()}`
				: `Generate original ${singular}s from story context`,
	);
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
				<p class="pregen-loading-label">Loading…</p>
			</div>
		{:else}
			<div class="pregen-input-section">
				<label class="pregen-input-label" for="pregen-name-input">
					Name specific {entityLabel.toLowerCase()} to generate profiles for
				</label>
				<div class="pregen-manual-row">
					<input
						id="pregen-name-input"
						type="text"
						class="pregen-manual-input"
						placeholder="Type a name and press Enter…"
						bind:value={manualInput}
						onkeydown={handleManualKeydown}
						autofocus
						maxlength="120"
					/>
					<button
						type="button"
						class="pregen-manual-add"
						onclick={() => addTarget(manualInput)}
						disabled={!manualInput.trim()}
					>
						Add
					</button>
				</div>

				{#if targets.length > 0}
					<ul class="pregen-target-list" role="list" aria-label="Names to generate">
						{#each targets as name (name)}
							<li class="pregen-target-chip">
								<span class="pregen-target-name">{name}</span>
								<button
									type="button"
									class="pregen-target-remove"
									aria-label="Remove {name}"
									onclick={() => removeTarget(name)}
								>×</button>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="pregen-empty-hint">
						Leave empty to generate original {entityLabel.toLowerCase()} grounded in your story.
					</p>
				{/if}
			</div>

			{#if existingNames.length > 0}
				<div class="pregen-existing-section" aria-label="Existing {entityLabel.toLowerCase()}">
					<span class="pregen-existing-label">Already in your story (won't be duplicated):</span>
					<span class="pregen-existing-names">{existingNames.join(', ')}</span>
				</div>
			{/if}
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
			{generateLabel}
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

	.pregen-input-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.pregen-input-label {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		font-weight: var(--font-weight-medium);
	}

	.pregen-target-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.pregen-target-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-nova-blue) 15%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-nova-blue) 40%, transparent);
	}

	.pregen-target-name {
		font-size: var(--text-xs);
		color: var(--color-nova-blue);
		font-weight: var(--font-weight-medium);
	}

	.pregen-target-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		border: none;
		background: transparent;
		color: var(--color-nova-blue);
		font-size: var(--text-sm);
		line-height: 1;
		cursor: pointer;
		opacity: 0.7;
		padding: 0;
	}

	.pregen-target-remove:hover {
		opacity: 1;
	}

	.pregen-empty-hint {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-style: italic;
	}

	.pregen-existing-section {
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 40%, transparent);
		border: 1px solid var(--color-border-subtle);
		font-size: var(--text-xs);
		line-height: var(--leading-relaxed);
	}

	.pregen-existing-label {
		color: var(--color-text-muted);
		margin-right: var(--space-1);
	}

	.pregen-existing-names {
		color: var(--color-text-secondary);
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
