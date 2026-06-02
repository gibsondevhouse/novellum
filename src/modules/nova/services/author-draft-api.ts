import type { Scene } from '$lib/db/domain-types.js';
import type {
	AuthorDraftCheckpoint,
	SceneDraftContext,
} from '$lib/ai/pipeline/author-draft-contract.js';

type JsonRecord = Record<string, unknown>;

export class AuthorDraftApiError extends Error {
	readonly status: number;
	readonly code?: string;
	readonly meta?: unknown;

	constructor(status: number, message: string, code?: string, meta?: unknown) {
		super(message);
		this.name = 'AuthorDraftApiError';
		this.status = status;
		this.code = code;
		this.meta = meta;
	}
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, init);
	if (!res.ok) {
		const body = (await res.json().catch(() => ({}))) as JsonRecord;
		const errorObj = (body as { error?: unknown }).error;
		const message =
			typeof (errorObj as { message?: unknown } | undefined)?.message === 'string'
				? String((errorObj as { message: string }).message)
				: typeof errorObj === 'string'
					? String(errorObj)
					: `Request failed: ${res.status}`;
		const code =
			typeof (errorObj as { code?: unknown } | undefined)?.code === 'string'
				? String((errorObj as { code: string }).code)
				: undefined;
		const meta =
			typeof (errorObj as { meta?: unknown } | undefined)?.meta !== 'undefined'
				? (errorObj as { meta?: unknown }).meta
				: undefined;
		throw new AuthorDraftApiError(res.status, message, code, meta);
	}
	return res.json() as Promise<T>;
}

export async function getSceneDraftContext(
	projectId: string,
	sceneId: string,
	signal?: AbortSignal,
): Promise<SceneDraftContext> {
	const data = await fetchJson<{ context: SceneDraftContext }>(
		`/api/author-draft/scene-draft-context?projectId=${encodeURIComponent(projectId)}&sceneId=${encodeURIComponent(sceneId)}`,
		{ signal },
	);
	return data.context;
}

export async function listAuthorDraftCheckpoints(
	projectId: string,
	filters?: { chapterId?: string; sceneId?: string; lifecycle?: AuthorDraftCheckpoint['lifecycle'] },
	signal?: AbortSignal,
): Promise<AuthorDraftCheckpoint[]> {
	const params = new URLSearchParams({ projectId });
	if (filters?.chapterId) params.set('chapterId', filters.chapterId);
	if (filters?.sceneId) params.set('sceneId', filters.sceneId);
	if (filters?.lifecycle) params.set('lifecycle', filters.lifecycle);
	const data = await fetchJson<{ checkpoints: AuthorDraftCheckpoint[] }>(
		`/api/author-draft/checkpoints?${params.toString()}`,
		{ signal },
	);
	return data.checkpoints;
}

export async function fetchScenesForChapter(
	projectId: string,
	chapterId: string,
	signal?: AbortSignal,
): Promise<Scene[]> {
	return fetchJson<Scene[]>(
		`/api/db/scenes?projectId=${encodeURIComponent(projectId)}&chapterId=${encodeURIComponent(chapterId)}`,
		{ signal },
	);
}

export async function fetchSceneById(sceneId: string, signal?: AbortSignal): Promise<Scene> {
	return fetchJson<Scene>(`/api/db/scenes/${encodeURIComponent(sceneId)}`, { signal });
}

export async function generateSceneDraftCheckpoint(
	projectId: string,
	sceneId: string,
	options?: { forceRegenerate?: boolean; signal?: AbortSignal },
): Promise<{ checkpoint: AuthorDraftCheckpoint }> {
	return fetchJson<{ checkpoint: AuthorDraftCheckpoint }>(
		'/api/author-draft/checkpoints/generate',
		{
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId,
				sceneId,
				forceRegenerate: options?.forceRegenerate === true,
			}),
			signal: options?.signal,
		},
	);
}

export async function acceptSceneDraftCheckpoint(
	projectId: string,
	checkpointId: string,
	sceneId: string,
	options?: { forceOverwrite?: boolean; signal?: AbortSignal },
): Promise<{ checkpoint: AuthorDraftCheckpoint }> {
	return fetchJson<{ checkpoint: AuthorDraftCheckpoint }>(
		`/api/author-draft/checkpoints/${encodeURIComponent(checkpointId)}/accept`,
		{
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId,
				sceneId,
				forceOverwrite: options?.forceOverwrite === true,
			}),
			signal: options?.signal,
		},
	);
}

export async function rejectSceneDraftCheckpoint(
	projectId: string,
	checkpointId: string,
	reason: string,
	signal?: AbortSignal,
): Promise<{ checkpoint: AuthorDraftCheckpoint }> {
	return fetchJson<{ checkpoint: AuthorDraftCheckpoint }>(
		`/api/author-draft/checkpoints/${encodeURIComponent(checkpointId)}/reject`,
		{
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ projectId, reason }),
			signal,
		},
	);
}
