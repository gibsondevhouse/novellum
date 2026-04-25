import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { buildNovaContext } from '$lib/server/nova/context.js';
import type {
	NovaContextFileInput,
	NovaContextMode,
	NovaContextRequestPayload,
} from '$modules/ai/types.js';

const VALID_MODES: ReadonlySet<NovaContextMode> = new Set(['off', 'summary', 'targeted', 'full']);

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function normalizeStringArray(value: unknown): string[] | null {
	if (value === undefined) return [];
	if (!Array.isArray(value)) return null;
	const out: string[] = [];
	for (const entry of value) {
		if (typeof entry !== 'string') return null;
		const trimmed = entry.trim();
		if (trimmed) out.push(trimmed);
	}
	return out;
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
	const modeRaw = body.mode;
	const requestedScopesRaw = body.requestedScopes;
	const entityHintsRaw = body.entityHints;

	if (!Array.isArray(projectIdsRaw)) return null;
	if (!Array.isArray(filesRaw)) return null;
	if (promptRaw !== undefined && typeof promptRaw !== 'string') return null;

	let mode: NovaContextMode | undefined;
	if (modeRaw !== undefined) {
		if (typeof modeRaw !== 'string' || !VALID_MODES.has(modeRaw as NovaContextMode)) return null;
		mode = modeRaw as NovaContextMode;
	}

	const requestedScopes = normalizeStringArray(requestedScopesRaw);
	if (requestedScopes === null) return null;
	const entityHints = normalizeStringArray(entityHintsRaw);
	if (entityHints === null) return null;

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
		...(mode !== undefined ? { mode } : {}),
		...(requestedScopes.length > 0 ? { requestedScopes } : {}),
		...(entityHints.length > 0 ? { entityHints } : {}),
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
