<script lang="ts">
	import type { Chapter } from '$lib/db/types.js';
	import type { BeatFocus } from '../types.js';
	import {
		getProjectMetadata,
		setProjectMetadata,
	} from '$lib/project-metadata.js';

	let {
		chapter,
		onBeatSelect,
		onUpdate: _onUpdate,
	} = $props<{
		chapter: Chapter;
		onBeatSelect?: (focus: BeatFocus) => void;
		onUpdate?: (id: string, patch: Partial<Omit<Chapter, 'id' | 'createdAt'>>) => void;
	}>();

	const storageKey = $derived(`novellum_outline_chapter_beats_${chapter.id}`);

	type LocalBeat = { id: string; text: string };
	type BeatNotes = Record<string, string>;

	let beats = $state<LocalBeat[]>([]);
	let newText = $state('');
	let addInputEl = $state<HTMLInputElement | undefined>(undefined);

	$effect(() => {
		const raw = localStorage.getItem(storageKey);
		beats = raw ? (JSON.parse(raw) as LocalBeat[]) : [];
		const cid = chapter.id;
		void getProjectMetadata<LocalBeat[] | null>(
			chapter.projectId,
			'chapter',
			cid,
			'beats',
			null,
		).then((remote) => {
			if (!remote || cid !== chapter.id) return;
			beats = remote;
			try { localStorage.setItem(storageKey, JSON.stringify(remote)); } catch { /* ignore */ }
		});
	});

	function persist() {
		localStorage.setItem(storageKey, JSON.stringify(beats));
		void setProjectMetadata<LocalBeat[]>(
			chapter.projectId,
			'chapter',
			chapter.id,
			'beats',
			beats,
		);
	}

	function beatNoteWrite(beatId: string, value: string) {
		const notesKey = `novellum_outline_chapter_beat_notes_${beatId}`;
		if (value.trim()) {
			localStorage.setItem(notesKey, value);
		} else {
			localStorage.removeItem(notesKey);
		}
		// Mirror to SQLite as a beat-notes blob keyed by chapter so it travels with backups.
		const current = (() => {
			const out: BeatNotes = {};
			for (const b of beats) {
				const raw = localStorage.getItem(`novellum_outline_chapter_beat_notes_${b.id}`);
				if (raw) out[b.id] = raw;
			}
			return out;
		})();
		void setProjectMetadata<BeatNotes>(
			chapter.projectId,
			'chapter',
			chapter.id,
			'beat-notes',
			current,
		);
	}

	function addBeat() {
		const t = newText.trim();
		if (!t) return;
		beats = [...beats, { id: crypto.randomUUID(), text: t }];
		newText = '';
		persist();
	}

	function deleteBeat(id: string) {
		beats = beats.filter((b) => b.id !== id);
		persist();
	}

	function openBeat(beat: LocalBeat, index: number) {
		const notesKey = `novellum_outline_chapter_beat_notes_${beat.id}`;
		onBeatSelect?.({
			id: beat.id,
			index,
			content: beat.text,
			notes: localStorage.getItem(notesKey) ?? '',
			onUpdateContent: (content: string) => {
				beats = beats.map((b) => (b.id === beat.id ? { ...b, text: content } : b));
				persist();
			},
			onUpdateNotes: (notes: string) => {
				beatNoteWrite(beat.id, notes);
			},
		});
	}

	function handleAddKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') addBeat();
	}
	import { SurfacePanel, GhostButton } from '$lib/components/ui/index.js';
</script>

<SurfacePanel class="planning-panel">
	<!-- Sequence context bar -->
	<div class="planning-context">
		<span class="planning-context-label">Sequence</span>
		<span class="planning-context-desc"
			>Map the structural beats — the key events that must happen, in order.</span
		>
	</div>

	<!-- Beat section tray: list + add row together -->
	<div class="planning-beat-section" role="list">
		{#if beats.length > 0}
			{#each beats as beat, i (beat.id)}
				<div class="beat-item" role="listitem">
					<span class="beat-num" aria-hidden="true">{i + 1}</span>
					<GhostButton
						class="beat-text"
						type="button"
						onclick={() => openBeat(beat, i)}
						aria-label="Open beat: {beat.text}">{beat.text}</GhostButton
					>
					<GhostButton
						class="beat-del"
						type="button"
						onclick={() => deleteBeat(beat.id)}
						aria-label="Remove beat">✕</GhostButton
					>
				</div>
			{/each}
		{:else}
			<p class="planning-empty-hint">No structural beats yet.</p>
		{/if}
		<div class="planning-beat-add">
			<input
				bind:this={addInputEl}
				class="planning-beat-add-input"
				type="text"
				placeholder="Add a structural beat…"
				bind:value={newText}
				onkeydown={handleAddKeydown}
			/>
			<GhostButton
				class="planning-beat-add-btn"
				type="button"
				onclick={addBeat}
				aria-label="Add beat">+</GhostButton
			>
		</div>
	</div>
</SurfacePanel>

<style>
	/* Beat row items — layout and styling of individual beat entries */
	.beat-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
		border: 1px solid var(--color-border-subtle);
		transition:
			border-color 0.1s,
			background 0.1s;
	}

	.beat-item:hover {
		border-color: var(--color-border-default);
	}

	.beat-item:hover :global(.beat-del) {
		opacity: 1;
	}

	.beat-num {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		min-width: 18px;
		text-align: right;
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
		opacity: 0.55;
	}

	:global(.beat-text) {
		flex: 1;
		background: none;
		border: none;
		text-align: left;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 0;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: inherit;
		transition: color var(--duration-fast) var(--ease-standard);
	}

	:global(.beat-text:hover) {
		color: var(--color-text-primary);
	}

	:global(.beat-text:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-sm);
	}

	:global(.beat-del) {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: var(--text-xs);
		padding: var(--space-1);
		border-radius: var(--radius-sm);
		line-height: 1;
		flex-shrink: 0;
		opacity: 0;
		transition:
			opacity 0.1s,
			color 0.1s,
			background 0.1s;
	}

	:global(.beat-del:hover) {
		color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
	}

	:global(.beat-del:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
		opacity: 1;
	}
</style>
