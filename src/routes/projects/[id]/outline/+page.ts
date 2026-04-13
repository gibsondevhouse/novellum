import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
import { getScenesByChapterId } from '$modules/editor/services/scene-repository.js';
import type { PageLoad } from './$types';
import type { ChapterWithScenes } from '$modules/outliner/types.js';

export const load: PageLoad = async ({ params }) => {
	const chapters = await getChaptersByProjectId(params.id);
	const chaptersWithScenes: ChapterWithScenes[] = await Promise.all(
		chapters.map(async (ch) => ({
			...ch,
			scenes: await getScenesByChapterId(ch.id),
		})),
	);
	return { projectId: params.id, chapters: chaptersWithScenes };
};
