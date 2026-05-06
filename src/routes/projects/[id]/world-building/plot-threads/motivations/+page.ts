import { getPlotThreadsByProjectId } from '$modules/world-building/services/plot-thread-repository.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const plotThreads = await getPlotThreadsByProjectId(params.id);
	return { projectId: params.id, plotThreads };
};
