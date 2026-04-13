import {
	getCharacterById,
	getCharactersByProjectId,
	getRelationshipsByProjectId,
} from '$modules/bible/services/character-repository.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const [character, allCharacters, relationships] = await Promise.all([
		getCharacterById(params.charId),
		getCharactersByProjectId(params.id),
		getRelationshipsByProjectId(params.id),
	]);
	if (!character) error(404, `Character not found`);
	return {
		projectId: params.id,
		character,
		allCharacters,
		relationships: relationships.filter(
			(r) => r.characterAId === params.charId || r.characterBId === params.charId,
		),
	};
};
