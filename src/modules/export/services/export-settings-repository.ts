import { apiGet, apiPost, apiPut } from '$lib/api-client.js';
import type { ExportSettings } from '$lib/db/domain-types';
import { DEFAULT_EXPORT_SETTINGS } from '../constants.js';

export async function getExportSettings(projectId: string): Promise<ExportSettings> {
	const result = await apiGet<{ data: ExportSettings | null }>(
		`/api/db/export_settings/${projectId}`,
	);
	if (result.data) return result.data;
	return apiPost<ExportSettings>('/api/db/export_settings', {
		id: projectId,
		projectId,
		...DEFAULT_EXPORT_SETTINGS,
	});
}

export async function updateExportSettings(
	projectId: string,
	updates: Partial<Omit<ExportSettings, 'id' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/export_settings/${projectId}`, updates);
}
