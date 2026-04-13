<script lang="ts">
	import type { Chapter, Scene } from '$lib/db/types.js';
	import PlanningSurfaceCard from '$lib/components/planning/PlanningSurfaceCard.svelte';
	import PlanningSurfaceHeader from '$lib/components/planning/PlanningSurfaceHeader.svelte';
	import PlanningSurfaceModeSwitcher from '$lib/components/planning/PlanningSurfaceModeSwitcher.svelte';
	import PlanningSurfaceBody from '$lib/components/planning/PlanningSurfaceBody.svelte';
	import PlanningSurfaceFooter from '$lib/components/planning/PlanningSurfaceFooter.svelte';
	import FocusOverlay from '$lib/components/planning/FocusOverlay.svelte';
	import ChapterOutlineForm from './ChapterOutlineForm.svelte';
	import SceneOutlineForm from './SceneOutlineForm.svelte';
	import ChapterOutlinePanel from './ChapterOutlinePanel.svelte';
	import SceneOutlinePanel from './SceneOutlinePanel.svelte';

	export type OutlineSelection =
		| { type: 'chapter'; chapter: Chapter }
		| { type: 'scene'; scene: Scene };

	type BeatFocus = {
		id: string;
		index: number;
		content: string;
		notes: string;
		onUpdateContent: (content: string) => void;
		onUpdateNotes: (notes: string) => void;
	};

	const MODES = [
		{ key: 'overview', label: 'Overview' },
		{ key: 'outline', label: 'Outline' },
	] as const;

	type CardMode = (typeof MODES)[number]['key'];

	let {
		selection,
		topOffset = 0,
		width,
		onClose,
		onWidthChange,
		onChapterUpdate,
		onSceneUpdate,
	} = $props<{
		selection: OutlineSelection;
		topOffset?: number;
		width: number;
		onClose: () => void;
		onWidthChange: (w: number) => void;
		onChapterUpdate: (id: string, data: Partial<Omit<Chapter, 'id' | 'createdAt'>>) => void;
		onSceneUpdate: (id: string, data: Partial<Omit<Scene, 'id' | 'createdAt'>>) => void;
	}>();

	let activeMode = $state<CardMode>('overview');

	// Beat focus overlay state
	let selectedBeat = $state<BeatFocus | null>(null);
	let beatContentDraft = $state('');
	let beatNotesDraft = $state('');

	// Sync drafts when a beat is opened
	$effect(() => {
		if (selectedBeat) {
			beatContentDraft = selectedBeat.content;
			beatNotesDraft = selectedBeat.notes;
		}
	});

	// Close beat overlay when selection changes (different chapter/scene selected)
	$effect(() => {
		// Track the selection identity; close any open beat overlay on change
		const _sel = selection;
		selectedBeat = null;
	});

	function openBeat(beat: BeatFocus) {
		selectedBeat = beat;
	}

	function closeBeat() {
		if (selectedBeat) {
			if (beatContentDraft !== selectedBeat.content) {
				selectedBeat.onUpdateContent(beatContentDraft);
			}
			if (beatNotesDraft !== selectedBeat.notes) {
				selectedBeat.onUpdateNotes(beatNotesDraft);
			}
		}
		selectedBeat = null;
	}

	const accentColor = $derived(
		selection.type === 'chapter' ? 'var(--color-teal)' : 'var(--color-nova-blue)',
	);

	const typeLabel = $derived(selection.type === 'chapter' ? 'Chapter' : 'Scene');

	const editorHref = $derived(
		selection.type === 'scene'
			? `/projects/${selection.scene.projectId}/editor/${selection.scene.id}`
			: '',
	);

	function handleGlobalKeydown(e: KeyboardEvent) {
		if (e.key !== 'Escape') return;
		// If beat overlay is open, let FocusOverlay handle it (it stops propagation)
		if (selectedBeat !== null) return;
		const tag = (e.target as HTMLElement).tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA') return;
		onClose();
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<PlanningSurfaceCard {width} {topOffset} {accentColor} onResize={onWidthChange}>
	<PlanningSurfaceHeader>
		{#snippet typeindicator()}
			<span class="type-badge" class:type-badge--scene={selection.type === 'scene'}>
				{typeLabel}
			</span>
		{/snippet}

		<PlanningSurfaceModeSwitcher
			modes={[...MODES]}
			active={activeMode}
			onChange={(k) => (activeMode = k as CardMode)}
		/>

		{#snippet actions()}
			<button class="close-btn" onclick={onClose} aria-label="Close planning panel">
				<span aria-hidden="true">✕</span>
			</button>
		{/snippet}
	</PlanningSurfaceHeader>

	<PlanningSurfaceBody>
		<div role="tabpanel">
			{#if activeMode === 'overview'}
				{#if selection.type === 'chapter'}
					<ChapterOutlineForm chapter={selection.chapter} onUpdate={onChapterUpdate} />
				{:else}
					<SceneOutlineForm scene={selection.scene} onUpdate={onSceneUpdate} />
				{/if}
			{:else}
				{#if selection.type === 'chapter'}
					<ChapterOutlinePanel chapter={selection.chapter} onBeatSelect={openBeat} />
				{:else}
					<SceneOutlinePanel scene={selection.scene} onBeatSelect={openBeat} />
				{/if}
			{/if}
		</div>
	</PlanningSurfaceBody>

	<PlanningSurfaceFooter>
		{#snippet cta()}
			{#if selection.type === 'scene'}
				<a class="btn-editor" href={editorHref}>
					Open in Editor <span aria-hidden="true">→</span>
				</a>
			{:else if selection.type === 'chapter'}
				<!-- Chapter: no direct editor link — editor is scene-level -->
			{/if}
		{/snippet}
		{#snippet status()}
			<span class="storage-note">Planning fields saved locally</span>
		{/snippet}
	</PlanningSurfaceFooter>

	<!-- Beat focus overlay — positioned absolute inside card, covers it entirely -->
	<FocusOverlay open={selectedBeat !== null} onClose={closeBeat}>
		{#snippet header()}
			<div class="beat-focus-header">
				<span class="beat-focus-label">
					Beat {selectedBeat ? selectedBeat.index + 1 : ''}
				</span>
				<button class="beat-focus-close" onclick={closeBeat} aria-label="Close beat">✕</button>
			</div>
		{/snippet}
		<div class="beat-focus-body">
			<textarea
				class="beat-content-textarea"
				aria-label="Beat content"
				placeholder="What happens here? Describe the key action, reaction, or decision."
				bind:value={beatContentDraft}
			></textarea>
			<div class="beat-notes-section">
				<label class="beat-notes-label" for="beat-notes-input">Notes</label>
				<textarea
					id="beat-notes-input"
					class="beat-notes-textarea"
					placeholder="Questions, tone, subtext, open items…"
					bind:value={beatNotesDraft}
				></textarea>
			</div>
		</div>
	</FocusOverlay>
</PlanningSurfaceCard>

<style>
	/* ── Domain-specific elements only — shell is owned by PlanningSurfaceCard ── */

	.type-badge {
		font-size: 10px;
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-teal);
		opacity: 0.7;
	}

	.type-badge--scene {
		color: var(--color-nova-blue);
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		line-height: 1;
		transition:
			color var(--duration-base),
			background var(--duration-base);
	}

	.close-btn:hover {
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
	}

	.close-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.btn-editor {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-decoration: none;
		white-space: nowrap;
		transition:
			border-color var(--duration-base),
			color var(--duration-base),
			background var(--duration-base);
	}

	.btn-editor:hover {
		border-color: var(--color-nova-blue);
		color: var(--color-nova-blue);
		background: color-mix(in srgb, var(--color-nova-blue) 6%, transparent);
	}

	.btn-editor:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.storage-note {
		font-size: 10px;
		color: var(--color-text-muted);
		opacity: 0.5;
		white-space: nowrap;
	}

	/* ── Beat focus overlay content ── */

	.beat-focus-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.beat-focus-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.beat-focus-close {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		line-height: 1;
		flex-shrink: 0;
		transition: color 0.1s, background 0.1s;
	}

	.beat-focus-close:hover {
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
	}

	.beat-focus-close:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.beat-focus-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: 100%;
	}

	.beat-content-textarea {
		flex: 1;
		width: 100%;
		min-height: 120px;
		padding: var(--space-3);
		background: color-mix(in srgb, var(--color-surface-ground) 60%, var(--color-surface-overlay));
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: inherit;
		line-height: var(--leading-relaxed);
		resize: vertical;
		transition: border-color 0.15s, background 0.15s;
	}

	.beat-content-textarea:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--color-teal) 45%, transparent);
		background: color-mix(in srgb, var(--color-surface-ground) 40%, var(--color-surface-overlay));
	}

	.beat-content-textarea::placeholder {
		color: var(--color-text-muted);
		opacity: 0.55;
	}

	.beat-notes-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.beat-notes-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.07em;
	}

	.beat-notes-textarea {
		width: 100%;
		min-height: 72px;
		padding: var(--space-3);
		background: color-mix(in srgb, var(--color-surface-ground) 60%, var(--color-surface-overlay));
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: inherit;
		line-height: var(--leading-relaxed);
		resize: vertical;
		transition: border-color 0.15s, background 0.15s;
	}

	.beat-notes-textarea:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--color-teal) 45%, transparent);
		background: color-mix(in srgb, var(--color-surface-ground) 40%, var(--color-surface-overlay));
	}

	.beat-notes-textarea::placeholder {
		color: var(--color-text-muted);
		opacity: 0.55;
	}
</style>
