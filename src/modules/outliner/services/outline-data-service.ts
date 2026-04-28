import { getCharactersByProjectId } from '$modules/bible/services/character-repository.js';
import type { Arc, Act, Scene, Character, Beat, Stage, Milestone } from '$lib/db/types.js';
import type { ChapterWithScenes } from '$modules/outliner/types.js';
import { getArcsByProjectId } from '$modules/project/services/arc-repository.js';
import { getActsByProjectId, getMilestonesByProjectId } from '$modules/outliner/services/story-structure-service.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';
import { getBeatsByProjectId } from '$modules/editor/services/beat-repository.js';
import { getStagesByProjectId } from '$modules/editor/services/stage-repository.js';

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

	const chapters: ChapterWithScenes[] = rawChapters.map((ch) => ({
		...ch,
		scenes: scenes.filter((s) => s.chapterId === ch.id).sort((a, b) => a.order - b.order),
	}));

	return { arcs, acts, milestones, chapters, scenes, characters, beats, stages };
}
