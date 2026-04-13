<script lang="ts">
	import type { Beat } from '$lib/db/types.js';
	import {
		getBeatsBySceneId,
		createBeat,
		updateBeat,
		removeBeat,
		reorderBeats,
	} from '$modules/editor/services/beat-repository.js';
	import BeatItem from './BeatItem.svelte';

	type BeatFocus = {
		id: string;
		index: number;
		content: string;
		notes: string;
		onUpdateContent: (content: string) => void;
		onUpdateNotes: (notes: string) => void;
	};

	let { sceneId, projectId, onSelectBeat } = $props<{
		sceneId: string;
		projectId: string;
		/** Called when a beat is selected — passes a BeatFocus with title, notes, and update callbacks. */
		onSelectBeat?: (focus: BeatFocus) => void;
	}>();

	let beats = $state<Beat[]>([]);
	let newText = $state('');
	let dragId = $state<string | null>(null);
	let dragOverIdx = $state<number | null>(null);

	$effect(() => {
		const id = sceneId;
		getBeatsBySceneId(id).then((b) => (beats = b));
	});

	async function addBeat() {
		const t = newText.trim();
		if (!t) return;
		const beat = await createBeat({
			sceneId,
			projectId,
			title: t,
			type: 'action',
			order: beats.length,
			notes: '',
		});
		beats = [...beats, beat];
		newText = '';
	}

	async function handleDelete(id: string) {
		await removeBeat(id);
		beats = beats.filter((b) => b.id !== id);
	}

	function handleSelectBeat(beat: Beat, index: number) {
		onSelectBeat?.({
			id: beat.id,
			index,
			content: beat.title,
			notes: beat.notes ?? '',
			onUpdateContent: (content: string) => {
				// Optimistic local update + DB persist
				beats = beats.map((b) => (b.id === beat.id ? { ...b, title: content } : b));
				updateBeat(beat.id, { title: content });
			},
			onUpdateNotes: (notes: string) => {
				beats = beats.map((b) => (b.id === beat.id ? { ...b, notes } : b));
				updateBeat(beat.id, { notes });
			},
		});
	}

	function onDragStart(e: DragEvent, id: string) {
		dragId = id;
		e.dataTransfer?.setData('text/plain', id);
	}

	async function onDrop(i: number) {
		if (dragId === null) return;
		const from = beats.findIndex((b) => b.id === dragId);
		if (from === i) {
			dragId = null;
			dragOverIdx = null;
			return;
		}
		const arr = [...beats];
		const [item] = arr.splice(from, 1);
		arr.splice(i, 0, item);
		beats = arr;
		await reorderBeats(
			sceneId,
			arr.map((b) => b.id),
		);
		dragId = null;
		dragOverIdx = null;
	}
</script>

<div class="planning-beat-section" role="list">
	{#each beats as beat, i (beat.id)}
		<div
			class="beat-slot"
			class:drag-over={dragOverIdx === i}
			role="listitem"
			ondragover={(e) => {
				e.preventDefault();
				dragOverIdx = i;
			}}
			ondragleave={() => (dragOverIdx = null)}
			ondrop={() => onDrop(i)}
		>
			<BeatItem {beat} index={i} onDelete={handleDelete} onSelect={(b) => handleSelectBeat(b, i)} {onDragStart} />
		</div>
	{/each}
	<div class="planning-beat-add">
		<input
			class="planning-beat-add-input"
			type="text"
			placeholder="Add beat…"
			bind:value={newText}
			onkeydown={(e) => e.key === 'Enter' && addBeat()}
		/>
		<button class="planning-beat-add-btn" onclick={addBeat}>+</button>
	</div>
</div>

<style>
	/* Beat slot: drag-and-drop container only */
	.beat-slot {
		border-radius: var(--radius-sm);
		transition: background-color var(--duration-base);
	}

	.beat-slot.drag-over {
		background: var(--color-selection);
	}
</style>
