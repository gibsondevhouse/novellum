import type { PageLoad } from './$types';
import { getOutlineData } from '$modules/outline/services/outline-data-service.js';

export const ssr = false;

export const load: PageLoad = async ({ params }) => {
	const outline = await getOutlineData(params.id);
	return { projectId: params.id, ...outline };
};

