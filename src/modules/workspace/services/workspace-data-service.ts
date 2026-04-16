import { getCharactersByProjectId } from "$modules/bible/services/character-repository.js";
import type { Arc, Act, Scene, Character, Beat, Stage } from '$lib/db/types.js';
import type { ChapterWithScenes } from '$modules/outliner/types.js';
import { getArcsByProjectId } from '$modules/outliner/services/arc-repository.js';
import { getActsByProjectId } from '$modules/outliner/services/story-structure-service.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';
import { getBeatsByProjectId } from '$modules/editor/services/beat-repository.js';
import { getStagesByProjectId } from '$modules/editor/services/stage-repository.js';

export interface WorkspaceData {
	arcs: Arc[];
	acts: Act[];
	chapters: ChapterWithScenes[];
	scenes: Scene[];
	characters: Character[];
	beats: Beat[];
	stages: Stage[];
}

export async function getWorkspaceData(projectId: string): Promise<WorkspaceData> {
	const [arcs, acts, rawChapters, scenes, characters, beats, stages] = await Promise.all([
		getArcsByProjectId(projectId),
		getActsByProjectId(projectId),
		getChaptersByProjectId(projectId),
		getScenesByProjectId(projectId),
		getCharactersByProjectId(projectId),
		getBeatsByProjectId(projectId),
		getStagesByProjectId(projectId)
	]);

	const chapters: ChapterWithScenes[] = rawChapters.map((ch) => ({
		...ch,
		scenes: scenes.filter((s) => s.chapterId === ch.id).sort((a, b) => a.order - b.order),
	}));

	return { arcs, acts, chapters, scenes, characters, beats, stages };
}
