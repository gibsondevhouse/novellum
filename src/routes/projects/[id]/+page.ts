import { db } from '$lib/db';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { project } = await parent();
	const scenes = await db.scenes.where('projectId').equals(project.id).toArray();
	const currentWordCount = scenes.reduce((sum, s) => sum + (s.wordCount ?? 0), 0);
	return { currentWordCount };
};
