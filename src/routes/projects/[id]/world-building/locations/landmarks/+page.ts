import { getLocationsByProjectId } from '$modules/bible/services/location-repository.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const locations = await getLocationsByProjectId(params.id);
	return { projectId: params.id, locations };
};