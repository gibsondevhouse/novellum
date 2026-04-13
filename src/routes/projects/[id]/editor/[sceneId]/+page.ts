import type { PageLoad } from './$types';
import { getSceneById } from '$modules/editor/services/scene-repository.js';
import { getChapterById } from '$modules/project/services/chapter-repository.js';

export const load: PageLoad = async ({ params }) => {
	const scene = await getSceneById(params.sceneId);
	if (!scene) throw new Error(`Scene not found: ${params.sceneId}`);
	const chapter = scene.chapterId ? await getChapterById(scene.chapterId) : null;
	return { scene, chapter };
};
