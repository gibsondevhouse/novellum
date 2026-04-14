import type { PageLoad } from './$types';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';

export const load: PageLoad = async ({ params }) => {
	const scenes = await getScenesByProjectId(params.id);
	scenes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	return { scenes };
};
