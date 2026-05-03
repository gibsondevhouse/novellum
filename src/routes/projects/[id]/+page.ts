import type { PageLoad } from './$types';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';
import { apiGet } from '$lib/api-client.js';
import type { WritingStyle } from '$lib/db/domain-types';

export const load: PageLoad = async ({ parent }) => {
	const { project } = await parent();
	const [scenes, writingStyles] = await Promise.all([
		getScenesByProjectId(project.id),
		apiGet<WritingStyle[]>('/api/db/writing_styles').catch(() => [] as WritingStyle[]),
	]);
	const currentWordCount = scenes.reduce((sum, s) => sum + (s.wordCount ?? 0), 0);
	return { currentWordCount, writingStyles };
};
