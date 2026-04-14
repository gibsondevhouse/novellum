import { getPlotThreadsByProjectId } from '$modules/bible/services/plot-thread-repository.js';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const [plotThreads, scenes] = await Promise.all([
		getPlotThreadsByProjectId(params.id),
		getScenesByProjectId(params.id),
	]);
	return { projectId: params.id, plotThreads, scenes };
};
