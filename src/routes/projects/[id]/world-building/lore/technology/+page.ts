import { getLoreEntriesByProjectId } from '$modules/world-building/services/lore-entry-repository.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const loreEntries = await getLoreEntriesByProjectId(params.id);
	return { projectId: params.id, loreEntries };
};
