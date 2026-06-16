import type { AuthorSceneDraftPayload } from '$lib/ai/pipeline/author-agent.js';
import type { AuthorDraftCheckpoint } from '$lib/ai/pipeline/author-draft-contract.js';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import {
	classifyNovaArtifactAction,
	createInsufficientContextResult,
	createNovaArtifactActionResult,
	createStaleTargetResult,
	type NovaArtifactActionAuditMetadata,
	type NovaArtifactActionKind,
	type NovaArtifactActionResult,
} from './artifact-action-types.js';

type FetchLike = typeof fetch;
type JsonRecord = Record<string, unknown>;

export interface InlineSceneDraftActionDeps {
	fetch?: FetchLike;
}

export interface InlineSceneDraftBaseInput {
	projectId?: string | null;
	envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>;
	sceneId?: string | null;
	signal?: AbortSignal;
	audit?: NovaArtifactActionAuditMetadata;
}

export interface StageInlineSceneDraftResultData {
	checkpoint: AuthorDraftCheckpoint;
}

export type StageInlineSceneDraftResult =
	NovaArtifactActionResult<StageInlineSceneDraftResultData>;

export interface RejectInlineSceneDraftInput extends InlineSceneDraftBaseInput {
	reason?: string;
}

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function resolveSceneId(envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>, sceneId?: string | null): string | null {
	return (
		asString(sceneId) ??
		asString(envelope.payload.sidecar?.sceneId) ??
		envelope.hierarchy.references.scenes[0] ??
		null
	);
}

function resolveFetch(deps: InlineSceneDraftActionDeps): FetchLike {
	const fetcher = deps.fetch ?? globalThis.fetch;
	if (!fetcher) {
		throw new Error('Inline scene draft actions require a fetch-capable browser context.');
	}
	return fetcher.bind(globalThis) as FetchLike;
}

async function readJson(response: Response): Promise<unknown> {
	try {
		return await response.json();
	} catch {
		return {};
	}
}

function errorMessage(payload: unknown, fallback: string): { message: string; code?: string; meta?: unknown } {
	const record = isRecord(payload) ? payload : {};
	const errorValue = record.error;
	const errorRecord = isRecord(errorValue) ? errorValue : {};
	return {
		message:
			asString(errorRecord.message) ??
			asString(errorValue) ??
			asString(record.message) ??
			fallback,
		code: asString(errorRecord.code) ?? asString(record.code) ?? undefined,
		meta: errorRecord.meta ?? record.meta,
	};
}

function baseActionInput(input: InlineSceneDraftBaseInput, action: NovaArtifactActionKind) {
	return {
		action,
		classification: classifyNovaArtifactAction('author-scene-draft', action),
		artifactKind: 'author-scene-draft' as const,
		envelope: input.envelope,
		projectId: input.projectId ?? null,
		sceneId: resolveSceneId(input.envelope, input.sceneId),
		audit: input.audit,
	};
}

export async function stageInlineSceneDraftCheckpoint(
	input: InlineSceneDraftBaseInput & { action?: Extract<NovaArtifactActionKind, 'accept' | 'reject'> },
	deps: InlineSceneDraftActionDeps = {},
): Promise<StageInlineSceneDraftResult> {
	const action = input.action ?? 'accept';
	const actionInput = baseActionInput(input, action);
	const projectId = asString(input.projectId);
	const sceneId = resolveSceneId(input.envelope, input.sceneId);
	const prose = typeof input.envelope.payload.prose === 'string' ? input.envelope.payload.prose : '';

	if (!projectId) {
		return createInsufficientContextResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
			...actionInput,
			reason: 'Open a project before saving this scene draft for review.',
		});
	}
	if (!sceneId) {
		return createInsufficientContextResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
			...actionInput,
			reason: 'Open the target scene before acting on this draft.',
		});
	}
	if (prose.trim().length === 0) {
		return createInsufficientContextResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
			...actionInput,
			reason: 'This scene draft has no prose to save for review.',
		});
	}

	try {
		const response = await resolveFetch(deps)('/api/author-draft/checkpoints/stage-inline', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ projectId, sceneId, envelope: input.envelope }),
			signal: input.signal,
		});
		const payload = await readJson(response);
		if (!response.ok) {
			const parsed = errorMessage(payload, `Could not save scene draft for review: ${response.status}`);
			if (response.status === 409 || parsed.code === 'stale_target') {
				return createStaleTargetResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
					...actionInput,
					message: parsed.message,
				});
			}
			return createNovaArtifactActionResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
				...actionInput,
				status: 'failed',
				durability: 'not_started',
				errorCode: parsed.code ?? 'stage_failed',
				message: parsed.message,
				data: undefined,
			});
		}
		const checkpoint = isRecord(payload) ? payload.checkpoint as AuthorDraftCheckpoint | undefined : undefined;
		if (!checkpoint) {
			return createNovaArtifactActionResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
				...actionInput,
				status: 'failed',
				durability: 'not_started',
				errorCode: 'invalid_response',
				message: 'The draft was not saved because the server response was incomplete.',
			});
		}
		return createNovaArtifactActionResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
			...actionInput,
			checkpointId: checkpoint.id,
			status: 'succeeded',
			durability: 'durable',
			message: 'Draft saved for review. Confirm before applying it to the scene.',
			data: { checkpoint },
		});
	} catch (err) {
		return createNovaArtifactActionResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
			...actionInput,
			status: 'failed',
			durability: 'not_started',
			errorCode: 'network_error',
			message: err instanceof Error ? err.message : 'Could not save scene draft for review.',
		});
	}
}

export async function rejectInlineSceneDraftCheckpoint(
	input: RejectInlineSceneDraftInput,
	deps: InlineSceneDraftActionDeps = {},
): Promise<StageInlineSceneDraftResult> {
	const staged = await stageInlineSceneDraftCheckpoint({ ...input, action: 'reject' }, deps);
	if (staged.status !== 'succeeded' || !staged.data?.checkpoint) return staged;

	const projectId = asString(input.projectId);
	if (!projectId) return staged;

	try {
		const reason = input.reason?.trim() || 'Rejected from Nova inline scene draft review.';
		const response = await resolveFetch(deps)(
			`/api/author-draft/checkpoints/${encodeURIComponent(staged.data.checkpoint.id)}/reject`,
			{
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ projectId, reason }),
				signal: input.signal,
			},
		);
		const payload = await readJson(response);
		if (!response.ok) {
			const parsed = errorMessage(payload, `Could not reject saved draft: ${response.status}`);
			return createNovaArtifactActionResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
				...baseActionInput(input, 'reject'),
				checkpointId: staged.data.checkpoint.id,
				status: 'failed',
				durability: 'durable',
				errorCode: parsed.code ?? 'reject_failed',
				message: parsed.message,
				data: staged.data,
			});
		}
		const checkpoint = isRecord(payload)
			? payload.checkpoint as AuthorDraftCheckpoint | undefined
			: undefined;
		if (!checkpoint) {
			return createNovaArtifactActionResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
				...baseActionInput(input, 'reject'),
				checkpointId: staged.data.checkpoint.id,
				status: 'failed',
				durability: 'durable',
				errorCode: 'invalid_response',
				message: 'The draft was saved, but the reject response was incomplete.',
				data: staged.data,
			});
		}
		return createNovaArtifactActionResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
			...baseActionInput(input, 'reject'),
			checkpointId: checkpoint.id,
			status: 'succeeded',
			durability: 'durable',
			message: 'Draft rejected and saved to review history.',
			data: { checkpoint },
		});
	} catch (err) {
		return createNovaArtifactActionResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
			...baseActionInput(input, 'reject'),
			checkpointId: staged.data.checkpoint.id,
			status: 'failed',
			durability: 'durable',
			errorCode: 'network_error',
			message: err instanceof Error ? err.message : 'Could not reject the saved draft.',
			data: staged.data,
		});
	}
}
