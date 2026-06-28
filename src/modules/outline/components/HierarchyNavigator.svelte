<script lang="ts">
	import type {
		Act,
		Arc,
		Beat,
		Chapter,
		Milestone,
		Scene,
		Stage,
	} from '$lib/db/domain-types';
	import HierarchyBreadcrumb from '$modules/project/components/HierarchyBreadcrumb.svelte';
	import {
		buildSevenLayerNavigatorModel,
		type SevenLayerNavigatorColumn,
	} from '$modules/outline/services/pipeline-seven-layer-navigator.js';
	import type {
		PipelineHierarchyLayer,
		PipelineHierarchyPath,
	} from '$modules/outline/services/seven-layer-outline.js';
	import BeatOutlineNodes from './BeatOutlineNodes.svelte';

	let {
		arcs,
		acts,
		milestones,
		chapters,
		scenes,
		beats,
		stages,
		selectionPath,
		onSelectArc,
		onSelectAct,
		onSelectMilestone,
		onSelectChapter,
		onSelectScene,
		onSelectBeat,
		onSelectStage,
		onJumpToLayer,
	} = $props<{
		arcs: Arc[];
		acts: Act[];
		milestones: Milestone[];
		chapters: Chapter[];
		scenes: Scene[];
		beats: Beat[];
		stages: Stage[];
		selectionPath: PipelineHierarchyPath;
		onSelectArc: (id: string | null) => void;
		onSelectAct: (id: string | null) => void;
		onSelectMilestone: (id: string | null) => void;
		onSelectChapter: (id: string | null) => void;
		onSelectScene: (id: string | null) => void;
		onSelectBeat: (id: string | null) => void;
		onSelectStage: (id: string | null) => void;
		onJumpToLayer: (layer: PipelineHierarchyLayer) => void;
	}>();

	const model = $derived(
		buildSevenLayerNavigatorModel({
			path: selectionPath,
			arcs,
			acts,
			milestones,
			chapters,
			scenes,
			beats,
			stages,
		}),
	);

	const crumbs = $derived(
		model.breadcrumbs.map((crumb, index) => ({
			label: crumb.label,
			onSelect:
				index < model.breadcrumbs.length - 1
					? () => {
						onJumpToLayer(crumb.layer);
					}
					: undefined,
		})),
	);

	const hasAnyRows = $derived(model.columns.some((column) => column.items.length > 0));

	function handleSelect(layer: PipelineHierarchyLayer, id: string): void {
		if (layer === 'arc') {
			onSelectArc(id);
			return;
		}
		if (layer === 'act') {
			onSelectAct(id);
			return;
		}
		if (layer === 'milestone') {
			onSelectMilestone(id);
			return;
		}
		if (layer === 'chapter') {
			onSelectChapter(id);
			return;
		}
		if (layer === 'scene') {
			onSelectScene(id);
			return;
		}
		if (layer === 'beat') {
			onSelectBeat(id);
			return;
		}
		onSelectStage(id);
	}

	function itemKey(column: SevenLayerNavigatorColumn, rowId: string): string {
		return `${column.layer}:${rowId}`;
	}

	function beatsForScene(sceneId: string): Beat[] {
		return beats.filter((beat) => beat.sceneId === sceneId);
	}
</script>

<div class="hierarchy-navigator" aria-label="Outline hierarchy navigator">
	<HierarchyBreadcrumb crumbs={crumbs} />

	{#if !hasAnyRows}
		<div class="navigator-empty">
			<h3>Outline hierarchy is empty</h3>
			<p>Create an arc to anchor acts, milestones, chapters, scenes, beats, and stages.</p>
		</div>
	{/if}

	<div class="navigator-columns" role="list" aria-label="Hierarchy layers">
		{#each model.columns as column (column.layer)}
			<section class="layer-column" role="listitem" data-layer={column.layer}>
				<header class="layer-column__header">
					<h4>{column.title}</h4>
					{#if column.selectedId !== undefined}
						<span class="layer-column__selection">Selected</span>
					{/if}
				</header>

				{#if column.items.length > 0}
					<ul class="layer-list" role="list" aria-label={column.title}>
						{#each column.items as row (itemKey(column, row.id))}
							<li>
								<button
									type="button"
									class="layer-item"
									class:is-selected={column.selectedId === row.id}
									onclick={() => handleSelect(column.layer, row.id)}
								>
									<span class="layer-item__title">{row.label}</span>
									{#if row.meta}
										<span class="layer-item__meta">{row.meta}</span>
									{/if}
								</button>
								{#if column.layer === 'scene'}
									<BeatOutlineNodes
										sceneId={row.id}
										beats={beatsForScene(row.id)}
										selectedBeatId={selectionPath.beatId}
										onSelectBeat={onSelectBeat}
									/>
								{/if}
							</li>
						{/each}
					</ul>
				{:else}
					<div class="layer-empty">
						<p class="layer-empty__title">{column.emptyTitle}</p>
						<p class="layer-empty__hint">{column.emptyHint}</p>
					</div>
				{/if}
			</section>
		{/each}
	</div>
</div>

<style>
	.hierarchy-navigator {
		display: grid;
		gap: var(--space-3);
		container-type: inline-size;
	}

	.navigator-empty {
		padding: var(--space-4);
		border: 1px dashed var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 68%, transparent);
	}

	.navigator-empty h3 {
		margin: 0;
		font-size: var(--text-sm);
	}

	.navigator-empty p {
		margin: var(--space-2) 0 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.navigator-columns {
		display: grid;
		grid-template-columns: repeat(7, minmax(12rem, 1fr));
		gap: var(--space-3);
		overflow-x: auto;
		padding-bottom: var(--space-2);
	}

	.layer-column {
		display: grid;
		align-content: start;
		gap: var(--space-2);
		padding: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 82%, transparent);
		min-height: 16rem;
	}

	.layer-column__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.layer-column__header h4 {
		margin: 0;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.layer-column__selection {
		font-size: 0.625rem;
		color: var(--color-text-muted);
		background: color-mix(in srgb, var(--color-teal) 18%, transparent);
		border-radius: var(--radius-full, 9999px);
		padding: 0 var(--space-2);
		line-height: 1.4;
	}

	.layer-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-2);
	}

	.layer-item {
		width: 100%;
		text-align: left;
		display: grid;
		gap: 0.15rem;
		padding: var(--space-2) var(--space-2);
		border: 1px solid color-mix(in srgb, var(--color-border-subtle) 88%, transparent);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-bg-elevated) 64%, transparent);
		cursor: pointer;
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			background var(--duration-fast) var(--ease-standard);
	}

	.layer-item:hover {
		border-color: var(--color-border-default);
		background: color-mix(in srgb, var(--color-bg-elevated) 76%, transparent);
	}

	.layer-item.is-selected {
		border-color: color-mix(in srgb, var(--color-teal) 72%, var(--color-border-subtle));
		background: color-mix(in srgb, var(--color-teal) 20%, transparent);
	}

	.layer-item__title {
		font-size: var(--text-xs);
		color: var(--color-text-primary);
	}

	.layer-item__meta {
		font-size: 0.7rem;
		color: var(--color-text-muted);
	}

	.layer-empty {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-1);
	}

	.layer-empty__title {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.layer-empty__hint {
		margin: 0;
		font-size: 0.72rem;
		color: var(--color-text-muted);
		line-height: 1.4;
	}

	@media (max-width: 76rem) {
		.navigator-columns {
			grid-template-columns: repeat(7, minmax(11rem, 1fr));
		}
	}

	@container (max-width: 42rem) {
		.navigator-columns {
			grid-template-columns: 1fr;
			overflow-x: visible;
			padding-bottom: 0;
		}

		.layer-column {
			min-height: auto;
		}
	}
</style>
