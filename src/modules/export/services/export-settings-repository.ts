import { apiGet, apiPost, apiPut } from '$lib/api-client.js';
import type { ExportSettings } from '$lib/db/types.js';

const DEFAULTS: Omit<ExportSettings, 'id' | 'projectId' | 'createdAt' | 'updatedAt'> = {
	titlePage: true,
	chapterStyle: 'heading',
	fontFamily: 'Georgia',
	fontSize: 12,
	lineSpacing: 1.5,
};

export async function getExportSettings(projectId: string): Promise<ExportSettings> {
	const result = await apiGet<{ data: ExportSettings | null }>(
		`/api/db/export_settings/${projectId}`,
	);
	if (result.data) return result.data;
	return apiPost<ExportSettings>('/api/db/export_settings', {
		id: projectId,
		projectId,
		...DEFAULTS,
	});
}

export async function updateExportSettings(
	projectId: string,
	updates: Partial<Omit<ExportSettings, 'id' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/export_settings/${projectId}`, updates);
}
