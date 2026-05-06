import type { PageLoad } from './$types';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';
import { getProjectById } from '$modules/project/services/project-repository.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
import { getCharactersByProjectId } from '$modules/world-building/services/character-repository.js';

export const load: PageLoad = async ({ params }) => {
	const [scenes, project, chapters, characters] = await Promise.all([
		getScenesByProjectId(params.id),
		getProjectById(params.id),
		getChaptersByProjectId(params.id),
		getCharactersByProjectId(params.id),
	]);
	scenes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	chapters.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	return { scenes, project, chapters, characters };
};
