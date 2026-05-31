<!--
  GeneratedEntityModal — review overlay for AI-generated entity drafts.

  Reads the generation-draft store. When reviewing:
    - Single draft: shows a summary card + Save / Discard
    - Batch drafts: shows a list with checkboxes + "Save selected" / "Discard all"

  On save: calls the appropriate /api/db/* endpoint for each selected draft,
  then calls invalidateAll() so the page load function refreshes the entity list.

  On discard: resets the store to idle.
-->
<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { GhostButton } from '$lib/components/ui/index.js';
	import {
		getPhase,
		getEntityKind,
		getDrafts,
		getSelectedIndexes,
		getErrorMessage,
		getProjectId,
		getProjectContext,
		hasWarning,
		toggleDraftSelect,
		resetGeneration,
		abortGeneration,
		startGeneration,
	} from '../stores/generation-draft.svelte.js';
	import { getProjectMetadata, setProjectMetadata } from '$lib/project-metadata.js';
	import type { EntityKind } from '../services/worldbuilding-generation-service.js';
	import type {
		WorldbuildCharacterDraft,
		WorldbuildFactionDraft,
		WorldbuildLineageDraft,
		WorldbuildLocationDraft,
		WorldbuildLoreEntryDraft,
		WorldbuildPlotThreadDraft,
		WorldbuildTimelineEventDraft,
	} from '$lib/ai/pipeline/worldbuild-agent.js';

	const phase = $derived(getPhase());
	const entityKind = $derived(getEntityKind());
	const drafts = $derived(getDrafts());
	const selectedIndexes = $derived(getSelectedIndexes());
	const errorMessage = $derived(getErrorMessage());
	const projectId = $derived(getProjectId());
	const projectContext = $derived(getProjectContext());
	const contextWarning = $derived(hasWarning());

	const visible = $derived(phase !== 'idle');
	const isBatch = $derived(drafts.length > 1);

	let saving = $state(false);
	let saveError = $state<string | null>(null);

	// ── Entity label helpers ───────────────────────────────────────────────

	const ENTITY_LABELS: Record<EntityKind, string> = {
		character: 'Character',
		faction: 'Faction',
		lineage: 'Lineage',
		realm: 'Realm',
		landmark: 'Landmark',
		'lore-entry': 'Lore Entry',
		'plot-thread': 'Plot Thread',
		'timeline-event': 'Timeline Event',
	};

	const entityLabel = $derived(entityKind ? ENTITY_LABELS[entityKind] : '');

	// ── Draft display ──────────────────────────────────────────────────────

	function draftName(draft: unknown): string {
		const d = draft as Record<string, unknown>;
		return (
			(typeof d.name === 'string' ? d.name : null) ??
			(typeof d.title === 'string' ? d.title : null) ??
			'Untitled'
		);
	}

	function draftSummary(draft: unknown): string {
		const d = draft as Record<string, unknown>;
		const parts: string[] = [];
		if (d.role && typeof d.role === 'string') parts.push(d.role);
		if (d.type && typeof d.type === 'string') parts.push(d.type);
		if (d.lineageType && typeof d.lineageType === 'string') parts.push(d.lineageType);
		if (d.category && typeof d.category === 'string') parts.push(d.category);
		if (d.status && typeof d.status === 'string') parts.push(d.status);
		return parts.join(' · ');
	}

	function draftBody(draft: unknown): string {
		const d = draft as Record<string, unknown>;
		return (
			(typeof d.bio === 'string' ? d.bio : null) ??
			(typeof d.description === 'string' ? d.description : null) ??
			(typeof d.content === 'string' ? d.content : null) ??
			(typeof d.summary === 'string' ? d.summary : null) ??
			''
		);
	}

	function draftTags(draft: unknown): string[] {
		const d = draft as Record<string, unknown>;
		if (Array.isArray(d.tags)) return (d.tags as string[]).slice(0, 4);
		return [];
	}

	type LineageRecord = {
		id: string;
		name: string;
		lineageType?: string;
		summary?: string;
		origin?: string;
		regionHomeland?: string;
		currentStatus?: string;
		foundingOrigin?: string;
		inheritedValues?: string;
		relationships: Array<Record<string, string>>;
	};

	type LineageMap = Record<string, LineageRecord>;

	function normalizeRealmType(value: string | null | undefined): 'physical' | 'metaphysical' | 'political' | 'hybrid' {
		const normalized = value?.trim().toLowerCase();
		if (normalized === 'physical') return 'physical';
		if (normalized === 'metaphysical') return 'metaphysical';
		if (normalized === 'political') return 'political';
		if (normalized === 'hybrid') return 'hybrid';
		const genre = projectContext?.genre?.toLowerCase() ?? '';
		if (
			genre.includes('fantasy') ||
			genre.includes('magic') ||
			genre.includes('supernatural') ||
			genre.includes('myth')
		) {
			return 'metaphysical';
		}
		if (
			genre.includes('political') ||
			genre.includes('war') ||
			genre.includes('intrigue')
		) {
			return 'political';
		}
		if (
			genre.includes('science fiction') ||
			genre.includes('sci-fi') ||
			genre.includes('space') ||
			genre.includes('cyberpunk')
		) {
			return 'hybrid';
		}
		return 'physical';
	}

	function createLineageId(): string {
		if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
			return crypto.randomUUID();
		}
		return `lineage-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
	}

	function buildLineageRecord(draft: WorldbuildLineageDraft): LineageRecord {
		return {
			id: createLineageId(),
			name: draft.name || 'New Lineage',
			lineageType: draft.lineageType || '',
			summary: draft.summary || '',
			origin: draft.origin || '',
			regionHomeland: draft.regionHomeland || '',
			currentStatus: draft.currentStatus || '',
			foundingOrigin: draft.foundingOrigin || '',
			inheritedValues: draft.inheritedValues || '',
			relationships: [],
		};
	}

	async function saveLineageDraft(draft: WorldbuildLineageDraft, pid: string): Promise<void> {
		const existing = await getProjectMetadata<LineageMap>(pid, 'project', pid, 'lineages', {});
		const record = buildLineageRecord(draft);
		const next: LineageMap = {
			...existing,
			[record.id]: record,
		};

		await setProjectMetadata<LineageMap>(pid, 'project', pid, 'lineages', next);

		if (typeof window !== 'undefined') {
			try {
				window.localStorage.setItem(`novellum.lineages.workspace:${pid}`, JSON.stringify(next));
			} catch {
				/* ignore */
			}

			window.dispatchEvent(
				new CustomEvent('novellum:lineages-updated', {
					detail: {
						projectId: pid,
						lineagesById: next,
						createdLineageId: record.id,
					},
				}),
			);
		}
	}

	// ── Save logic ─────────────────────────────────────────────────────────

	async function saveDraft(draft: unknown, kind: EntityKind, pid: string): Promise<void> {
		if (kind === 'character') {
			const ch = draft as WorldbuildCharacterDraft;
			await fetch('/api/db/characters', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId: pid,
					name: ch.name || 'New Character',
					role: ch.role || '',
					bio: ch.bio || '',
					faction: ch.faction || '',
					coreDesire: ch.coreDesire || '',
					fear: ch.fear || '',
					contradiction: ch.contradiction || '',
					strength: ch.strength || '',
					flaw: ch.flaw || '',
					storyRole: ch.storyRole || '',
					externalGoal: ch.externalGoal || '',
					internalNeed: ch.internalNeed || '',
					stakes: ch.stakes || '',
					voiceSummary: ch.voiceSummary || '',
					speechPattern: ch.speechPattern || '',
					traits: ch.traits || [],
					goals: ch.goals || [],
					flaws: ch.flaws || [],
					tags: ch.tags || [],
					notes: ch.notes || '',
					pronunciation: '',
					aliases: [],
					diasporaOrigin: '',
					photoUrl: '',
					anomalies: [],
					arcs: [],
				}),
			}).then(async (res) => {
				if (!res.ok) throw new Error(await res.text());
			});
		} else if (kind === 'faction') {
			const f = draft as WorldbuildFactionDraft;
			await fetch('/api/db/factions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId: pid,
					name: f.name || 'New Faction',
					type: f.type || '',
					description: f.description || '',
					mission: f.mission || '',
					ideology: f.ideology || '',
				}),
			}).then(async (res) => {
				if (!res.ok) throw new Error(await res.text());
			});
		} else if (kind === 'lineage') {
			const lineageDraft = draft as WorldbuildLineageDraft;
			await saveLineageDraft(lineageDraft, pid);
		} else if (kind === 'realm' || kind === 'landmark') {
			const loc = draft as WorldbuildLocationDraft;
			await fetch('/api/db/locations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId: pid,
					name: loc.name || (kind === 'realm' ? 'New Realm' : 'New Landmark'),
					description: loc.description || '',
					tags: loc.tags || [],
					kind,
					realmType: kind === 'realm' ? normalizeRealmType(loc.realmType) : '',
					realmId: kind === 'landmark' ? (loc.realmId ?? '') : '',
				}),
			}).then(async (res) => {
				if (!res.ok) throw new Error(await res.text());
			});
		} else if (kind === 'lore-entry') {
			const le = draft as WorldbuildLoreEntryDraft;
			await fetch('/api/db/lore_entries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId: pid,
					title: le.title || 'New Lore Entry',
					category: le.category || '',
					content: le.content || '',
					tags: le.tags || [],
				}),
			}).then(async (res) => {
				if (!res.ok) throw new Error(await res.text());
			});
		} else if (kind === 'plot-thread') {
			const pt = draft as WorldbuildPlotThreadDraft;
			await fetch('/api/db/plot_threads', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId: pid,
					title: pt.title || 'New Plot Thread',
					description: pt.description || '',
					status: pt.status || 'planned',
					relatedSceneIds: [],
					relatedCharacterIds: [],
				}),
			}).then(async (res) => {
				if (!res.ok) throw new Error(await res.text());
			});
		} else if (kind === 'timeline-event') {
			const te = draft as WorldbuildTimelineEventDraft;
			await fetch('/api/db/timeline_events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId: pid,
					title: te.title || 'New Timeline Event',
					description: te.description || '',
					date: te.date || '',
					relatedCharacterIds: [],
					relatedSceneIds: [],
				}),
			}).then(async (res) => {
				if (!res.ok) throw new Error(await res.text());
			});
		}
	}

	async function handleSave(): Promise<void> {
		if (!entityKind || !projectId || saving) return;
		saving = true;
		saveError = null;

		const toSave = isBatch
			? drafts.filter((_, i) => selectedIndexes.has(i))
			: [drafts[0]];

		try {
			for (const draft of toSave) {
				await saveDraft(draft, entityKind, projectId);
			}
			resetGeneration();
			await invalidateAll();
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Save failed. Please try again.';
		} finally {
			saving = false;
		}
	}

	function handleDiscard(): void {
		resetGeneration();
	}

	function handleAbort(): void {
		abortGeneration();
	}

	async function handleRetry(): Promise<void> {
		if (!entityKind || !projectId) return;
		await startGeneration(projectId, entityKind, drafts.length > 1 ? 3 : 1);
	}
</script>

{#if visible}
	<!-- backdrop -->
	<div
		class="gen-modal-backdrop"
		role="presentation"
		onclick={() => {
			if (phase === 'reviewing' || phase === 'error') handleDiscard();
		}}
	></div>

	<div
		class="gen-modal"
		role="dialog"
		aria-modal="true"
		aria-label={`Generate ${entityLabel}`}
	>
		<!-- header -->
		<div class="gen-modal-header">
			<h3 class="gen-modal-title">
				{#if phase === 'generating'}
					Generating {entityLabel}{isBatch ? 's' : ''}…
				{:else if phase === 'reviewing'}
					{isBatch ? `${drafts.length} ${entityLabel} Suggestions` : `${entityLabel} Draft`}
				{:else if phase === 'error'}
					Generation Failed
				{/if}
			</h3>

			{#if phase !== 'generating'}
				<button
					type="button"
					class="gen-modal-close"
					aria-label="Discard and close"
					onclick={handleDiscard}
				>×</button>
			{/if}
		</div>

		<!-- context warning -->
		{#if contextWarning && phase === 'reviewing'}
			<div class="gen-modal-warning" role="note">
				<span class="gen-modal-warning-icon" aria-hidden="true">!</span>
				No logline or synopsis yet — suggestions are generic. Add them in project settings for better results.
			</div>
		{/if}

		<!-- body -->
		<div class="gen-modal-body">
			{#if phase === 'generating'}
				<div class="gen-modal-loading">
					<div class="gen-modal-spinner" aria-hidden="true"></div>
					<p class="gen-modal-loading-label">Crafting suggestions from your project…</p>
					<GhostButton type="button" onclick={handleAbort} class="gen-abort-btn">Abort</GhostButton>
				</div>
			{:else if phase === 'reviewing'}
				<ul class="gen-draft-list" role="list">
					{#each drafts as draft, i (i)}
						{@const name = draftName(draft)}
						{@const summary = draftSummary(draft)}
						{@const body = draftBody(draft)}
						{@const tags = draftTags(draft)}
						<li class="gen-draft-card" class:gen-draft-card--selected={selectedIndexes.has(i)}>
							{#if isBatch}
								<label class="gen-draft-check" aria-label="Select {name}">
									<input
										type="checkbox"
										checked={selectedIndexes.has(i)}
										onchange={() => toggleDraftSelect(i)}
									/>
									<span class="gen-draft-checkmark" aria-hidden="true"></span>
								</label>
							{/if}
							<div class="gen-draft-content">
								<div class="gen-draft-name-row">
									<strong class="gen-draft-name">{name}</strong>
									{#if summary}
										<span class="gen-draft-summary">{summary}</span>
									{/if}
								</div>
								{#if body}
									<p class="gen-draft-body">{body}</p>
								{/if}
								{#if tags.length > 0}
									<div class="gen-draft-tags" aria-label="Tags">
										{#each tags as tag (tag)}
											<span class="gen-draft-tag">{tag}</span>
										{/each}
									</div>
								{/if}
							</div>
						</li>
					{/each}
				</ul>

				{#if saveError}
					<p class="gen-save-error" role="alert">{saveError}</p>
				{/if}
			{:else if phase === 'error'}
				<div class="gen-error-body">
					<p class="gen-error-msg">{errorMessage}</p>
				</div>
			{/if}
		</div>

		<!-- footer actions -->
		{#if phase === 'reviewing'}
			<div class="gen-modal-footer">
				<GhostButton type="button" onclick={handleDiscard}>Discard all</GhostButton>
				<button
					type="button"
					class="gen-save-btn"
					disabled={saving || (isBatch && selectedIndexes.size === 0)}
					onclick={() => void handleSave()}
				>
					{#if saving}
						Saving…
					{:else if isBatch}
						Save selected ({selectedIndexes.size})
					{:else}
						Save {entityLabel}
					{/if}
				</button>
			</div>
		{:else if phase === 'error'}
			<div class="gen-modal-footer">
				<GhostButton type="button" onclick={handleDiscard}>Dismiss</GhostButton>
				<button type="button" class="gen-save-btn" onclick={() => void handleRetry()}>
					Try again
				</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.gen-modal-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--color-surface-base) 40%, transparent);
		z-index: 100;
	}

	.gen-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 101;
		width: min(520px, calc(100vw - var(--space-8)));
		max-height: min(600px, calc(100vh - var(--space-8)));
		display: flex;
		flex-direction: column;
		background: var(--color-surface-ground);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
	}

	.gen-modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		flex-shrink: 0;
	}

	.gen-modal-title {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.gen-modal-close {
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

	.gen-modal-close:hover {
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
	}

	.gen-modal-warning {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: color-mix(in srgb, var(--color-warning) 10%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--color-warning) 25%, transparent);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.gen-modal-warning-icon {
		flex-shrink: 0;
		width: var(--space-4);
		height: var(--space-4);
		border-radius: 50%;
		background: color-mix(in srgb, var(--color-warning) 30%, transparent);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.gen-modal-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: var(--space-3) var(--space-4);
	}

	/* ── Loading state ── */

	.gen-modal-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-6) 0;
	}

	.gen-modal-spinner {
		width: var(--space-6);
		height: var(--space-6);
		border-radius: 50%;
		border: 2px solid var(--color-border-subtle);
		border-top-color: var(--color-text-muted);
		animation: spin var(--duration-spinner) linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.gen-modal-loading-label {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	/* ── Draft list ── */

	.gen-draft-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.gen-draft-card {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 30%, transparent);
		transition: border-color var(--duration-fast) var(--ease-standard);
	}

	.gen-draft-card--selected {
		border-color: color-mix(in srgb, var(--color-nova-blue) 50%, var(--color-border-subtle));
		background: color-mix(in srgb, var(--color-nova-blue) 6%, var(--color-surface-overlay));
	}

	.gen-draft-check {
		display: flex;
		align-items: flex-start;
		flex-shrink: 0;
		cursor: pointer;
		padding-top: 2px;
	}

	.gen-draft-check input[type='checkbox'] {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.gen-draft-checkmark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--space-4);
		height: var(--space-4);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-xs);
		background: var(--color-surface-base);
		flex-shrink: 0;
		transition:
			background var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.gen-draft-check input:checked ~ .gen-draft-checkmark {
		background: var(--color-nova-blue);
		border-color: var(--color-nova-blue);
	}

	.gen-draft-check input:checked ~ .gen-draft-checkmark::after {
		content: '✓';
		font-size: 9px;
		color: var(--color-text-inverse, #fff);
		line-height: 1;
	}

	.gen-draft-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.gen-draft-name-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.gen-draft-name {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.gen-draft-summary {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.gen-draft-body {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		/* clamp to 3 lines */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}

	.gen-draft-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.gen-draft-tag {
		display: inline-flex;
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		background: var(--color-surface-overlay);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		line-height: 1.5;
	}

	/* ── Error state ── */

	.gen-error-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--space-6) 0;
	}

	.gen-error-msg {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		text-align: center;
	}

	/* ── Footer ── */

	.gen-modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--color-border-subtle);
		flex-shrink: 0;
	}

	.gen-save-btn {
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

	.gen-save-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.gen-save-btn:hover:not(:disabled) {
		opacity: 0.88;
	}

	.gen-save-error {
		margin: var(--space-2) 0 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}
</style>
