import { apiGet } from '$lib/api-client.js';
import { getPreference } from '$lib/preferences.js';
import type { Scene } from '$lib/db/domain-types';

export interface ProjectHealthSummary {
	lastSavedAt: string | null;
	lastBackupAt: string | null;
	apiKeyConfigured: boolean;
	sceneCount: number;
	wordCount: number;
}

export async function getProjectHealth(projectId: string): Promise<ProjectHealthSummary> {
	const [scenes, lastBackupAt, apiKeyConfigured] = await Promise.all([
		apiGet<Scene[]>('/api/db/scenes', { projectId }).catch(() => [] as Scene[]),
		getPreference<string | null>('backup.lastCompletedAt', null),
		apiGet<{ configured: boolean }>('/api/settings/ai-status', { providerId: 'openrouter' })
			.then((r) => r?.configured ?? false)
			.catch(() => false),
	]);

	const lastSavedAt =
		scenes.length === 0
			? null
			: scenes.reduce(
					(latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
					scenes[0].updatedAt,
				);

	const wordCount = scenes.reduce((sum, s) => {
		const text = (s.content ?? '').replace(/<[^>]+>/g, ' ').trim();
		return sum + (text ? text.split(/\s+/).filter((w) => w.length > 0).length : 0);
	}, 0);

	return {
		lastSavedAt,
		lastBackupAt,
		apiKeyConfigured,
		sceneCount: scenes.length,
		wordCount,
	};
}
