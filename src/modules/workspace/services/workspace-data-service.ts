import { db } from '$lib/db/index.js';
import type { Arc, Act, Scene, Character } from '$lib/db/types.js';
import type { ChapterWithScenes } from '$modules/outliner/types.js';
import { getArcsByProjectId } from '$modules/outliner/services/arc-repository.js';
import { getActsByProjectId } from '$modules/outliner/services/story-structure-service.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';

export interface WorkspaceData {
	arcs: Arc[];
	acts: Act[];
	chapters: ChapterWithScenes[];
	scenes: Scene[];
	characters: Character[];
}

export async function getWorkspaceData(projectId: string): Promise<WorkspaceData> {
	const [arcs, acts, rawChapters, scenes, characters] = await Promise.all([
		getArcsByProjectId(projectId),
		getActsByProjectId(projectId),
		getChaptersByProjectId(projectId),
		getScenesByProjectId(projectId),
		db.characters.where('projectId').equals(projectId).toArray(),
	]);

	const chapters: ChapterWithScenes[] = rawChapters.map((ch) => ({
		...ch,
		scenes: scenes.filter((s) => s.chapterId === ch.id).sort((a, b) => a.order - b.order),
	}));

	return { arcs, acts, chapters, scenes, characters };
}
