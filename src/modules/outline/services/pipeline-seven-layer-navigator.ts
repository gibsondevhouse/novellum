import type {
	Act,
	Arc,
	Beat,
	Chapter,
	Milestone,
	Scene,
	Stage,
} from '$lib/db/domain-types';
import type { PipelineHierarchyLayer, PipelineHierarchyPath } from './seven-layer-outline.js';

export interface SevenLayerNavigatorNode {
	id: string;
	label: string;
	meta?: string;
}

export interface SevenLayerNavigatorColumn {
	layer: PipelineHierarchyLayer;
	title: string;
	selectedId: string | null | undefined;
	items: SevenLayerNavigatorNode[];
	emptyTitle: string;
	emptyHint: string;
}

export interface SevenLayerNavigatorBreadcrumb {
	layer: PipelineHierarchyLayer;
	label: string;
}

export interface SevenLayerNavigatorModel {
	columns: SevenLayerNavigatorColumn[];
	breadcrumbs: SevenLayerNavigatorBreadcrumb[];
}

interface BuildNavigatorInput {
	path: PipelineHierarchyPath;
	arcs: Arc[];
	acts: Act[];
	milestones: Milestone[];
	chapters: Chapter[];
	scenes: Scene[];
	beats: Beat[];
	stages: Stage[];
}

function byOrderThenTitle<T extends { order?: number; title?: string }>(items: T[]): T[] {
	return [...items].sort((a, b) => {
		const orderDiff = (a.order ?? 0) - (b.order ?? 0);
		if (orderDiff !== 0) return orderDiff;
		return (a.title ?? '').localeCompare(b.title ?? '');
	});
}

function chapterIdsForMilestone(milestone: Milestone, chaptersById: Map<string, Chapter>): Chapter[] {
	return (milestone.chapterIds ?? [])
		.map((id) => chaptersById.get(id))
		.filter((chapter): chapter is Chapter => Boolean(chapter));
}

function asNode<T extends { id: string; title: string }>(item: T): SevenLayerNavigatorNode {
	return { id: item.id, label: item.title || 'Untitled' };
}

function asValidId(value: string | null | undefined): string | null {
	if (typeof value !== 'string') return value === null ? null : null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function layerLabel(layer: PipelineHierarchyLayer): string {
	if (layer === 'arc') return 'Arc';
	if (layer === 'act') return 'Act';
	if (layer === 'milestone') return 'Milestone';
	if (layer === 'chapter') return 'Chapter';
	if (layer === 'scene') return 'Scene';
	if (layer === 'beat') return 'Beat';
	return 'Stage';
}

function resolveLayerEntityLabel(
	layer: PipelineHierarchyLayer,
	value: string | null | undefined,
	input: BuildNavigatorInput,
): string {
	if (value === null) return `Unassigned ${layerLabel(layer)}`;
	if (value === undefined) return layerLabel(layer);
	if (layer === 'arc') {
		return input.arcs.find((item) => item.id === value)?.title ?? `Missing Arc (${value})`;
	}
	if (layer === 'act') {
		return input.acts.find((item) => item.id === value)?.title ?? `Missing Act (${value})`;
	}
	if (layer === 'milestone') {
		return (
			input.milestones.find((item) => item.id === value)?.title ??
			`Missing Milestone (${value})`
		);
	}
	if (layer === 'chapter') {
		return input.chapters.find((item) => item.id === value)?.title ?? `Missing Chapter (${value})`;
	}
	if (layer === 'scene') {
		return input.scenes.find((item) => item.id === value)?.title ?? `Missing Scene (${value})`;
	}
	if (layer === 'beat') {
		return input.beats.find((item) => item.id === value)?.title ?? `Missing Beat (${value})`;
	}
	return input.stages.find((item) => item.id === value)?.title ?? `Missing Stage (${value})`;
}

export function buildSevenLayerNavigatorModel(input: BuildNavigatorInput): SevenLayerNavigatorModel {
	const sortedArcs = byOrderThenTitle(input.arcs);
	const sortedActs = byOrderThenTitle(input.acts);
	const sortedMilestones = byOrderThenTitle(input.milestones);
	const sortedChapters = byOrderThenTitle(input.chapters);
	const sortedScenes = byOrderThenTitle(input.scenes);
	const sortedBeats = byOrderThenTitle(input.beats.filter((beat) => Boolean(beat.sceneId)));
	const sortedStages = byOrderThenTitle(input.stages);

	const selectedArcId = input.path.arcId;
	const selectedActId = input.path.actId;
	const selectedMilestoneId = input.path.milestoneId;
	const selectedChapterId = input.path.chapterId;
	const selectedSceneId = input.path.sceneId;
	const selectedBeatId = input.path.beatId;
	const selectedStageId = input.path.stageId;

	const acts =
		selectedArcId === undefined
			? []
			: selectedArcId === null
				? sortedActs.filter((item) => !item.arcId)
				: sortedActs.filter((item) => item.arcId === selectedArcId);

	const milestones =
		asValidId(selectedActId) === null
			? []
			: sortedMilestones.filter((item) => item.actId === selectedActId);

	const chaptersById = new Map(sortedChapters.map((chapter) => [chapter.id, chapter]));
	const selectedMilestone =
		asValidId(selectedMilestoneId) === null
			? null
			: sortedMilestones.find((milestone) => milestone.id === selectedMilestoneId) ?? null;
	const chapters = selectedMilestone ? chapterIdsForMilestone(selectedMilestone, chaptersById) : [];

	const scenes =
		asValidId(selectedChapterId) === null
			? []
			: sortedScenes.filter((scene) => scene.chapterId === selectedChapterId);

	const beats =
		asValidId(selectedSceneId) === null
			? []
			: sortedBeats.filter((beat) => beat.sceneId === selectedSceneId);

	const stages =
		asValidId(selectedBeatId) === null
			? []
			: sortedStages.filter((stage) => stage.beatId === selectedBeatId);

	const columns: SevenLayerNavigatorColumn[] = [
		{
			layer: 'arc',
			title: 'Arcs',
			selectedId: selectedArcId,
			items: sortedArcs.map(asNode),
			emptyTitle: 'No arcs yet',
			emptyHint: 'Create the first arc to anchor hierarchy traversal.',
		},
		{
			layer: 'act',
			title: 'Acts',
			selectedId: selectedActId,
			items: acts.map(asNode),
			emptyTitle: 'No acts in scope',
			emptyHint:
				selectedArcId === undefined
					? 'Select an arc to load scoped acts.'
					: 'Add or assign acts to this arc to continue.',
		},
		{
			layer: 'milestone',
			title: 'Milestones',
			selectedId: selectedMilestoneId,
			items: milestones.map(asNode),
			emptyTitle: 'No milestones in scope',
			emptyHint:
				selectedActId === undefined
					? 'Select an act to load milestones.'
					: 'Define milestones for the selected act.',
		},
		{
			layer: 'chapter',
			title: 'Chapters',
			selectedId: selectedChapterId,
			items: chapters.map(asNode),
			emptyTitle: 'No chapters in scope',
			emptyHint:
				selectedMilestoneId === undefined
					? 'Select a milestone to load linked chapters.'
					: 'Link chapters to this milestone to continue.',
		},
		{
			layer: 'scene',
			title: 'Scenes',
			selectedId: selectedSceneId,
			items: scenes.map(asNode),
			emptyTitle: 'No scenes in scope',
			emptyHint:
				selectedChapterId === undefined
					? 'Select a chapter to load scenes.'
					: 'Add scenes to the selected chapter.',
		},
		{
			layer: 'beat',
			title: 'Beats',
			selectedId: selectedBeatId,
			items: beats.map(asNode),
			emptyTitle: 'No beats in scope',
			emptyHint:
				selectedSceneId === undefined
					? 'Select a scene to load beats.'
					: 'Add beats to the selected scene.',
		},
		{
			layer: 'stage',
			title: 'Stages',
			selectedId: selectedStageId,
			items: stages.map(asNode),
			emptyTitle: 'No stages in scope',
			emptyHint:
				selectedBeatId === undefined
					? 'Select a beat to load stages.'
					: 'Create stages for the selected beat.',
		},
	];

	const breadcrumbs: SevenLayerNavigatorBreadcrumb[] = [];
	const sequence: Array<[PipelineHierarchyLayer, string | null | undefined]> = [
		['arc', selectedArcId],
		['act', selectedActId],
		['milestone', selectedMilestoneId],
		['chapter', selectedChapterId],
		['scene', selectedSceneId],
		['beat', selectedBeatId],
		['stage', selectedStageId],
	];

	for (const [layer, value] of sequence) {
		if (value === undefined) break;
		breadcrumbs.push({
			layer,
			label: resolveLayerEntityLabel(layer, value, input),
		});
	}

	return { columns, breadcrumbs };
}
