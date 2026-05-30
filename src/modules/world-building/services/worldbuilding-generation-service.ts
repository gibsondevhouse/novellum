/**
 * Client-side wrapper for POST /api/worldbuilding/generate.
 *
 * Calls the generation endpoint and returns parsed draft data.
 * This function is internal to the world-building module — callers
 * should use the generation-draft store's `startGeneration()` instead.
 */
import type { EntityKind } from '../../../routes/api/worldbuilding/generate/+server.js';

export type { EntityKind };

export interface GenerationResult {
	drafts: unknown[];
	entityKind: EntityKind;
	projectContext: { title: string; genre: string; logline: string };
	warning?: 'logline_missing';
}

export interface GenerationError {
	code: string;
	message: string;
}

export async function generateWorldbuildingEntities(params: {
	projectId: string;
	entityKind: EntityKind;
	count: 1 | 3 | 5;
	context?: string;
	signal?: AbortSignal;
}): Promise<GenerationResult> {
	const response = await fetch('/api/worldbuilding/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			projectId: params.projectId,
			entityKind: params.entityKind,
			count: params.count,
			context: params.context,
		}),
		signal: params.signal,
	});

	const data = (await response.json()) as GenerationResult & { error?: GenerationError };

	if (!response.ok || data.error) {
		const err = data.error;
		throw new Error(err?.message ?? `Generation failed (HTTP ${response.status})`);
	}

	return data;
}
