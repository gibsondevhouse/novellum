/**
 * Hierarchy Store — tracks the writer's current Arc → Act → Milestone →
 * Chapter → Scene → Beat → Stage selection scoped per project.
 *
 * Selection state is keyed by `projectId` so navigating between projects
 * never leaks context.
 *
 * `null` is a meaningful selection meaning "unassigned" and must
 * round-trip through getters and scoped helpers without throwing.
 *
 * @see plan-013-workspace-hierarchy-flow / stage-001-hierarchy-data-services
 * @see plan-028-v1.1-hierarchical-pipeline-ui / stage-001 phase-001
 */
import { SvelteMap } from 'svelte/reactivity';
import type {
	Act,
	Arc,
	Beat,
	Chapter,
	Milestone,
	Scene,
	Stage,
} from '$lib/db/domain-types';

export const PIPELINE_HIERARCHY_PATH_ORDER = [
	'arc',
	'act',
	'milestone',
	'chapter',
	'scene',
	'beat',
	'stage',
] as const;

export type PipelineHierarchyLayer = (typeof PIPELINE_HIERARCHY_PATH_ORDER)[number];

export interface PipelineHierarchyPath {
	arcId: string | null | undefined;
	actId: string | null | undefined;
	milestoneId: string | null | undefined;
	chapterId: string | null | undefined;
	sceneId: string | null | undefined;
	beatId: string | null | undefined;
	stageId: string | null | undefined;
}

export type PipelineHierarchyReadiness = 'empty' | 'partial' | 'ready';

export type PipelinePathDiagnosticCode =
	| 'stale_node'
	| 'missing_parent'
	| 'relationship_mismatch'
	| 'unsupported_legacy_branch';

export interface PipelinePathDiagnostic {
	code: PipelinePathDiagnosticCode;
	layer: PipelineHierarchyLayer;
	message: string;
	repaired: boolean;
}

interface RepairHierarchyInput {
	arcs: Arc[];
	acts: Act[];
	milestones: Milestone[];
	chapters: Chapter[];
	scenes: Scene[];
	beats: Beat[];
	stages: Stage[];
}

function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
	return items.reduce<Record<string, T>>((acc, item) => {
		acc[item.id] = item;
		return acc;
	}, {});
}

const selections = new SvelteMap<string, PipelineHierarchyPath>();
const diagnosticsByProject = new SvelteMap<string, PipelinePathDiagnostic[]>();

function emptyPath(): PipelineHierarchyPath {
	return {
		arcId: undefined,
		actId: undefined,
		milestoneId: undefined,
		chapterId: undefined,
		sceneId: undefined,
		beatId: undefined,
		stageId: undefined,
	};
}

function clonePath(path: PipelineHierarchyPath): PipelineHierarchyPath {
	return { ...path };
}

function pathsEqual(a: PipelineHierarchyPath, b: PipelineHierarchyPath): boolean {
	return (
		a.arcId === b.arcId &&
		a.actId === b.actId &&
		a.milestoneId === b.milestoneId &&
		a.chapterId === b.chapterId &&
		a.sceneId === b.sceneId &&
		a.beatId === b.beatId &&
		a.stageId === b.stageId
	);
}

function diagnosticsEqual(a: PipelinePathDiagnostic[], b: PipelinePathDiagnostic[]): boolean {
	if (a.length !== b.length) return false;
	return a.every((item, index) => {
		const other = b[index];
		return (
			item.code === other.code &&
			item.layer === other.layer &&
			item.message === other.message &&
			item.repaired === other.repaired
		);
	});
}

function current(projectId: string): PipelineHierarchyPath {
	return selections.get(projectId) ?? emptyPath();
}

function layerIndex(layer: PipelineHierarchyLayer): number {
	return PIPELINE_HIERARCHY_PATH_ORDER.indexOf(layer);
}

function clearFrom(path: PipelineHierarchyPath, fromLayer: PipelineHierarchyLayer): PipelineHierarchyPath {
	const next = clonePath(path);
	const from = layerIndex(fromLayer);
	for (let i = from; i < PIPELINE_HIERARCHY_PATH_ORDER.length; i += 1) {
		const layer = PIPELINE_HIERARCHY_PATH_ORDER[i];
		if (layer === 'arc') next.arcId = undefined;
		if (layer === 'act') next.actId = undefined;
		if (layer === 'milestone') next.milestoneId = undefined;
		if (layer === 'chapter') next.chapterId = undefined;
		if (layer === 'scene') next.sceneId = undefined;
		if (layer === 'beat') next.beatId = undefined;
		if (layer === 'stage') next.stageId = undefined;
	}
	return next;
}

function ensureAncestors(path: PipelineHierarchyPath, forLayer: PipelineHierarchyLayer): PipelineHierarchyPath {
	const next = clonePath(path);
	const index = layerIndex(forLayer);
	for (let i = 0; i < index; i += 1) {
		const layer = PIPELINE_HIERARCHY_PATH_ORDER[i];
		if (layer === 'arc' && next.arcId === undefined) next.arcId = null;
		if (layer === 'act' && next.actId === undefined) next.actId = null;
		if (layer === 'milestone' && next.milestoneId === undefined) next.milestoneId = null;
		if (layer === 'chapter' && next.chapterId === undefined) next.chapterId = null;
		if (layer === 'scene' && next.sceneId === undefined) next.sceneId = null;
		if (layer === 'beat' && next.beatId === undefined) next.beatId = null;
	}
	return next;
}

function setPath(projectId: string, path: PipelineHierarchyPath): void {
	selections.set(projectId, path);
	diagnosticsByProject.set(projectId, []);
}

function withLayerSelection(
	projectId: string,
	layer: PipelineHierarchyLayer,
	value: string | null,
): void {
	let next = clonePath(current(projectId));

	if (layer === 'arc') {
		next = emptyPath();
		next.arcId = value;
		setPath(projectId, next);
		return;
	}

	next = ensureAncestors(next, layer);
	if (layer === 'act') {
		next.actId = value;
		next = clearFrom(next, 'milestone');
		setPath(projectId, next);
		return;
	}

	if (layer === 'milestone') {
		next.milestoneId = value;
		next = clearFrom(next, 'chapter');
		setPath(projectId, next);
		return;
	}

	if (layer === 'chapter') {
		next.chapterId = value;
		next = clearFrom(next, 'scene');
		setPath(projectId, next);
		return;
	}

	if (layer === 'scene') {
		next.sceneId = value;
		next = clearFrom(next, 'beat');
		setPath(projectId, next);
		return;
	}

	if (layer === 'beat') {
		next.beatId = value;
		next = clearFrom(next, 'stage');
		setPath(projectId, next);
		return;
	}

	next.stageId = value;
	setPath(projectId, next);
}

function asValidId(value: string | null | undefined): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function hasAnySelection(path: PipelineHierarchyPath): boolean {
	return PIPELINE_HIERARCHY_PATH_ORDER.some((layer) => {
		if (layer === 'arc') return path.arcId !== undefined;
		if (layer === 'act') return path.actId !== undefined;
		if (layer === 'milestone') return path.milestoneId !== undefined;
		if (layer === 'chapter') return path.chapterId !== undefined;
		if (layer === 'scene') return path.sceneId !== undefined;
		if (layer === 'beat') return path.beatId !== undefined;
		return path.stageId !== undefined;
	});
}

function collectDiagnostics(projectId: string, list: PipelinePathDiagnostic[]): void {
	diagnosticsByProject.set(projectId, list);
}

// --- Selection actions ---

export function selectArc(projectId: string, arcId: string | null): void {
	const entry = current(projectId);
	if (entry.arcId === arcId) return;
	withLayerSelection(projectId, 'arc', arcId);
}

export function selectAct(projectId: string, actId: string | null): void {
	const entry = current(projectId);
	if (entry.actId === actId) return;
	withLayerSelection(projectId, 'act', actId);
}

export function selectMilestone(projectId: string, milestoneId: string | null): void {
	const entry = current(projectId);
	if (entry.milestoneId === milestoneId) return;
	withLayerSelection(projectId, 'milestone', milestoneId);
}

export function selectChapter(projectId: string, chapterId: string | null): void {
	const entry = current(projectId);
	if (entry.chapterId === chapterId) return;
	withLayerSelection(projectId, 'chapter', chapterId);
}

export function selectScene(projectId: string, sceneId: string | null): void {
	const entry = current(projectId);
	if (entry.sceneId === sceneId) return;
	withLayerSelection(projectId, 'scene', sceneId);
}

export function selectBeat(projectId: string, beatId: string | null): void {
	const entry = current(projectId);
	if (entry.beatId === beatId) return;
	withLayerSelection(projectId, 'beat', beatId);
}

export function selectStage(projectId: string, stageId: string | null): void {
	const entry = current(projectId);
	if (entry.stageId === stageId) return;
	withLayerSelection(projectId, 'stage', stageId);
}

export function resetForProject(projectId: string): void {
	if (!selections.has(projectId)) return;
	selections.delete(projectId);
	diagnosticsByProject.delete(projectId);
}

// --- Path validation / repair ---

export function repairPipelineHierarchyPath(
	projectId: string,
	input: RepairHierarchyInput,
): PipelineHierarchyPath {
	const original = clonePath(current(projectId));
	let next = clonePath(original);
	const diagnostics: PipelinePathDiagnostic[] = [];

	const arcsById = indexById(input.arcs);
	const actsById = indexById(input.acts);
	const milestonesById = indexById(input.milestones);
	const chaptersById = indexById(input.chapters);
	const scenesById = indexById(input.scenes);
	const beatsById = indexById(input.beats);
	const stagesById = indexById(input.stages);

	const report = (
		code: PipelinePathDiagnosticCode,
		layer: PipelineHierarchyLayer,
		message: string,
		repaired = true,
	): void => {
		diagnostics.push({ code, layer, message, repaired });
	};

	const clearLayer = (layer: PipelineHierarchyLayer): void => {
		next = clearFrom(next, layer);
	};

	const alignActToArc = (actId: string): boolean => {
		const act = actsById[actId];
		if (!act) {
			report('stale_node', 'act', `Selected act ${actId} no longer exists.`);
			clearLayer('act');
			return false;
		}

		const expectedArc = act.arcId ?? null;
		if (next.arcId !== expectedArc) {
			report(
				'relationship_mismatch',
				'act',
				`Act ${actId} is scoped to arc ${expectedArc ?? 'unassigned'}; repaired arc selection.`,
			);
			next.arcId = expectedArc;
		}
		return true;
	};

	const alignChapterToAct = (chapterId: string): boolean => {
		const chapter = chaptersById[chapterId];
		if (!chapter) {
			report('stale_node', 'chapter', `Selected chapter ${chapterId} no longer exists.`);
			clearLayer('chapter');
			return false;
		}

		const expectedAct = chapter.actId ?? null;
		if (next.actId !== expectedAct) {
			report(
				'relationship_mismatch',
				'chapter',
				`Chapter ${chapterId} is scoped to act ${expectedAct ?? 'unassigned'}; repaired act selection.`,
			);
			next.actId = expectedAct;
		}

		if (expectedAct === null) {
			if (next.arcId === undefined) {
				report('missing_parent', 'act', 'Auto-populated unassigned arc for chapter selection.');
				next.arcId = null;
			}
			return true;
		}

		return alignActToArc(expectedAct);
	};

	const alignSceneToChapter = (sceneId: string): boolean => {
		const scene = scenesById[sceneId];
		if (!scene) {
			report('stale_node', 'scene', `Selected scene ${sceneId} no longer exists.`);
			clearLayer('scene');
			return false;
		}

		if (next.chapterId !== scene.chapterId) {
			report(
				'relationship_mismatch',
				'scene',
				`Scene ${sceneId} belongs to chapter ${scene.chapterId}; repaired chapter selection.`,
			);
			next.chapterId = scene.chapterId;
		}

		return alignChapterToAct(scene.chapterId);
	};

	const alignBeatToScene = (beatId: string): boolean => {
		const beat = beatsById[beatId];
		if (!beat) {
			report('stale_node', 'beat', `Selected beat ${beatId} no longer exists.`);
			clearLayer('beat');
			return false;
		}

		if (!beat.sceneId) {
			report(
				'unsupported_legacy_branch',
				'beat',
				`Beat ${beatId} is not attached to a scene; clearing beat/stage selection for strict hierarchy mode.`,
			);
			clearLayer('beat');
			return false;
		}

		if (next.sceneId !== beat.sceneId) {
			report(
				'relationship_mismatch',
				'beat',
				`Beat ${beatId} belongs to scene ${beat.sceneId}; repaired scene selection.`,
			);
			next.sceneId = beat.sceneId;
		}

		return alignSceneToChapter(beat.sceneId);
	};

	const alignStageToBeat = (stageId: string): boolean => {
		const stage = stagesById[stageId];
		if (!stage) {
			report('stale_node', 'stage', `Selected stage ${stageId} no longer exists.`);
			clearLayer('stage');
			return false;
		}

		if (next.beatId !== stage.beatId) {
			report(
				'relationship_mismatch',
				'stage',
				`Stage ${stageId} belongs to beat ${stage.beatId}; repaired beat selection.`,
			);
			next.beatId = stage.beatId;
		}

		return alignBeatToScene(stage.beatId);
	};

	const selectedStageId = asValidId(next.stageId);
	const selectedBeatId = asValidId(next.beatId);
	const selectedSceneId = asValidId(next.sceneId);
	const selectedChapterId = asValidId(next.chapterId);
	const selectedMilestoneId = asValidId(next.milestoneId);
	const selectedActId = asValidId(next.actId);
	const selectedArcId = asValidId(next.arcId);

	if (selectedStageId) {
		const aligned = alignStageToBeat(selectedStageId);
		if (!aligned) {
			const fallbackBeatId = asValidId(next.beatId);
			if (fallbackBeatId) alignBeatToScene(fallbackBeatId);
		}
	} else if (selectedBeatId) {
		alignBeatToScene(selectedBeatId);
	} else if (selectedSceneId) {
		alignSceneToChapter(selectedSceneId);
	} else if (selectedChapterId) {
		alignChapterToAct(selectedChapterId);
	} else if (selectedMilestoneId) {
		const milestone = milestonesById[selectedMilestoneId];
		if (!milestone) {
			report('stale_node', 'milestone', `Selected milestone ${selectedMilestoneId} no longer exists.`);
			clearLayer('milestone');
		} else {
			if (next.actId !== milestone.actId) {
				report(
					'relationship_mismatch',
					'milestone',
					`Milestone ${selectedMilestoneId} belongs to act ${milestone.actId}; repaired act selection.`,
				);
				next.actId = milestone.actId;
			}
			alignActToArc(milestone.actId);
		}
	} else if (selectedActId) {
		alignActToArc(selectedActId);
	} else if (selectedArcId && !arcsById[selectedArcId]) {
		report('stale_node', 'arc', `Selected arc ${selectedArcId} no longer exists.`);
		clearLayer('arc');
	}

	if (!pathsEqual(original, next)) {
		selections.set(projectId, next);
	}

	const previousDiagnostics = diagnosticsByProject.get(projectId) ?? [];
	if (!diagnosticsEqual(previousDiagnostics, diagnostics)) {
		collectDiagnostics(projectId, diagnostics);
	}
	return next;
}

// --- Getters (SvelteMap reads register reactivity) ---

export function getPipelineHierarchyPath(projectId: string): PipelineHierarchyPath {
	return clonePath(current(projectId));
}

export function getSelectedArcId(projectId: string): string | null | undefined {
	return selections.get(projectId)?.arcId;
}

export function getSelectedActId(projectId: string): string | null | undefined {
	return selections.get(projectId)?.actId;
}

export function getSelectedMilestoneId(projectId: string): string | null | undefined {
	return selections.get(projectId)?.milestoneId;
}

export function getSelectedChapterId(projectId: string): string | null | undefined {
	return selections.get(projectId)?.chapterId;
}

export function getSelectedSceneId(projectId: string): string | null | undefined {
	return selections.get(projectId)?.sceneId;
}

export function getSelectedBeatId(projectId: string): string | null | undefined {
	return selections.get(projectId)?.beatId;
}

export function getSelectedStageId(projectId: string): string | null | undefined {
	return selections.get(projectId)?.stageId;
}

export function getPipelinePathDiagnostics(projectId: string): PipelinePathDiagnostic[] {
	return diagnosticsByProject.get(projectId) ?? [];
}

export function getPipelineHierarchyReadiness(projectId: string): PipelineHierarchyReadiness {
	const path = current(projectId);
	if (!hasAnySelection(path)) return 'empty';
	return hasCompleteHierarchyPath(projectId) ? 'ready' : 'partial';
}

export function hasCompleteHierarchyPath(projectId: string): boolean {
	const path = current(projectId);
	return (
		asValidId(path.arcId) !== null &&
		asValidId(path.actId) !== null &&
		asValidId(path.milestoneId) !== null &&
		asValidId(path.chapterId) !== null &&
		asValidId(path.sceneId) !== null &&
		asValidId(path.beatId) !== null &&
		asValidId(path.stageId) !== null
	);
}

export function hasSelectedStage(projectId: string): boolean {
	return asValidId(current(projectId).stageId) !== null;
}

// --- Scoped list helpers ---
//
// These pure helpers operate on a fully-loaded payload (already fetched via
// the repositories) so consumers can build $derived views without re-issuing
// network calls. They preserve the "unassigned" group semantics: passing
// `null` returns records with no parent, passing a string returns records
// scoped to that parent, passing `undefined` returns the full list.

export function selectActsForArc(
	acts: Act[],
	arcId: string | null | undefined,
): Act[] {
	if (arcId === undefined) return acts;
	if (arcId === null) return acts.filter((a) => !a.arcId);
	return acts.filter((a) => a.arcId === arcId);
}

export function selectChaptersForAct(
	chapters: Chapter[],
	actId: string | null | undefined,
): Chapter[] {
	if (actId === undefined) return chapters;
	if (actId === null) return chapters.filter((c) => !c.actId);
	return chapters.filter((c) => c.actId === actId);
}

export function selectScenesForChapter(
	scenes: Scene[],
	chapterId: string | null | undefined,
): Scene[] {
	if (chapterId === undefined) return scenes;
	if (chapterId === null) return scenes.filter((s) => !s.chapterId);
	return scenes.filter((s) => s.chapterId === chapterId);
}

// Convenience finders used by the workspace shells.

export function getSelectedArc(projectId: string, arcs: Arc[]): Arc | null {
	const id = getSelectedArcId(projectId);
	if (!id) return null;
	return arcs.find((a) => a.id === id) ?? null;
}

export function getSelectedAct(projectId: string, acts: Act[]): Act | null {
	const id = getSelectedActId(projectId);
	if (!id) return null;
	return acts.find((a) => a.id === id) ?? null;
}

export function getSelectedChapter(
	projectId: string,
	chapters: Chapter[],
): Chapter | null {
	const id = getSelectedChapterId(projectId);
	if (!id) return null;
	return chapters.find((c) => c.id === id) ?? null;
}
