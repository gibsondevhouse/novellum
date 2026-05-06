import {
	getCharactersByProjectId,
	getRelationshipsByProjectId,
} from '$modules/world-building/services/character-repository.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const [characters, relationships] = await Promise.all([
		getCharactersByProjectId(params.id),
		getRelationshipsByProjectId(params.id),
	]);
	return { projectId: params.id, characters, relationships };
};
