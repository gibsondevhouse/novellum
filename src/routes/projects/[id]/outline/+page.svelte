<script lang="ts">
	import { untrack } from 'svelte';
	import type {
		Chapter,
		Scene,
		StoryFrame,
		Act,
		Arc,
		Character,
		Milestone,
		Beat,
		Stage,
	} from '$lib/db/domain-types';
	import type { ChapterWithScenes } from '$modules/outline/types.js';
	import { WorkspaceShell, WorkspaceHero } from '$lib/components/ui/index.js';
	import HierarchyNavigator from '$modules/outline/components/HierarchyNavigator.svelte';
	import OutlineSummaryBar from '$modules/outline/components/OutlineSummaryBar.svelte';
	import ActClarityPanel from '$modules/outline/components/ActClarityPanel.svelte';
	import ChapterClarityPanel from '$modules/outline/components/ChapterClarityPanel.svelte';
	import SceneClarityPanel from '$modules/outline/components/SceneClarityPanel.svelte';
	import {
		getSelectionPath,
		getSelectionReadiness,
		jumpToSelectionLayer,
		setSelectedArc,
		setSelectedAct,
		setSelectedMilestone,
		setSelectedChapter,
		setSelectedScene,
		setSelectedBeat,
		setSelectedStage,
		setActiveProject,
		repairSelectionPathForActiveProject,
		computeStageRunReadiness,
		transitionToQueued,
		transitionToRunning,
		transitionToCompleted,
		transitionToFailed,
		resetStageRunState,
		deriveStageRuntimeState,
		getStageRuntimeState,
		getStageRunError,
		getStageRunButtonLabel,
		isStageRunActive,
	} from '$modules/outline/stores/outline-store.svelte.js';
	import { updateAct } from '$modules/outline/services/story-structure-service.js';
	import { updateChapter } from '$modules/project/services/chapter-repository.js';
	import { createScene, updateScene } from '$modules/editor/services/scene-repository.js';
	import { createBeat } from '$modules/editor/services/beat-repository.js';
	import { runWorldbuildPipelineTask } from '$modules/outline/services/worldbuild-pipeline-runner.js';
	import { PIPELINE_TASK_KEYS, getPipelineTaskLabel } from '$lib/ai/pipeline/task-catalog.js';
	import type { OutlineHierarchyReferences } from '$lib/ai/pipeline/contracts.js';
	import { checkpointLifecycleLabel } from '$lib/review-gate-labels.js';
	import type { CheckpointQueueFilter } from '$modules/world-building/stores/world-building-store.svelte.js';
	import {
		refreshWorldbuildCheckpoints,
		sendWorldbuildCheckpointToReview,
		acceptStagedWorldbuildCheckpoint,
		rejectStagedWorldbuildCheckpoint,
		getLatestCheckpointByLifecycle,
		getFilteredCheckpoints,
		getCheckpointQueueCounts,
		getCheckpointQueueFilter,
		setCheckpointQueueFilter,
		getSelectedReviewCheckpoint,
		getSelectedReviewCheckpointId,
		setSelectedReviewCheckpoint,
	} from '$modules/world-building/stores/world-building-store.svelte.js';

	let { data } = $props<{
		data: {
			projectId: string;
			storyFrame: StoryFrame;
			arcs: Arc[];
			acts: Act[];
			milestones: Milestone[];
			scenes: Scene[];
			characters: Character[];
			chapters: ChapterWithScenes[];
			beats: Beat[];
			stages: Stage[];
		};
	}>();

	let projectId = $derived(data.projectId);
	let arcs = $state<Arc[]>(untrack(() => data.arcs));
	let acts = $state<Act[]>(untrack(() => data.acts));
	let milestones = $state<Milestone[]>(untrack(() => data.milestones));
	let characters = $state<Character[]>(untrack(() => data.characters));
	let chapters = $state<ChapterWithScenes[]>(untrack(() => data.chapters));
	let beats = $state<Beat[]>(untrack(() => data.beats));
	let stages = $state<Stage[]>(untrack(() => data.stages));

	$effect(() => {
		setActiveProject(projectId);
	});

	const outlineScenes = $derived.by((): Scene[] => {
		const flattened: Scene[] = [];
		for (const chapter of chapters) {
			flattened.push(...chapter.scenes);
		}
		return flattened;
	});

	$effect(() => {
		const repairInput = {
			arcs,
			acts,
			milestones,
			chapters,
			scenes: outlineScenes,
			beats,
			stages,
		};

		untrack(() => {
			repairSelectionPathForActiveProject(repairInput);
		});
	});

	function handleSelectArcById(id: string | null) {
		setSelectedArc(id);
	}

	function handleSelectActById(id: string | null) {
		setSelectedAct(id);
	}

	function handleSelectMilestoneById(id: string | null) {
		setSelectedMilestone(id);
	}

	function handleSelectChapterById(id: string | null) {
		setSelectedChapter(id);
	}

	function handleSelectSceneById(id: string | null) {
		setSelectedScene(id);
	}

	function handleSelectBeatById(id: string | null) {
		setSelectedBeat(id);
	}

	function handleSelectStageById(id: string | null) {
		setSelectedStage(id);
	}

	const selectionPath = $derived(getSelectionPath());
	const selectedActId = $derived(selectionPath.actId);
	const selectedArcId = $derived(selectionPath.arcId);
	const selectedMilestoneId = $derived(selectionPath.milestoneId);
	const selectedChapterId = $derived(selectionPath.chapterId);
	const selectedSceneId = $derived(selectionPath.sceneId);
	const selectedBeatId = $derived(selectionPath.beatId);
	const selectedStageId = $derived(selectionPath.stageId);
	const selectionReadiness = $derived(getSelectionReadiness());

	const navigatorProps = $derived({
		arcs,
		acts,
		milestones,
		chapters: chapters as Chapter[],
		scenes: outlineScenes,
		beats,
		stages,
		selectionPath,
		onSelectArc: handleSelectArcById,
		onSelectAct: handleSelectActById,
		onSelectMilestone: handleSelectMilestoneById,
		onSelectChapter: handleSelectChapterById,
		onSelectScene: handleSelectSceneById,
		onSelectBeat: handleSelectBeatById,
		onSelectStage: handleSelectStageById,
		onJumpToLayer: jumpToSelectionLayer,
	});

	const selectedAct = $derived.by((): Act | null => {
		if (!selectedActId) return null;
		return acts.find((act) => act.id === selectedActId) ?? null;
	});

	const selectedArc = $derived.by((): Arc | null => {
		if (!selectedArcId) return null;
		return arcs.find((arc) => arc.id === selectedArcId) ?? null;
	});

	const selectedMilestone = $derived.by((): Milestone | null => {
		if (!selectedMilestoneId) return null;
		return milestones.find((milestone) => milestone.id === selectedMilestoneId) ?? null;
	});

	const selectedChapter = $derived.by((): ChapterWithScenes | null => {
		if (!selectedChapterId) return null;
		return chapters.find((chapter) => chapter.id === selectedChapterId) ?? null;
	});

	const selectedChapterAct = $derived.by((): Act | null => {
		if (!selectedChapter?.actId) return null;
		return acts.find((act) => act.id === selectedChapter.actId) ?? null;
	});

	const selectedChapterNumber = $derived.by((): number => {
		if (!selectedChapter) return 0;
		const ordered = [...chapters].sort((a, b) => a.order - b.order);
		const index = ordered.findIndex((chapter) => chapter.id === selectedChapter.id);
		return index >= 0 ? index + 1 : selectedChapter.order + 1;
	});

	const selectedScene = $derived.by((): Scene | null => {
		if (!selectedSceneId) return null;
		for (const chapter of chapters) {
			const scene = chapter.scenes.find((s) => s.id === selectedSceneId);
			if (scene) return scene;
		}
		return null;
	});

	const selectedSceneChapter = $derived.by((): Chapter | null => {
		if (!selectedScene) return null;
		return chapters.find((chapter) => chapter.id === selectedScene.chapterId) ?? null;
	});

	const selectedSceneAct = $derived.by((): Act | null => {
		if (!selectedSceneChapter?.actId) return null;
		return acts.find((act) => act.id === selectedSceneChapter.actId) ?? null;
	});

	const selectedSceneNumber = $derived.by((): number => {
		if (!selectedScene || !selectedSceneChapter) return 0;
		const chapterWithScenes = chapters.find((c) => c.id === selectedSceneChapter.id);
		if (!chapterWithScenes) return selectedScene.order + 1;
		const ordered = chapterWithScenes.scenes.sort((a: Scene, b: Scene) => a.order - b.order);
		const index = ordered.findIndex((scene: Scene) => scene.id === selectedScene.id);
		return index >= 0 ? index + 1 : selectedScene.order + 1;
	});

	const selectedActChapters = $derived.by((): ChapterWithScenes[] => {
		if (!selectedAct) return [];
		return chapters.filter((chapter) => chapter.actId === selectedAct.id);
	});

	const selectedActArc = $derived.by((): Arc | null => {
		if (!selectedAct?.arcId) return null;
		return arcs.find((arc) => arc.id === selectedAct.arcId) ?? null;
	});

	const selectedBeat = $derived.by((): Beat | null => {
		if (!selectedBeatId) return null;
		return beats.find((beat) => beat.id === selectedBeatId) ?? null;
	});

	const selectedStage = $derived.by((): Stage | null => {
		if (!selectedStageId) return null;
		return stages.find((stage) => stage.id === selectedStageId) ?? null;
	});

	const selectedBeatScene = $derived.by((): Scene | null => {
		if (!selectedBeat?.sceneId) return null;
		return outlineScenes.find((scene) => scene.id === selectedBeat.sceneId) ?? null;
	});

	const selectedStageBeat = $derived.by((): Beat | null => {
		if (!selectedStage) return null;
		return beats.find((beat) => beat.id === selectedStage.beatId) ?? null;
	});

	const selectedMilestoneAct = $derived.by((): Act | null => {
		if (!selectedMilestone) return null;
		return acts.find((act) => act.id === selectedMilestone.actId) ?? null;
	});

	const selectedMilestoneChapters = $derived.by((): ChapterWithScenes[] => {
		if (!selectedMilestone) return [];
		return selectedMilestone.chapterIds
			.map((chapterId) => chapters.find((chapter) => chapter.id === chapterId))
			.filter((chapter): chapter is ChapterWithScenes => Boolean(chapter));
	});

	const totalSceneCount = $derived.by(() =>
		chapters.reduce((total, chapter) => total + chapter.scenes.length, 0),
	);

	const selectionSummary = $derived.by(() => {
		if (selectedStage) return `Stage focus: ${selectedStage.title}`;
		if (selectedBeat) return `Beat focus: ${selectedBeat.title}`;
		if (selectedScene) return `Scene focus: ${selectedScene.title}`;
		if (selectedChapter) return `Chapter focus: ${selectedChapter.title}`;
		if (selectedAct) return `Act focus: ${selectedAct.title}`;
		return 'Select a node to start planning';
	});

	const currentLayerLabel = $derived.by(() => {
		if (selectedStageId !== undefined) return 'Stage';
		if (selectedBeatId !== undefined) return 'Beat';
		if (selectedSceneId !== undefined) return 'Scene';
		if (selectedChapterId !== undefined) return 'Chapter';
		if (selectedMilestoneId !== undefined) return 'Milestone';
		if (selectedActId !== undefined) return 'Act';
		if (selectedArcId !== undefined) return 'Arc';
		return 'None';
	});

	const pathSegments = $derived.by(() => {
		const segments: string[] = [];
		if (selectedArcId !== undefined) {
			segments.push(selectedArc?.title ?? (selectedArcId === null ? 'Unassigned Arc' : 'Missing Arc'));
		}
		if (selectedActId !== undefined) {
			segments.push(selectedAct?.title ?? (selectedActId === null ? 'Unassigned Act' : 'Missing Act'));
		}
		if (selectedMilestoneId !== undefined) {
			segments.push(
				selectedMilestone?.title ??
					(selectedMilestoneId === null ? 'Unassigned Milestone' : 'Missing Milestone'),
			);
		}
		if (selectedChapterId !== undefined) {
			segments.push(
				selectedChapter?.title ??
					(selectedChapterId === null ? 'Unassigned Chapter' : 'Missing Chapter'),
			);
		}
		if (selectedSceneId !== undefined) {
			segments.push(selectedScene?.title ?? (selectedSceneId === null ? 'Unassigned Scene' : 'Missing Scene'));
		}
		if (selectedBeatId !== undefined) {
			segments.push(selectedBeat?.title ?? (selectedBeatId === null ? 'Unassigned Beat' : 'Missing Beat'));
		}
		if (selectedStageId !== undefined) {
			segments.push(selectedStage?.title ?? (selectedStageId === null ? 'Unassigned Stage' : 'Missing Stage'));
		}
		return segments;
	});

	const showStageActionRegion = $derived(Boolean(selectedStage));

	$effect(() => {
		void selectionPath;
		deriveStageRuntimeState();
	});

	const stageReadiness = $derived(computeStageRunReadiness());
	const runtimeState = $derived(getStageRuntimeState());
	const stageRunErrorMessage = $derived(getStageRunError());
	const stageRunButtonLabel = $derived(getStageRunButtonLabel());
	const stageRunActive = $derived(isStageRunActive());
	const latestDraftCheckpoint = $derived(getLatestCheckpointByLifecycle('draft'));

	const filteredCheckpoints = $derived(getFilteredCheckpoints());
	const queueCounts = $derived(getCheckpointQueueCounts());
	const activeQueueFilter = $derived(getCheckpointQueueFilter());
	const selectedReviewCheckpoint = $derived(getSelectedReviewCheckpoint());
	const selectedReviewCheckpointIdValue = $derived(getSelectedReviewCheckpointId());

	let lastStagedCheckpointId: string | null = $state(null);
	let reviewTransitionError: string | null = $state(null);
	let decisionError: string | null = $state(null);
	let decisionInFlight: boolean = $state(false);
	let rejectReasonDraft: string = $state('');

	const QUEUE_FILTERS: readonly CheckpointQueueFilter[] = ['all', 'pending', 'accepted', 'rejected'];

	function checkpointQueueFilterLabel(filter: CheckpointQueueFilter): string {
		switch (filter) {
			case 'all':
				return 'All';
			case 'pending':
				return 'Pending';
			case 'accepted':
				return 'Accepted';
			case 'rejected':
				return 'Rejected';
		}
	}

	function emptyCheckpointQueueLabel(filter: CheckpointQueueFilter): string {
		if (filter === 'all') return 'No checkpoints yet. Run a stage pipeline to generate artifacts.';
		return `No ${checkpointQueueFilterLabel(filter).toLowerCase()} checkpoints.`;
	}

	function formatCheckpointDate(value: string): string {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString();
	}

	const HIERARCHY_SCOPE_LABELS: Record<string, string> = {
		arcs: 'arc',
		acts: 'act',
		milestones: 'milestone',
		chapters: 'chapter',
		scenes: 'scene',
		beats: 'beat',
		stages: 'stage',
	};

	function formatHierarchyScope(references: OutlineHierarchyReferences): string {
		const segments = Object.entries(references)
			.filter(([, ids]) => ids.length > 0)
			.map(([layer, ids]) => {
				const label = HIERARCHY_SCOPE_LABELS[layer] ?? layer;
				return `${ids.length} ${label}${ids.length === 1 ? '' : 's'}`;
			});

		return segments.length > 0 ? segments.join(', ') : 'Project-wide checkpoint';
	}

	async function handleRunStagePipeline(): Promise<void> {
		if (!selectedStage || !stageReadiness.canRun) return;

		const frozenPath = { ...selectionPath };
		transitionToQueued();
		transitionToRunning();
		lastStagedCheckpointId = null;
		reviewTransitionError = null;

		const result = await runWorldbuildPipelineTask({
			taskKey: PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE,
			projectId,
			hierarchyPath: frozenPath,
		});

		if (result.ok) {
			lastStagedCheckpointId = result.checkpoint.id;
			transitionToCompleted();
			await refreshWorldbuildCheckpoints(projectId);
		} else {
			transitionToFailed(result.error, result.reason);
		}
	}

	async function handleSendToReview(): Promise<void> {
		const checkpointId = lastStagedCheckpointId ?? latestDraftCheckpoint?.id;
		if (!checkpointId) return;

		reviewTransitionError = null;
		try {
			await sendWorldbuildCheckpointToReview(checkpointId);
			resetStageRunState();
		} catch (err) {
			reviewTransitionError = err instanceof Error ? err.message : 'Review transition failed.';
		}
	}

	function handleRetryOrReset(): void {
		reviewTransitionError = null;
		resetStageRunState();
	}

	function handleSelectQueueFilter(filter: CheckpointQueueFilter): void {
		setCheckpointQueueFilter(filter);
	}

	function handleSelectCheckpointForReview(id: string | null): void {
		setSelectedReviewCheckpoint(id);
		decisionError = null;
		rejectReasonDraft = '';
	}

	async function handleAcceptCheckpoint(): Promise<void> {
		if (!selectedReviewCheckpointIdValue || decisionInFlight) return;
		decisionError = null;
		decisionInFlight = true;
		try {
			await acceptStagedWorldbuildCheckpoint(selectedReviewCheckpointIdValue);
			setSelectedReviewCheckpoint(null);
			await refreshWorldbuildCheckpoints(projectId);
		} catch (err) {
			decisionError = err instanceof Error ? err.message : 'Accept failed.';
		} finally {
			decisionInFlight = false;
		}
	}

	async function handleRejectCheckpoint(): Promise<void> {
		if (!selectedReviewCheckpointIdValue || decisionInFlight) return;
		if (!rejectReasonDraft.trim()) {
			decisionError = 'A reason is required to reject a checkpoint.';
			return;
		}
		decisionError = null;
		decisionInFlight = true;
		try {
			await rejectStagedWorldbuildCheckpoint(
				selectedReviewCheckpointIdValue,
				rejectReasonDraft.trim(),
			);
			setSelectedReviewCheckpoint(null);
			rejectReasonDraft = '';
			await refreshWorldbuildCheckpoints(projectId);
		} catch (err) {
			decisionError = err instanceof Error ? err.message : 'Reject failed.';
		} finally {
			decisionInFlight = false;
		}
	}

	$effect(() => {
		if (projectId) {
			refreshWorldbuildCheckpoints(projectId);
		}
	});

	async function handleUpdateSelectedAct(patch: Partial<Omit<Act, 'id' | 'projectId' | 'createdAt'>>) {
		if (!selectedAct) return;
		await updateAct(selectedAct.id, patch);
		acts = acts.map((act) =>
			act.id === selectedAct.id
				? {
					...act,
					...patch,
					updatedAt: new Date().toISOString(),
				}
				: act,
		);
	}

	async function handleUpdateSelectedChapter(
		patch: Partial<Omit<Chapter, 'id' | 'projectId' | 'createdAt'>>,
	) {
		if (!selectedChapter) return;
		await updateChapter(selectedChapter.id, patch);
		chapters = chapters.map((chapter) =>
			chapter.id === selectedChapter.id
				? {
					...chapter,
					...patch,
					updatedAt: new Date().toISOString(),
				}
				: chapter,
		);
	}

	async function handleAddSceneToSelectedChapter(chapterId: string) {
		const chapter = chapters.find((item) => item.id === chapterId);
		if (!chapter) return;

		const scene = await createScene({
			chapterId,
			projectId,
			title: `Scene ${chapter.scenes.length + 1}`,
			summary: '',
			content: '',
			wordCount: 0,
			notes: '',
			order: chapter.scenes.length,
			povCharacterId: null,
			locationId: null,
			timelineEventId: null,
			characterIds: [],
			locationIds: [],
		});

		chapters = chapters.map((item) =>
			item.id === chapterId ? { ...item, scenes: [...item.scenes, scene] } : item,
		);
	}

	async function handleUpdateSelectedScene(
		patch: Partial<Omit<Scene, 'id' | 'projectId' | 'createdAt'>>,
	) {
		if (!selectedScene) return;
		await updateScene(selectedScene.id, patch);
		chapters = chapters.map((chapter) => ({
			...chapter,
			scenes: chapter.scenes.map((scene) =>
				scene.id === selectedScene.id
					? {
						...scene,
						...patch,
						updatedAt: new Date().toISOString(),
					}
					: scene,
			),
		}));
	}

	async function handleAddBeatToSelectedScene(sceneId: string, title: string) {
		const scene = selectedScene;
		if (!scene || scene.id !== sceneId) return;

		const beatsInScene = await (async () => {
			const { getBeatsBySceneId } = await import('$modules/editor/services/beat-repository.js');
			return await getBeatsBySceneId(sceneId);
		})();

		const beat = await createBeat({
			sceneId,
			projectId,
			title,
			type: 'beat',
			order: beatsInScene.length,
			notes: '',
		});
		beats = [...beats, beat];
	}
</script>

<svelte:head>
	<title>Outline — Novellum</title>
</svelte:head>

<WorkspaceShell sidebarLabel="Outline selector" mainLabel="Outline detail workspace">
	{#snippet hero()}
		<WorkspaceHero
			eyebrow="Storyboard Room"
			title="Narrative Structure"
			description="Map acts, chapters, and scenes as production beats. Keep structure explicit before entering manuscript drafting."
		>
			{#snippet metrics()}
				<div class="storyboard-metrics" aria-label="Outline metrics">
					<div class="metric-card">
						<span>Acts</span>
						<strong>{acts.length}</strong>
					</div>
					<div class="metric-card">
						<span>Chapters</span>
						<strong>{chapters.length}</strong>
					</div>
					<div class="metric-card">
						<span>Scenes</span>
						<strong>{totalSceneCount}</strong>
					</div>
					<div class="metric-card metric-card--wide">
						<span>Selection</span>
						<strong>{selectionSummary}</strong>
					</div>
				</div>
			{/snippet}
		</WorkspaceHero>
	{/snippet}

	{#snippet sidebar()}
		<HierarchyNavigator {...navigatorProps} />
	{/snippet}

	{#snippet mainHeader()}
		<OutlineSummaryBar
			currentLayerLabel={currentLayerLabel}
			readiness={selectionReadiness}
			pathSegments={pathSegments}
			showStageActions={showStageActionRegion}
			stageTitle={selectedStage?.title}
			stageRunButtonLabel={stageRunButtonLabel}
			stageRunDisabled={!stageReadiness.canRun}
			stageRunDisabledReason={stageReadiness.disabledReason}
			onStageAction={handleRunStagePipeline}
		/>
	{/snippet}

	{#snippet main()}
		{#if selectedStage || selectedStageId !== undefined}
			<div class="layer-shell">
				<h2>Stage Detail</h2>
				{#if selectedStage}
					<p><strong>{selectedStage.title}</strong></p>
					<p>Status: {selectedStage.status}</p>
					<p>Beat: {selectedStageBeat?.title ?? 'Unknown beat'}</p>
					{#if stageRunActive}
						<p class="stage-run-status">Pipeline {runtimeState}…</p>
					{:else if runtimeState === 'failed' && stageRunErrorMessage}
						<p class="stage-run-status stage-run-status--error">Run failed: {stageRunErrorMessage}</p>
						<button type="button" class="stage-retry-btn" onclick={handleRetryOrReset}>Dismiss & Retry</button>
					{:else if runtimeState === 'completed_pending_checkpoint'}
						<p class="stage-run-status stage-run-status--ok">Draft checkpoint staged.</p>
						<button type="button" class="stage-review-btn" onclick={handleSendToReview}>Send to Review</button>
						{#if reviewTransitionError}
							<p class="stage-run-status stage-run-status--error">{reviewTransitionError}</p>
							<button type="button" class="stage-retry-btn" onclick={handleRetryOrReset}>Dismiss</button>
						{/if}
					{/if}

					<!-- Checkpoint Queue -->
					<section class="checkpoint-queue" aria-label="Checkpoint queue">
						<h3>Checkpoint Queue</h3>
						<div class="checkpoint-queue__filters" role="tablist" aria-label="Filter checkpoints">
							{#each QUEUE_FILTERS as filter (filter)}
								<button
									type="button"
									role="tab"
									class="checkpoint-queue__filter"
									class:checkpoint-queue__filter--active={activeQueueFilter === filter}
									aria-selected={activeQueueFilter === filter}
									aria-label={`Show ${checkpointQueueFilterLabel(filter)} checkpoints`}
									onclick={() => handleSelectQueueFilter(filter)}
								>
									{checkpointQueueFilterLabel(filter)} ({queueCounts[filter]})
								</button>
							{/each}
						</div>

						{#if filteredCheckpoints.length === 0}
							<p class="checkpoint-queue__empty">
								{emptyCheckpointQueueLabel(activeQueueFilter)}
							</p>
						{:else}
							<ul class="checkpoint-queue__list">
								{#each filteredCheckpoints as cp (cp.id)}
									{@const lifecycleLabel = checkpointLifecycleLabel(cp.lifecycle)}
									{@const taskLabel = getPipelineTaskLabel(cp.taskKey)}
									<li>
										<button
											type="button"
											class="checkpoint-queue__item"
											class:checkpoint-queue__item--selected={selectedReviewCheckpointIdValue === cp.id}
											aria-label={`${taskLabel}, ${lifecycleLabel}, updated ${new Date(cp.updatedAt).toLocaleString()}`}
											onclick={() => handleSelectCheckpointForReview(cp.id)}
										>
											<span class="checkpoint-queue__lifecycle" data-lifecycle={cp.lifecycle}>{lifecycleLabel}</span>
											<span class="checkpoint-queue__task" data-task-key={cp.taskKey}>{taskLabel}</span>
											<time class="checkpoint-queue__time" datetime={cp.updatedAt}>
												{new Date(cp.updatedAt).toLocaleString()}
											</time>
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</section>

					<!-- Checkpoint Review Detail -->
					{#if selectedReviewCheckpoint}
						<section class="checkpoint-detail" aria-label="Checkpoint review detail">
							<div class="checkpoint-detail__header">
								<h3>Artifact Review</h3>
								<button type="button" class="stage-retry-btn" onclick={() => handleSelectCheckpointForReview(null)}>Close</button>
							</div>

							<div class="checkpoint-detail__meta">
								<dl class="checkpoint-detail__fields">
									<dt>Task</dt>
									<dd>
										<span data-task-key={selectedReviewCheckpoint.taskKey}>
											{getPipelineTaskLabel(selectedReviewCheckpoint.taskKey)}
										</span>
									</dd>
									<dt>Lifecycle</dt>
									<dd>
										<span class="checkpoint-queue__lifecycle" data-lifecycle={selectedReviewCheckpoint.lifecycle}>
											{checkpointLifecycleLabel(selectedReviewCheckpoint.lifecycle)}
										</span>
									</dd>
									<dt>Scope</dt>
									<dd>{formatHierarchyScope(selectedReviewCheckpoint.artifact.hierarchy.references)}</dd>
									<dt>Generated</dt>
									<dd>{formatCheckpointDate(selectedReviewCheckpoint.artifact.producedAt)}</dd>
									<dt>Updated</dt>
									<dd>{formatCheckpointDate(selectedReviewCheckpoint.updatedAt)}</dd>
								</dl>
							</div>

							{#if selectedReviewCheckpoint.artifact.notes.length > 0}
								<div class="checkpoint-detail__notes">
									<h4>Notes</h4>
									<ul>
										{#each selectedReviewCheckpoint.artifact.notes as note, i (i)}
											<li>{note}</li>
										{/each}
									</ul>
								</div>
							{/if}

							{#if selectedReviewCheckpoint.review}
								<div class="checkpoint-detail__review-state">
									<h4>Review</h4>
									<p>Reviewed: {new Date(selectedReviewCheckpoint.review.reviewedAt).toLocaleString()}</p>
									{#if selectedReviewCheckpoint.review.reviewer}
										<p>Reviewer: {selectedReviewCheckpoint.review.reviewer}</p>
									{/if}
									{#if selectedReviewCheckpoint.review.note}
										<p>Note: {selectedReviewCheckpoint.review.note}</p>
									{/if}
								</div>
							{/if}

							{#if selectedReviewCheckpoint.rejection}
								<div class="checkpoint-detail__rejection">
									<h4>Rejection</h4>
									<p>Reason: {selectedReviewCheckpoint.rejection.reason}</p>
									<p>Rejected: {new Date(selectedReviewCheckpoint.rejection.rejectedAt).toLocaleString()}</p>
								</div>
							{/if}

							{#if selectedReviewCheckpoint.acceptance}
								<div class="checkpoint-detail__acceptance">
									<h4>Acceptance</h4>
									<p>Accepted: {new Date(selectedReviewCheckpoint.acceptance.acceptedAt).toLocaleString()}</p>
									{#if selectedReviewCheckpoint.acceptance.note}
										<p>Note: {selectedReviewCheckpoint.acceptance.note}</p>
									{/if}
									<p>Projected to canon: {selectedReviewCheckpoint.acceptance.projectedToCanon ? 'Yes' : 'No'}</p>
								</div>
							{/if}

							<details class="checkpoint-detail__payload">
								<summary>Advanced details</summary>
								<dl class="checkpoint-detail__developer-meta" aria-label="Developer checkpoint metadata">
									<div>
										<dt>Checkpoint ID</dt>
										<dd><code>{selectedReviewCheckpoint.id}</code></dd>
									</div>
									<div>
										<dt>Task key</dt>
										<dd><code>{selectedReviewCheckpoint.taskKey}</code></dd>
									</div>
									<div>
										<dt>Pipeline</dt>
										<dd><code>{selectedReviewCheckpoint.artifact.pipeline}</code></dd>
									</div>
									<div>
										<dt>Stage key</dt>
										<dd><code>{selectedReviewCheckpoint.artifact.stage}</code></dd>
									</div>
									<div>
										<dt>Checkpoint version</dt>
										<dd>{selectedReviewCheckpoint.version}</dd>
									</div>
									<div>
										<dt>Parser version</dt>
										<dd>{selectedReviewCheckpoint.artifact.parserVersion}</dd>
									</div>
								</dl>
								<div class="checkpoint-detail__hierarchy" aria-label="Raw hierarchy references">
									{#each Object.entries(selectedReviewCheckpoint.artifact.hierarchy.references) as [layer, ids] (layer)}
										{#if ids.length > 0}
											<span class="checkpoint-detail__ref">{layer}: {ids.join(', ')}</span>
										{/if}
									{/each}
								</div>
								<h4 class="checkpoint-detail__payload-heading">Raw payload</h4>
								<pre class="checkpoint-detail__payload-pre">{JSON.stringify(selectedReviewCheckpoint.artifact.payload, null, 2)}</pre>
							</details>

							<!-- Accept/Reject Decision Controls -->
							{#if selectedReviewCheckpoint.lifecycle === 'review'}
								<div class="checkpoint-decision" aria-label="Checkpoint decision controls">
									<div class="checkpoint-decision__accept">
										<p class="checkpoint-decision__scope">
											Accepting will project the reviewed <strong>{getPipelineTaskLabel(selectedReviewCheckpoint.taskKey)}</strong> artifact into the current story scope. Nothing changes until you explicitly accept.
										</p>
										<button
											type="button"
											class="checkpoint-decision__accept-btn"
											disabled={decisionInFlight}
											onclick={handleAcceptCheckpoint}
										>
											{decisionInFlight ? 'Processing…' : 'Accept Checkpoint'}
										</button>
									</div>

									<div class="checkpoint-decision__reject">
										<p class="checkpoint-decision__scope">
											Rejecting keeps this artifact out of canon and records the reason for future review.
										</p>
										<label class="checkpoint-decision__label" for="reject-reason-input">Rejection reason</label>
										<textarea
											id="reject-reason-input"
											class="checkpoint-decision__textarea"
											placeholder="Explain why this artifact should be rejected…"
											bind:value={rejectReasonDraft}
											disabled={decisionInFlight}
										></textarea>
										<button
											type="button"
											class="checkpoint-decision__reject-btn"
											disabled={decisionInFlight || !rejectReasonDraft.trim()}
											onclick={handleRejectCheckpoint}
										>
											{decisionInFlight ? 'Processing…' : 'Reject Checkpoint'}
										</button>
									</div>

									{#if decisionError}
										<p class="stage-run-status stage-run-status--error">{decisionError}</p>
									{/if}
								</div>
							{/if}
						</section>
					{/if}
				{:else}
					<p>Selected stage no longer exists. Pick another stage from the navigator.</p>
				{/if}
			</div>
		{:else if selectedBeat || selectedBeatId !== undefined}
			<div class="layer-shell">
				<h2>Beat Detail</h2>
				{#if selectedBeat}
					<p><strong>{selectedBeat.title}</strong></p>
					<p>Type: {selectedBeat.type}</p>
					<p>Scene: {selectedBeatScene?.title ?? 'Unassigned scene'}</p>
					<p>Stages in beat: {stages.filter((stage) => stage.beatId === selectedBeat.id).length}</p>
				{:else}
					<p>Selected beat no longer exists. Choose another beat from the navigator.</p>
				{/if}
			</div>
		{:else if selectedScene || selectedSceneId !== undefined}
			{#if selectedScene}
			<SceneClarityPanel
				{projectId}
				scene={selectedScene}
				sceneNumber={selectedSceneNumber}
				parentChapter={selectedSceneChapter}
				parentAct={selectedSceneAct}
				{characters}
				{arcs}
				onUpdateScene={(id, patch) => (id === selectedScene.id ? handleUpdateSelectedScene(patch) : Promise.resolve())}
				onAddBeat={handleAddBeatToSelectedScene}
			/>
			{:else}
				<div class="layer-shell">
					<h2>Scene Detail</h2>
					<p>Selected scene no longer exists. Choose another scene from the navigator.</p>
				</div>
			{/if}
		{:else if selectedChapter || selectedChapterId !== undefined}
			{#if selectedChapter}
			<ChapterClarityPanel
				{projectId}
				chapter={selectedChapter}
				chapterNumber={selectedChapterNumber}
				parentAct={selectedChapterAct}
				scenes={selectedChapter.scenes}
				{characters}
				{arcs}
				onUpdateChapter={(id, patch) => (id === selectedChapter.id ? handleUpdateSelectedChapter(patch) : Promise.resolve())}
				onAddScene={handleAddSceneToSelectedChapter}
			/>
			{:else}
				<div class="layer-shell">
					<h2>Chapter Detail</h2>
					<p>Selected chapter no longer exists. Choose another chapter from the navigator.</p>
				</div>
			{/if}
		{:else if selectedMilestone || selectedMilestoneId !== undefined}
			<div class="layer-shell">
				<h2>Milestone Detail</h2>
				{#if selectedMilestone}
					<p><strong>{selectedMilestone.title}</strong></p>
					<p>Parent act: {selectedMilestoneAct?.title ?? 'Unknown act'}</p>
					<p>Linked chapters: {selectedMilestoneChapters.length}</p>
				{:else}
					<p>Selected milestone no longer exists. Choose another milestone from the navigator.</p>
				{/if}
			</div>
		{:else if selectedAct || selectedActId !== undefined}
			{#if selectedAct}
			<ActClarityPanel
				act={selectedAct}
				chapters={selectedActChapters}
				relatedArc={selectedActArc}
				onUpdateAct={handleUpdateSelectedAct}
			/>
			{:else}
				<div class="layer-shell">
					<h2>Act Detail</h2>
					<p>Selected act no longer exists. Choose another act from the navigator.</p>
				</div>
			{/if}
		{:else if selectedArc || selectedArcId !== undefined}
			<div class="layer-shell">
				<h2>Arc Detail</h2>
				{#if selectedArc}
					<p><strong>{selectedArc.title}</strong></p>
					<p>{selectedArc.description || 'No description set for this arc yet.'}</p>
					<p>Acts in arc: {acts.filter((act) => act.arcId === selectedArc.id).length}</p>
				{:else}
					<p>Selected arc no longer exists. Choose another arc from the navigator.</p>
				{/if}
			</div>
		{:else}
			<div class="outline-main-empty">
				<h2>Select a Layer</h2>
				<p>Choose an Arc -> Stage node to view layer-specific planning details.</p>
			</div>
		{/if}
	{/snippet}
</WorkspaceShell>

<style>
	.storyboard-metrics {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.metric-card {
		display: grid;
		gap: 0.15rem;
		padding: var(--space-3);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-overlay) 76%, transparent);
	}

	.metric-card span {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.metric-card strong {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.metric-card--wide {
		grid-column: 1 / -1;
	}

	.layer-shell {
		width: min(760px, 100%);
		padding: var(--space-5);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-raised) 88%, transparent);
		display: grid;
		gap: var(--space-2);
	}

	.layer-shell h2 {
		margin: 0;
		font-size: var(--text-lg);
		font-family: var(--font-display);
		color: var(--color-text-primary);
	}

	.layer-shell p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}

	.stage-run-status {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.stage-run-status--error {
		color: color-mix(in srgb, var(--color-destructive) 80%, var(--color-text-primary));
	}

	.stage-run-status--ok {
		color: color-mix(in srgb, var(--color-teal) 76%, var(--color-text-primary));
	}

	.stage-review-btn {
		border: 1px solid color-mix(in srgb, var(--color-teal) 50%, var(--color-border-default));
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-teal);
		background: transparent;
		cursor: pointer;
	}

	.stage-review-btn:hover {
		background: color-mix(in srgb, var(--color-teal) 10%, transparent);
	}

	.stage-retry-btn {
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		background: transparent;
		cursor: pointer;
	}

	.stage-retry-btn:hover {
		background: color-mix(in srgb, var(--color-surface-overlay) 60%, transparent);
	}

	/* ── Checkpoint Queue ── */

	.checkpoint-queue {
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px dashed var(--color-border-subtle);
		display: grid;
		gap: var(--space-2);
	}

	.checkpoint-queue h3 {
		margin: 0;
		font-size: var(--text-sm);
		font-family: var(--font-display);
		color: var(--color-text-primary);
	}

	.checkpoint-queue__filters {
		display: flex;
		gap: var(--space-1);
	}

	.checkpoint-queue__filter {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		background: transparent;
		cursor: pointer;
	}

	.checkpoint-queue__filter--active {
		color: var(--color-text-primary);
		border-color: var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 60%, transparent);
	}

	.checkpoint-queue__filter:hover:not(.checkpoint-queue__filter--active) {
		color: var(--color-text-secondary);
	}

	.checkpoint-queue__empty {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		padding: var(--space-2);
	}

	.checkpoint-queue__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-1);
		max-height: 240px;
		overflow-y: auto;
	}

	.checkpoint-queue__item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: transparent;
		cursor: pointer;
		text-align: left;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.checkpoint-queue__item:hover {
		background: color-mix(in srgb, var(--color-surface-overlay) 50%, transparent);
	}

	.checkpoint-queue__item--selected {
		border-color: color-mix(in srgb, var(--color-teal) 50%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-teal) 6%, transparent);
	}

	.checkpoint-queue__lifecycle {
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-subtle);
		color: var(--color-text-muted);
		line-height: 1.6;
		white-space: nowrap;
	}

	.checkpoint-queue__lifecycle[data-lifecycle='draft'] {
		color: var(--color-text-secondary);
	}

	.checkpoint-queue__lifecycle[data-lifecycle='review'] {
		color: color-mix(in srgb, var(--color-candle) 76%, var(--color-text-primary));
		border-color: color-mix(in srgb, var(--color-candle) 40%, var(--color-border-subtle));
	}

	.checkpoint-queue__lifecycle[data-lifecycle='accepted'] {
		color: color-mix(in srgb, var(--color-teal) 76%, var(--color-text-primary));
		border-color: color-mix(in srgb, var(--color-teal) 40%, var(--color-border-subtle));
	}

	.checkpoint-queue__lifecycle[data-lifecycle='rejected'] {
		color: color-mix(in srgb, var(--color-destructive) 72%, var(--color-text-primary));
		border-color: color-mix(in srgb, var(--color-destructive) 36%, var(--color-border-subtle));
	}

	.checkpoint-queue__task {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.checkpoint-queue__time {
		color: var(--color-text-muted);
		font-size: 0.6rem;
		white-space: nowrap;
	}

	/* ── Checkpoint Detail ── */

	.checkpoint-detail {
		margin-top: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-ground) 40%, var(--color-surface-overlay));
		display: grid;
		gap: var(--space-3);
	}

	.checkpoint-detail__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.checkpoint-detail__header h3 {
		margin: 0;
		font-size: var(--text-sm);
		font-family: var(--font-display);
		color: var(--color-text-primary);
	}

	.checkpoint-detail__meta {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: var(--space-2);
	}

	.checkpoint-detail__fields {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-1) var(--space-3);
		margin: 0;
		font-size: var(--text-xs);
	}

	.checkpoint-detail__fields dt {
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		font-size: 0.6rem;
		align-self: start;
		padding-top: 0.1rem;
	}

	.checkpoint-detail__fields dd {
		margin: 0;
		color: var(--color-text-secondary);
		overflow-wrap: anywhere;
	}

	.checkpoint-detail__hierarchy {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.checkpoint-detail__ref {
		font-size: 0.6rem;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0 var(--space-1);
	}

	.checkpoint-detail__notes,
	.checkpoint-detail__review-state,
	.checkpoint-detail__rejection,
	.checkpoint-detail__acceptance {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.checkpoint-detail__notes h4,
	.checkpoint-detail__review-state h4,
	.checkpoint-detail__rejection h4,
	.checkpoint-detail__acceptance h4 {
		margin: 0 0 var(--space-1);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.checkpoint-detail__notes ul {
		margin: 0;
		padding-left: var(--space-4);
	}

	.checkpoint-detail__review-state p,
	.checkpoint-detail__rejection p,
	.checkpoint-detail__acceptance p {
		margin: 0;
	}

	.checkpoint-detail__payload {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: var(--space-2);
		background: color-mix(in srgb, var(--color-surface-ground) 38%, transparent);
	}

	.checkpoint-detail__payload summary {
		cursor: pointer;
		padding: var(--space-1) 0;
		color: var(--color-text-secondary);
		font-weight: var(--font-weight-medium);
	}

	.checkpoint-detail__developer-meta {
		display: grid;
		gap: var(--space-2);
		margin: var(--space-2) 0;
	}

	.checkpoint-detail__developer-meta div {
		display: grid;
		grid-template-columns: 140px minmax(0, 1fr);
		gap: var(--space-2);
		align-items: start;
	}

	.checkpoint-detail__developer-meta dt {
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		font-size: 0.6rem;
	}

	.checkpoint-detail__developer-meta dd {
		margin: 0;
		color: var(--color-text-secondary);
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.checkpoint-detail__payload-heading {
		margin: var(--space-3) 0 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.checkpoint-detail__payload-pre {
		margin: var(--space-2) 0 0;
		padding: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-ground) 80%, transparent);
		font-size: 0.65rem;
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
		overflow-x: auto;
		max-height: 320px;
		overflow-y: auto;
		white-space: pre-wrap;
		word-break: break-word;
	}

	@media (max-width: 720px) {
		.checkpoint-detail__developer-meta div,
		.checkpoint-detail__fields {
			grid-template-columns: 1fr;
		}
	}

	/* ── Checkpoint Decision ── */

	.checkpoint-decision {
		display: grid;
		gap: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px dashed var(--color-border-subtle);
	}

	.checkpoint-decision__scope {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}

	.checkpoint-decision__accept-btn {
		border: 1px solid color-mix(in srgb, var(--color-teal) 55%, var(--color-border-default));
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-teal);
		background: transparent;
		cursor: pointer;
		margin-top: var(--space-1);
	}

	.checkpoint-decision__accept-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-teal) 12%, transparent);
	}

	.checkpoint-decision__accept-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.checkpoint-decision__reject {
		display: grid;
		gap: var(--space-1);
	}

	.checkpoint-decision__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.checkpoint-decision__textarea {
		width: 100%;
		min-height: 56px;
		padding: var(--space-2);
		background: color-mix(in srgb, var(--color-surface-ground) 60%, var(--color-surface-overlay));
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-xs);
		font-family: inherit;
		line-height: var(--leading-relaxed);
		resize: vertical;
	}

	.checkpoint-decision__textarea:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--color-destructive) 45%, transparent);
	}

	.checkpoint-decision__textarea::placeholder {
		color: var(--color-text-muted);
		opacity: 0.55;
	}

	.checkpoint-decision__reject-btn {
		border: 1px solid color-mix(in srgb, var(--color-destructive) 50%, var(--color-border-default));
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: color-mix(in srgb, var(--color-destructive) 80%, var(--color-text-primary));
		background: transparent;
		cursor: pointer;
		justify-self: start;
	}

	.checkpoint-decision__reject-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-destructive) 8%, transparent);
	}

	.checkpoint-decision__reject-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.outline-main-empty {
		width: min(620px, 100%);
		margin-top: var(--space-6);
		padding: var(--space-6);
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-raised) 80%, transparent);
	}

	.outline-main-empty h2 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-lg);
		font-family: var(--font-display);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.outline-main-empty p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}
</style>
