import { db } from '$lib/db/index.js';
import type { ExportSettings } from '$lib/db/types.js';

const DEFAULTS: Omit<ExportSettings, 'id' | 'projectId' | 'createdAt' | 'updatedAt'> = {
	titlePage: true,
	chapterStyle: 'heading',
	fontFamily: 'Georgia',
	fontSize: 12,
	lineSpacing: 1.5,
};

export async function getExportSettings(projectId: string): Promise<ExportSettings> {
	const existing = await db.export_settings.get(projectId);
	if (existing) return existing;
	const now = new Date().toISOString();
	const settings: ExportSettings = {
		id: projectId,
		projectId,
		...DEFAULTS,
		createdAt: now,
		updatedAt: now,
	};
	await db.export_settings.add(settings);
	return settings;
}

export async function updateExportSettings(
	projectId: string,
	updates: Partial<Omit<ExportSettings, 'id' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await db.export_settings.update(projectId, { ...updates, updatedAt: new Date().toISOString() });
}
