import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
	const project = await db.projects.get(params.id);
	if (!project) {
		error(404, `Project "${params.id}" not found`);
	}
	return { project };
};
