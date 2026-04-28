import { apiGet } from '$lib/api-client.js';
import type { Chapter, Scene } from '$lib/db/domain-types';
import type { ProjectMetrics } from '../types.js';

async function safeCount(endpoint: string, projectId: string): Promise<{ count: number; ready: boolean }> {
	try {
		const rows = await apiGet<unknown[]>(endpoint, { projectId });
		return { count: rows.length, ready: true };
	} catch {
		return { count: 0, ready: false };
	}
}

export async function getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
	const [chapters, scenes, acts, arcs] = await Promise.all([
		apiGet<Chapter[]>('/api/db/chapters', { projectId }),
		apiGet<Scene[]>('/api/db/scenes', { projectId }),
		safeCount('/api/db/acts', projectId),
		safeCount('/api/db/arcs', projectId),
	]);

	return {
		arcs,
		acts,
		chapters: { count: chapters.length, ready: true },
		scenes: { count: scenes.length, ready: true },
	};
}
