<script lang="ts">
	import type {
		OutlineDraft,
		OutlineDraftAct,
		OutlineDraftArc,
		OutlineDraftChapter,
		OutlineDraftScene,
	} from '$lib/ai/pipeline/outline-draft-contract.js';
	import type {
		OutlineMergeNodeKey,
		OutlineMergeNodeKind,
	} from '$lib/ai/pipeline/outline-checkpoint-contract.js';

	interface Props {
		draft: OutlineDraft;
		labelPrefix?: string;
		disabled?: boolean;
		onSelectionChange?: (selectedNodeIds: OutlineMergeNodeKey[]) => void;
	}

	let {
		draft,
		labelPrefix = 'Proposed',
		disabled = false,
		onSelectionChange,
	}: Props = $props();

	type DescendantKeyMap = Partial<Record<OutlineMergeNodeKey, OutlineMergeNodeKey[]>>;

	let selectedNodeIds = $derived<OutlineMergeNodeKey[]>(collectDraftNodeKeys(draft));

	const selectedCount = $derived(selectedNodeIds.length);
	const descendantKeyMap = $derived.by(() => buildDescendantKeyMap(draft));

	function nodeKey(kind: OutlineMergeNodeKind, id: string): OutlineMergeNodeKey {
		return `${kind}:${id}`;
	}

	function nodeDomId(kind: OutlineMergeNodeKind, id: string): string {
		return `outline-merge-${kind}-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
	}

	function nodeLabel(kind: OutlineMergeNodeKind): string {
		return `${labelPrefix} ${kind}`;
	}

	function orderLabel(order: number): string {
		return String(order + 1).padStart(2, '0');
	}

	function sceneKeys(scene: OutlineDraftScene): OutlineMergeNodeKey[] {
		return [nodeKey('scene', scene.id)];
	}

	function chapterKeys(chapter: OutlineDraftChapter): OutlineMergeNodeKey[] {
		return [
			nodeKey('chapter', chapter.id),
			...chapter.scenes.flatMap((scene) => sceneKeys(scene)),
		];
	}

	function actKeys(act: OutlineDraftAct): OutlineMergeNodeKey[] {
		return [nodeKey('act', act.id), ...act.chapters.flatMap((chapter) => chapterKeys(chapter))];
	}

	function arcKeys(arc: OutlineDraftArc): OutlineMergeNodeKey[] {
		return [nodeKey('arc', arc.id), ...arc.acts.flatMap((act) => actKeys(act))];
	}

	function collectDraftNodeKeys(nextDraft: OutlineDraft): OutlineMergeNodeKey[] {
		return nextDraft.arcs.flatMap((arc) => arcKeys(arc));
	}

	function buildDescendantKeyMap(nextDraft: OutlineDraft): DescendantKeyMap {
		const map: DescendantKeyMap = {};
		for (const arc of nextDraft.arcs) {
			map[nodeKey('arc', arc.id)] = arcKeys(arc);
			for (const act of arc.acts) {
				map[nodeKey('act', act.id)] = actKeys(act);
				for (const chapter of act.chapters) {
					map[nodeKey('chapter', chapter.id)] = chapterKeys(chapter);
					for (const scene of chapter.scenes) {
						map[nodeKey('scene', scene.id)] = sceneKeys(scene);
					}
				}
			}
		}
		return map;
	}

	function hasSelectedDescendant(
		nextSelection: readonly OutlineMergeNodeKey[],
		ancestor: OutlineMergeNodeKey,
	): boolean {
		return (descendantKeyMap[ancestor] ?? [])
			.filter((candidate) => candidate !== ancestor)
			.some((candidate) => nextSelection.includes(candidate));
	}

	function removeEmptyAncestors(
		nextSelection: readonly OutlineMergeNodeKey[],
		ancestors: readonly OutlineMergeNodeKey[],
	): OutlineMergeNodeKey[] {
		let filteredSelection = [...nextSelection];
		for (const ancestor of [...ancestors].reverse()) {
			if (!hasSelectedDescendant(filteredSelection, ancestor)) {
				filteredSelection = filteredSelection.filter((key) => key !== ancestor);
			}
		}
		return filteredSelection;
	}

	function addKeys(
		currentSelection: readonly OutlineMergeNodeKey[],
		keys: readonly OutlineMergeNodeKey[],
	): OutlineMergeNodeKey[] {
		const nextSelection = [...currentSelection];
		for (const key of keys) {
			if (!nextSelection.includes(key)) {
				nextSelection.push(key);
			}
		}
		return nextSelection;
	}

	function toggleNode(
		keys: readonly OutlineMergeNodeKey[],
		ancestors: readonly OutlineMergeNodeKey[],
		checked: boolean,
	): void {
		let nextSelection = [...selectedNodeIds];
		if (checked) {
			nextSelection = addKeys(nextSelection, [...ancestors, ...keys]);
		} else {
			nextSelection = nextSelection.filter((key) => !keys.includes(key));
			nextSelection = removeEmptyAncestors(nextSelection, ancestors);
		}
		selectedNodeIds = nextSelection;
	}

	function isSelected(key: OutlineMergeNodeKey): boolean {
		return selectedNodeIds.includes(key);
	}

	$effect(() => {
		onSelectionChange?.([...selectedNodeIds]);
	});
</script>

<section class="outline-merge-tree" aria-label="Selectable outline merge tree">
	<header class="merge-tree-header">
		<p>Selective merge</p>
		<span data-testid="outline-merge-selected-count">{selectedCount} selected</span>
	</header>

	<div class="merge-tree-list">
		{#each draft.arcs as arc (arc.id)}
			<div class="merge-node merge-node--arc">
				<label class="merge-node-label" for={nodeDomId('arc', arc.id)}>
					<input
						id={nodeDomId('arc', arc.id)}
						type="checkbox"
						checked={isSelected(nodeKey('arc', arc.id))}
						{disabled}
						data-testid={`outline-merge-checkbox-arc-${arc.id}`}
						data-node-id={nodeKey('arc', arc.id)}
						onchange={(event) =>
							toggleNode(arcKeys(arc), [], (event.currentTarget as HTMLInputElement).checked)}
					/>
					<span>{nodeLabel('arc')}</span>
					<strong>{orderLabel(arc.order)} {arc.title}</strong>
				</label>
				{#if arc.summary}
					<p class="node-summary">{arc.summary}</p>
				{/if}
				{#if arc.purpose}
					<p class="node-summary">{arc.purpose}</p>
				{/if}

				{#each arc.acts as act (act.id)}
					<div class="merge-node merge-node--act">
						<label class="merge-node-label" for={nodeDomId('act', act.id)}>
							<input
								id={nodeDomId('act', act.id)}
								type="checkbox"
								checked={isSelected(nodeKey('act', act.id))}
								{disabled}
								data-testid={`outline-merge-checkbox-act-${act.id}`}
								data-node-id={nodeKey('act', act.id)}
								onchange={(event) =>
									toggleNode(
										actKeys(act),
										[nodeKey('arc', arc.id)],
										(event.currentTarget as HTMLInputElement).checked,
									)}
							/>
							<span>{nodeLabel('act')}</span>
							<strong>{orderLabel(act.order)} {act.title}</strong>
						</label>
						{#if act.summary}
							<p class="node-summary">{act.summary}</p>
						{/if}

						{#each act.chapters as chapter (chapter.id)}
							<div class="merge-node merge-node--chapter">
								<label class="merge-node-label" for={nodeDomId('chapter', chapter.id)}>
									<input
										id={nodeDomId('chapter', chapter.id)}
										type="checkbox"
										checked={isSelected(nodeKey('chapter', chapter.id))}
										{disabled}
										data-testid={`outline-merge-checkbox-chapter-${chapter.id}`}
										data-node-id={nodeKey('chapter', chapter.id)}
										onchange={(event) =>
											toggleNode(
												chapterKeys(chapter),
												[nodeKey('arc', arc.id), nodeKey('act', act.id)],
												(event.currentTarget as HTMLInputElement).checked,
											)}
									/>
									<span>{nodeLabel('chapter')}</span>
									<strong>{orderLabel(chapter.order)} {chapter.title}</strong>
								</label>
								{#if chapter.summary}
									<p class="node-summary">{chapter.summary}</p>
								{/if}

								<div class="scene-list">
									{#each chapter.scenes as scene (scene.id)}
										<article class="merge-node merge-node--scene">
											<label class="merge-node-label" for={nodeDomId('scene', scene.id)}>
												<input
													id={nodeDomId('scene', scene.id)}
													type="checkbox"
													checked={isSelected(nodeKey('scene', scene.id))}
													{disabled}
													data-testid={`outline-merge-checkbox-scene-${scene.id}`}
													data-node-id={nodeKey('scene', scene.id)}
													onchange={(event) =>
														toggleNode(
															sceneKeys(scene),
															[
																nodeKey('arc', arc.id),
																nodeKey('act', act.id),
																nodeKey('chapter', chapter.id),
															],
															(event.currentTarget as HTMLInputElement).checked,
														)}
												/>
												<span>{nodeLabel('scene')}</span>
												<strong>{orderLabel(scene.order)} {scene.title}</strong>
											</label>
											{#if scene.summary}
												<p class="node-summary">{scene.summary}</p>
											{/if}
											<dl class="intent-grid">
												<div>
													<dt>Goal</dt>
													<dd>{scene.intent.goal}</dd>
												</div>
												<div>
													<dt>Conflict</dt>
													<dd>{scene.intent.conflict}</dd>
												</div>
												<div>
													<dt>Turn</dt>
													<dd>{scene.intent.turn}</dd>
												</div>
												<div>
													<dt>Outcome</dt>
													<dd>{scene.intent.outcome}</dd>
												</div>
											</dl>
										</article>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</section>

<style>
	.outline-merge-tree,
	.merge-tree-list,
	.scene-list,
	.merge-node,
	.merge-node-label {
		display: flex;
		flex-direction: column;
	}

	.outline-merge-tree {
		gap: var(--space-2);
	}

	.merge-tree-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.merge-tree-header p,
	.node-summary,
	.intent-grid,
	.intent-grid dd {
		margin: 0;
	}

	.merge-tree-header p,
	.merge-node-label span,
	.intent-grid dt {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
		text-transform: uppercase;
	}

	.merge-tree-header span {
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		line-height: var(--leading-tight);
	}

	.merge-tree-list,
	.scene-list,
	.merge-node {
		gap: var(--space-2);
	}

	.merge-node {
		padding: var(--space-2);
		border: var(--border-width-sm) solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-ground) 86%, transparent);
	}

	.merge-node--act,
	.merge-node--chapter {
		margin-inline-start: var(--space-4);
	}

	.merge-node--scene {
		margin-inline-start: var(--space-4);
		background: var(--color-surface-overlay);
	}

	.merge-node-label {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		grid-template-areas:
			'input kind'
			'input title';
		align-items: start;
		gap: var(--space-1) var(--space-2);
	}

	.merge-node-label input {
		grid-area: input;
		margin: var(--space-1) 0 0;
		accent-color: var(--color-nova-blue);
	}

	.merge-node-label span {
		grid-area: kind;
	}

	.merge-node-label strong {
		grid-area: title;
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-tight);
		overflow-wrap: anywhere;
	}

	.node-summary,
	.intent-grid dd {
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
	}

	.intent-grid {
		display: grid;
		gap: var(--space-2);
	}

	.intent-grid div {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
</style>
