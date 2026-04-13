import { db } from '$lib/db';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const scenes = await db.scenes.where('projectId').equals(params.id).sortBy('order');
	return { scenes };
};
