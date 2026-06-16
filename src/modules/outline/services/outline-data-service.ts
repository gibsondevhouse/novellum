import { getCharactersByProjectId } from '$modules/world-building/services/character-repository.js';
import type { Arc, Act, Scene, Character, Beat, Stage, Milestone } from '$lib/db/domain-types';
import type { ChapterWithScenes } from '$modules/outline/types.js';
import { getArcsByProjectId } from '$modules/project/services/arc-repository.js';
import { getActsByProjectId, getMilestonesByProjectId } from '$modules/outline/services/story-structure-service.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';
import { getBeatsByProjectId } from '$modules/editor/services/beat-repository.js';
import { getStagesByProjectId } from '$modules/editor/services/stage-repository.js';
import {
	normalizeMilestoneChapterIds,
	normalizeSevenLayerOutline,
	type SevenLayerOutline,
} from './seven-layer-outline.js';

export interface OutlineData {
	arcs: Arc[];
	acts: Act[];
	milestones: Milestone[];
	chapters: ChapterWithScenes[];
	scenes: Scene[];
	characters: Character[];
	beats: Beat[];
	stages: Stage[];
}

export async function getOutlineData(projectId: string): Promise<OutlineData> {
	const [arcs, acts, milestones, rawChapters, scenes, characters, beats, stages] = await Promise.all([
		getArcsByProjectId(projectId),
		getActsByProjectId(projectId),
		getMilestonesByProjectId(projectId),
		getChaptersByProjectId(projectId),
		getScenesByProjectId(projectId),
		getCharactersByProjectId(projectId),
		getBeatsByProjectId(projectId),
		getStagesByProjectId(projectId),
	]);

	const normalizedMilestones = milestones.map((milestone) => ({
		...milestone,
		chapterIds: normalizeMilestoneChapterIds(milestone.chapterIds),
	}));

	const chapters: ChapterWithScenes[] = rawChapters.map((ch) => ({
		...ch,
		scenes: scenes.filter((s) => s.chapterId === ch.id).sort((a, b) => a.order - b.order),
	}));

	return { arcs, acts, milestones: normalizedMilestones, chapters, scenes, characters, beats, stages };
}

/**
 * Returns a deterministically-sorted, normalized seven-layer outline
 * for a project. Suitable for AI context assembly (`vibe-author` task
 * family) and pipeline artifact hierarchy semantics. All seven buckets
 * are always present; empty layers are represented as `[]`.
 */
export async function getSevenLayerOutline(projectId: string): Promise<SevenLayerOutline> {
	const [arcs, acts, milestones, chapters, scenes, beats, stages] = await Promise.all([
		getArcsByProjectId(projectId),
		getActsByProjectId(projectId),
		getMilestonesByProjectId(projectId),
		getChaptersByProjectId(projectId),
		getScenesByProjectId(projectId),
		getBeatsByProjectId(projectId),
		getStagesByProjectId(projectId),
	]);
	return normalizeSevenLayerOutline({ arcs, acts, milestones, chapters, scenes, beats, stages });
}
