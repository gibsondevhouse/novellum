import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request }) => {
	void request;

	return json(
		{
			ok: false,
			code: 'outline_apply_retired',
			error:
				'Legacy outline apply is retired. Generate an outline checkpoint and accept it through the checkpoint review flow.',
		},
		{ status: 410 },
	);
};
