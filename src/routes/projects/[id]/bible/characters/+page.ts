import { getCharactersByProjectId } from '$modules/bible/services/character-repository.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const characters = await getCharactersByProjectId(params.id);
	return { projectId: params.id, characters };
};
