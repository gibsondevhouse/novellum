import type { PageLoad } from './$types';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';
import { apiGet } from '$lib/api-client.js';
import type { WritingStyle } from '$lib/db/domain-types';
import { getProjectHealth } from './services/project-health-service.js';

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ');
}

export const load: PageLoad = async ({ parent }) => {
	const { project } = await parent();
	const [scenes, writingStyles, health] = await Promise.all([
		getScenesByProjectId(project.id),
		apiGet<WritingStyle[]>('/api/db/writing_styles').catch(() => [] as WritingStyle[]),
		getProjectHealth(project.id),
	]);
	const currentWordCount = scenes.reduce((sum, s) => {
		const plain = stripHtml(s.content ?? '').trim();
		return sum + (plain ? plain.split(/\s+/).filter((w) => w.length > 0).length : 0);
	}, 0);
	return { currentWordCount, writingStyles, health };
};
