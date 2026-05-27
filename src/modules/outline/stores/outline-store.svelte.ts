import { SvelteSet } from 'svelte/reactivity';
import { hierarchyStore } from '$modules/project/index.js';
import type { PipelineHierarchyLayer } from '$modules/outline/services/seven-layer-outline.js';
import type { WorldbuildRunErrorReason } from '$modules/outline/services/worldbuild-pipeline-runner.js';

type RepairHierarchyInput = Parameters<typeof hierarchyStore.repairPipelineHierarchyPath>[1];

let activeProjectId: string | null = $state(null);
const expandedChapterIds: SvelteSet<string> = new SvelteSet();
let isLoading: boolean = $state(false);

export type StageRuntimeState =
	| 'idle'
	| 'ready'
	| 'queued'
	| 'running'
	| 'completed_pending_checkpoint'
	| 'failed'
	| 'cancelled';

let stageRuntimeState: StageRuntimeState = $state('idle');
let stageRunError: string | null = $state(null);
let stageRunErrorReason: WorldbuildRunErrorReason | null = $state(null);

const hasSelection = $derived.by(() => {
	if (!activeProjectId) return false;
	return hierarchyStore.getPipelineHierarchyReadiness(activeProjectId) !== 'empty';
});

function withActiveProjectId<T>(
	handler: (projectId: string) => T,
	fallback: T,
): T {
	if (!activeProjectId) return fallback;
	return handler(activeProjectId);
}

function withActiveProjectIdVoid(handler: (projectId: string) => void): void {
	if (!activeProjectId) return;
	handler(activeProjectId);
}

function applySelection(
	projectId: string,
	layer: PipelineHierarchyLayer,
	value: string | null,
): void {
	if (layer === 'arc') {
		hierarchyStore.selectArc(projectId, value);
		return;
	}
	if (layer === 'act') {
		hierarchyStore.selectAct(projectId, value);
		return;
	}
	if (layer === 'milestone') {
		hierarchyStore.selectMilestone(projectId, value);
		return;
	}
	if (layer === 'chapter') {
		hierarchyStore.selectChapter(projectId, value);
		return;
	}
	if (layer === 'scene') {
		hierarchyStore.selectScene(projectId, value);
		return;
	}
	if (layer === 'beat') {
		hierarchyStore.selectBeat(projectId, value);
		return;
	}
	hierarchyStore.selectStage(projectId, value);
}

const REAPPLY_ORDER: PipelineHierarchyLayer[] = [
	'arc',
	'act',
	'milestone',
	'chapter',
	'scene',
	'beat',
	'stage',
];

export function setSelectedArc(id: string | null): void {
	withActiveProjectIdVoid((projectId) => {
		hierarchyStore.selectArc(projectId, id);
	});
}
export function setSelectedBeat(id: string | null): void {
	withActiveProjectIdVoid((projectId) => {
		hierarchyStore.selectBeat(projectId, id);
	});
}
export function setSelectedMilestone(id: string | null): void {
	withActiveProjectIdVoid((projectId) => {
		hierarchyStore.selectMilestone(projectId, id);
	});
}
export function setSelectedChapter(id: string | null): void {
	withActiveProjectIdVoid((projectId) => {
		hierarchyStore.selectChapter(projectId, id);
	});
}
export function setSelectedScene(id: string | null): void {
	withActiveProjectIdVoid((projectId) => {
		hierarchyStore.selectScene(projectId, id);
	});
}
export function setSelectedAct(id: string | null): void {
	withActiveProjectIdVoid((projectId) => {
		hierarchyStore.selectAct(projectId, id);
	});
}
export function setSelectedStage(id: string | null): void {
	withActiveProjectIdVoid((projectId) => {
		hierarchyStore.selectStage(projectId, id);
	});
}
export function toggleChapter(chapterId: string): void {
	if (expandedChapterIds.has(chapterId)) {
		expandedChapterIds.delete(chapterId);
	} else {
		expandedChapterIds.add(chapterId);
	}
}
export function setActiveProject(projectId: string | null): void {
	activeProjectId = projectId;
}
export function setLoading(v: boolean): void {
	isLoading = v;
}
export function jumpToSelectionLayer(layer: PipelineHierarchyLayer): void {
	withActiveProjectIdVoid((projectId) => {
		const path = hierarchyStore.getPipelineHierarchyPath(projectId);
		const maxLayerIndex = REAPPLY_ORDER.indexOf(layer);
		if (maxLayerIndex < 0) return;

		hierarchyStore.resetForProject(projectId);
		for (let index = 0; index <= maxLayerIndex; index += 1) {
			const currentLayer = REAPPLY_ORDER[index];
			let value: string | null | undefined;
			if (currentLayer === 'arc') value = path.arcId;
			if (currentLayer === 'act') value = path.actId;
			if (currentLayer === 'milestone') value = path.milestoneId;
			if (currentLayer === 'chapter') value = path.chapterId;
			if (currentLayer === 'scene') value = path.sceneId;
			if (currentLayer === 'beat') value = path.beatId;
			if (currentLayer === 'stage') value = path.stageId;
			if (value === undefined) break;
			applySelection(projectId, currentLayer, value);
		}
	});
}
export function repairSelectionPathForActiveProject(input: RepairHierarchyInput) {
	return withActiveProjectId(
		(projectId) => hierarchyStore.repairPipelineHierarchyPath(projectId, input),
		null,
	);
}
export function getSelectionPathDiagnostics() {
	return withActiveProjectId((projectId) => hierarchyStore.getPipelinePathDiagnostics(projectId), []);
}
export function getSelectionPath() {
	return withActiveProjectId(
		(projectId) => hierarchyStore.getPipelineHierarchyPath(projectId),
		{
			arcId: undefined,
			actId: undefined,
			milestoneId: undefined,
			chapterId: undefined,
			sceneId: undefined,
			beatId: undefined,
			stageId: undefined,
		},
	);
}
export function getSelectionReadiness() {
	return withActiveProjectId(
		(projectId) => hierarchyStore.getPipelineHierarchyReadiness(projectId),
		'empty',
	);
}

export function getActiveProjectId() {
	return activeProjectId;
}
export function getSelectedBeatId() {
	return withActiveProjectId((projectId) => hierarchyStore.getSelectedBeatId(projectId), undefined);
}
export function getSelectedMilestoneId() {
	return withActiveProjectId(
		(projectId) => hierarchyStore.getSelectedMilestoneId(projectId),
		undefined,
	);
}
export function getSelectedChapterId() {
	return withActiveProjectId(
		(projectId) => hierarchyStore.getSelectedChapterId(projectId),
		undefined,
	);
}
export function getSelectedSceneId() {
	return withActiveProjectId((projectId) => hierarchyStore.getSelectedSceneId(projectId), undefined);
}
export function getSelectedStageId() {
	return withActiveProjectId((projectId) => hierarchyStore.getSelectedStageId(projectId), undefined);
}
export function getSelectedArcId() {
	return withActiveProjectId((projectId) => hierarchyStore.getSelectedArcId(projectId), undefined);
}
export function getSelectedActId() {
	return withActiveProjectId((projectId) => hierarchyStore.getSelectedActId(projectId), undefined);
}
export function getExpandedChapterIds() {
	return expandedChapterIds;
}
export function getIsLoading() {
	return isLoading;
}
export function getHasSelection() {
	return hasSelection;
}

export interface StageRunReadiness {
	canRun: boolean;
	disabledReason: string | null;
}

export function computeStageRunReadiness(): StageRunReadiness {
	const path = getSelectionPath();

	if (path.stageId === undefined || path.stageId === null) {
		return { canRun: false, disabledReason: 'Select a stage to run the pipeline.' };
	}

	if (path.arcId === undefined || path.arcId === null) {
		return { canRun: false, disabledReason: 'Arc selection is required.' };
	}

	if (stageRuntimeState === 'queued' || stageRuntimeState === 'running') {
		return { canRun: false, disabledReason: 'A pipeline run is already in progress.' };
	}

	return { canRun: true, disabledReason: null };
}

export function transitionToQueued(): void {
	stageRuntimeState = 'queued';
	stageRunError = null;
	stageRunErrorReason = null;
}

export function transitionToRunning(): void {
	stageRuntimeState = 'running';
}

export function transitionToCompleted(): void {
	stageRuntimeState = 'completed_pending_checkpoint';
	stageRunError = null;
	stageRunErrorReason = null;
}

export function transitionToFailed(error: string, reason: WorldbuildRunErrorReason): void {
	stageRuntimeState = 'failed';
	stageRunError = error;
	stageRunErrorReason = reason;
}

export function transitionToCancelled(): void {
	stageRuntimeState = 'cancelled';
	stageRunError = null;
	stageRunErrorReason = null;
}

export function resetStageRunState(): void {
	const readiness = computeStageRunReadiness();
	stageRuntimeState = readiness.canRun ? 'ready' : 'idle';
	stageRunError = null;
	stageRunErrorReason = null;
}

export function deriveStageRuntimeState(): void {
	if (
		stageRuntimeState === 'queued' ||
		stageRuntimeState === 'running' ||
		stageRuntimeState === 'completed_pending_checkpoint' ||
		stageRuntimeState === 'failed' ||
		stageRuntimeState === 'cancelled'
	) {
		return;
	}
	const readiness = computeStageRunReadiness();
	stageRuntimeState = readiness.canRun ? 'ready' : 'idle';
}

export function getStageRuntimeState(): StageRuntimeState {
	return stageRuntimeState;
}

export function getStageRunError(): string | null {
	return stageRunError;
}

export function getStageRunErrorReason(): WorldbuildRunErrorReason | null {
	return stageRunErrorReason;
}

export function getStageRunButtonLabel(): string {
	if (stageRuntimeState === 'queued') return 'Queuing…';
	if (stageRuntimeState === 'running') return 'Running…';
	if (stageRuntimeState === 'failed') return 'Retry Stage Pipeline';
	return 'Run Stage Pipeline';
}

export function isStageRunActive(): boolean {
	return stageRuntimeState === 'queued' || stageRuntimeState === 'running';
}
