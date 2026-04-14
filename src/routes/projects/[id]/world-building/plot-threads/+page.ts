import { getPlotThreadsByProjectId } from '$modules/bible/services/plot-thread-repository.js';
import { db } from '$lib/db';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const [plotThreads, scenes] = await Promise.all([
		getPlotThreadsByProjectId(params.id),
		db.scenes.where('projectId').equals(params.id).toArray(),
	]);
	return { projectId: params.id, plotThreads, scenes };
};
