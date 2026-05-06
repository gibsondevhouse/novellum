import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	readCharacterScratchpad,
	writeCharacterScratchpad,
} from '$modules/world-building/services/character-dossier-files.js';

export const GET: RequestHandler = async ({ params }) => {
	const scratchpad = await readCharacterScratchpad(params.projectId, params.charId);
	return json(scratchpad);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = (await request.json()) as { content?: string };
	const result = await writeCharacterScratchpad(
		params.projectId,
		params.charId,
		body.content ?? '',
	);
	return json(result);
};