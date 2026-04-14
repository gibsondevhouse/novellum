<script lang="ts">
	import type { Chapter } from '$lib/db/types.js';

	type BeatFocus = {
		id: string;
		index: number;
		content: string;
		notes: string;
		onUpdateContent: (content: string) => void;
		onUpdateNotes: (notes: string) => void;
	};

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

	let beats = $state<LocalBeat[]>([]);
	let newText = $state('');
	let addInputEl = $state<HTMLInputElement | undefined>(undefined);

	$effect(() => {
		const raw = localStorage.getItem(storageKey);
		beats = raw ? (JSON.parse(raw) as LocalBeat[]) : [];
	});

	function persist() {
		localStorage.setItem(storageKey, JSON.stringify(beats));
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
				if (notes.trim()) {
					localStorage.setItem(notesKey, notes);
				} else {
					localStorage.removeItem(notesKey);
				}
			},
		});
	}

	function handleAddKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') addBeat();
	}
</script>

<div class="planning-panel">
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
					<button
						class="beat-text"
						onclick={() => openBeat(beat, i)}
						aria-label="Open beat: {beat.text}">{beat.text}</button
					>
					<button class="beat-del" onclick={() => deleteBeat(beat.id)} aria-label="Remove beat"
						>✕</button
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
			<button class="planning-beat-add-btn" onclick={addBeat} aria-label="Add beat">+</button>
		</div>
	</div>
</div>

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

	.beat-item:hover .beat-del {
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

	.beat-text {
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
		transition: color 0.1s;
	}

	.beat-text:hover {
		color: var(--color-text-primary);
	}

	.beat-text:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-sm);
	}

	.beat-del {
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

	.beat-del:hover {
		color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
	}

	.beat-del:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		opacity: 1;
	}
</style>
