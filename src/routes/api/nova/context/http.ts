import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { buildNovaContext } from '$lib/server/nova/context.js';
import type { NovaContextFileInput, NovaContextRequestPayload } from '$modules/ai/types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function normalizeFileInput(value: unknown): NovaContextFileInput | null {
	if (!isRecord(value)) return null;
	if (typeof value.id !== 'string') return null;
	if (typeof value.name !== 'string') return null;
	if (typeof value.mimeType !== 'string') return null;
	if (typeof value.sizeBytes !== 'number' || !Number.isFinite(value.sizeBytes)) return null;
	if (typeof value.text !== 'string') return null;

	return {
		id: value.id.trim(),
		name: value.name.trim(),
		mimeType: value.mimeType.trim(),
		sizeBytes: Math.max(0, Math.floor(value.sizeBytes)),
		text: value.text,
	};
}

export function normalizeNovaContextRequest(body: unknown): NovaContextRequestPayload | null {
	if (!isRecord(body)) return null;

	const projectIdsRaw = body.projectIds;
	const filesRaw = body.files;
	const promptRaw = body.prompt;

	if (!Array.isArray(projectIdsRaw)) return null;
	if (!Array.isArray(filesRaw)) return null;
	if (promptRaw !== undefined && typeof promptRaw !== 'string') return null;

	const projectIds = projectIdsRaw
		.filter((value): value is string => typeof value === 'string')
		.map((value) => value.trim())
		.filter(Boolean);

	const files: NovaContextFileInput[] = [];
	for (const raw of filesRaw) {
		const parsed = normalizeFileInput(raw);
		if (!parsed) return null;
		files.push(parsed);
	}

	return {
		projectIds,
		files,
		prompt: typeof promptRaw === 'string' ? promptRaw : undefined,
	};
}

export async function buildNovaContextHttpResponse(
	body: unknown,
	database: Pick<typeof db, 'prepare'> = db,
): Promise<Response> {
	const payload = normalizeNovaContextRequest(body);
	if (!payload) {
		return json(
			{
				error:
					'Invalid payload. Expected { projectIds: string[], files: { id, name, mimeType, sizeBytes, text }[], prompt?: string }',
			},
			{ status: 400 },
		);
	}

	const result = buildNovaContext(database, payload);
	return json(result);
}
