<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import type { Beat } from '$lib/db/domain-types';
	import { reorderBeats } from '$modules/editor/services/beat-repository.js';

	let { sceneId, beats, selectedBeatId = null, onSelectBeat } = $props<{
		sceneId: string;
		beats: Beat[];
		selectedBeatId?: string | null;
		onSelectBeat: (id: string) => void;
	}>();

	let isOpen = $state(true);
	let dragId = $state<string | null>(null);
	let dragOverIndex = $state<number | null>(null);
	let orderedBeats = $state<Beat[]>([]);

	const hasBeats = $derived(orderedBeats.length > 0);

	$effect(() => {
		orderedBeats = sortBeats(beats);
	});

	function sortBeats(items: readonly Beat[]): Beat[] {
		return [...items].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
	}

	function handleDragStart(event: DragEvent, beatId: string): void {
		dragId = beatId;
		event.dataTransfer?.setData('text/plain', beatId);
	}

	async function handleDrop(index: number): Promise<void> {
		if (!dragId) return;
		const from = orderedBeats.findIndex((beat) => beat.id === dragId);
		if (from < 0 || from === index) {
			dragId = null;
			dragOverIndex = null;
			return;
		}

		const next = [...orderedBeats];
		const [item] = next.splice(from, 1);
		if (!item) return;
		next.splice(index, 0, item);
		orderedBeats = next.map((beat, order) => ({ ...beat, order }));
		await reorderBeats(
			sceneId,
			orderedBeats.map((beat) => beat.id),
		);
		dragId = null;
		dragOverIndex = null;
	}
</script>

{#if hasBeats}
	<div class="beat-outline" data-testid="beat-outline-nodes" data-scene-id={sceneId}>
		<button
			type="button"
			class="beat-outline__toggle"
			aria-expanded={isOpen}
			onclick={() => {
				isOpen = !isOpen;
			}}
		>
			{#if isOpen}
				<ChevronDown size={14} aria-hidden="true" />
			{:else}
				<ChevronRight size={14} aria-hidden="true" />
			{/if}
			<span>{orderedBeats.length} beats</span>
		</button>

		{#if isOpen}
			<ol class="beat-outline__list" aria-label="Scene beats">
				{#each orderedBeats as beat, index (beat.id)}
					<li
						class="beat-outline__item"
						class:is-drop-target={dragOverIndex === index}
						draggable="true"
						data-testid="beat-outline-node"
						data-beat-id={beat.id}
						ondragstart={(event) => handleDragStart(event, beat.id)}
						ondragover={(event) => {
							event.preventDefault();
							dragOverIndex = index;
						}}
						ondragleave={() => {
							dragOverIndex = null;
						}}
						ondrop={() => void handleDrop(index)}
					>
						<GripVertical size={13} aria-hidden="true" />
						<button
							type="button"
							class="beat-outline__select"
							class:is-selected={selectedBeatId === beat.id}
							onclick={() => onSelectBeat(beat.id)}
						>
							<span class="beat-outline__number">{index + 1}</span>
							<span class="beat-outline__title">{beat.title}</span>
						</button>
					</li>
				{/each}
			</ol>
		{/if}
	</div>
{/if}

<style>
	.beat-outline {
		display: grid;
		gap: var(--space-1);
		margin-top: var(--space-1);
		padding-left: var(--space-2);
		border-left: 1px solid color-mix(in srgb, var(--color-border-subtle) 82%, transparent);
	}

	.beat-outline__toggle,
	.beat-outline__select {
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.beat-outline__toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		width: fit-content;
		padding: var(--space-1) 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.beat-outline__list {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.beat-outline__item {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: var(--space-1);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
	}

	.beat-outline__item.is-drop-target {
		background: color-mix(in srgb, var(--color-teal) 14%, transparent);
	}

	.beat-outline__select {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: var(--space-1);
		width: 100%;
		min-width: 0;
		padding: var(--space-1);
		border-radius: var(--radius-sm);
		text-align: left;
	}

	.beat-outline__select:hover,
	.beat-outline__select.is-selected {
		background: color-mix(in srgb, var(--color-teal) 16%, transparent);
		color: var(--color-text-primary);
	}

	.beat-outline__select:focus-visible,
	.beat-outline__toggle:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.beat-outline__number {
		font-size: var(--text-xs);
		font-variant-numeric: tabular-nums;
	}

	.beat-outline__title {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: var(--text-xs);
	}
</style>
