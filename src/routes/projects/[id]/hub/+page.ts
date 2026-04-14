import type { PageLoad } from './$types';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';

export const load: PageLoad = async ({ parent }) => {
	const { project } = await parent();
	const scenes = await getScenesByProjectId(project.id);
	const currentWordCount = scenes.reduce((sum, s) => sum + (s.wordCount ?? 0), 0);
	return { currentWordCount };
};
