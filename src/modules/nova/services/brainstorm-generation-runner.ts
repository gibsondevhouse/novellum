import { parseBrainstormOutput } from '$lib/ai/brainstorm-agent.js';
import type {
	BrainstormAgentContextConstraints,
	BrainstormProposalCategory,
	BrainstormSession,
} from '$lib/ai/types.js';
import { novaSession } from '../stores/nova-session.svelte.js';

export const BRAINSTORM_GENERATION_ENDPOINT = '/api/ai/brainstorm/generate' as const;

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface BrainstormGenerationInput {
	seedIdea: string;
	projectId?: string | null;
	activeSceneId?: string | null;
	activeChapterId?: string | null;
	context?: BrainstormAgentContextConstraints;
	requestedCategories?: BrainstormProposalCategory[];
	maxProposalsPerCategory?: number;
}

export interface BrainstormGenerationOptions {
	fetch?: FetchLike;
	endpoint?: string;
	signal?: AbortSignal;
}

export interface BrainstormGenerationError {
	code: string;
	message: string;
	status?: number;
	details?: string[];
}

export interface BrainstormGenerationSuccess {
	ok: true;
	status: 'succeeded';
	session: BrainstormSession;
	model: string | null;
	tokensUsed: number;
	includedScopes: string[];
	warnings: string[];
	contextItemCount: number;
}

export interface BrainstormGenerationFailure {
	ok: false;
	status: 'failed';
	error: BrainstormGenerationError;
}

export interface BrainstormGenerationCancellation {
	ok: false;
	status: 'cancelled';
	error: BrainstormGenerationError & { code: 'cancelled' };
}

export type BrainstormGenerationResult =
	| BrainstormGenerationSuccess
	| BrainstormGenerationFailure
	| BrainstormGenerationCancellation;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fetchUnavailable(): Promise<Response> {
	throw new Error('fetch is unavailable in this environment.');
}

function normalizeInput(input: BrainstormGenerationInput): BrainstormGenerationInput {
	return {
		seedIdea: input.seedIdea.trim(),
		projectId: input.projectId?.trim() || null,
		activeSceneId: input.activeSceneId?.trim() || null,
		activeChapterId: input.activeChapterId?.trim() || null,
		context: input.context,
		requestedCategories: input.requestedCategories,
		maxProposalsPerCategory: input.maxProposalsPerCategory,
	};
}

function createFailure(
	code: string,
	message: string,
	extra: Omit<BrainstormGenerationError, 'code' | 'message'> = {},
): BrainstormGenerationFailure {
	return {
		ok: false,
		status: 'failed',
		error: {
			code,
			message,
			...extra,
		},
	};
}

function createCancellation(message: string): BrainstormGenerationCancellation {
	return {
		ok: false,
		status: 'cancelled',
		error: {
			code: 'cancelled',
			message,
		},
	};
}

function isAbortError(err: unknown): boolean {
	return (
		(err instanceof DOMException && err.name === 'AbortError') ||
		(err instanceof Error && err.name === 'AbortError')
	);
}

async function readJsonBody(
	response: Response,
): Promise<{ ok: true; value: unknown } | { ok: false; error: BrainstormGenerationError }> {
	const text = await response.text();
	if (!text.trim()) return { ok: true, value: null };
	try {
		return { ok: true, value: JSON.parse(text) as unknown };
	} catch {
		return {
			ok: false,
			error: {
				code: 'malformed_response',
				message: 'Brainstorm generation response was not valid JSON.',
				status: response.status,
			},
		};
	}
}

function normalizeServerError(status: number, body: unknown): BrainstormGenerationError {
	const errorValue = isRecord(body) ? body.error : null;
	const error = isRecord(errorValue) ? errorValue : null;
	return {
		code: typeof error?.code === 'string' ? error.code : 'request_failed',
		message:
			typeof error?.message === 'string'
				? error.message
				: `Brainstorm generation request failed with status ${status}.`,
		status,
		details: Array.isArray(error?.details) ? error.details.filter((item): item is string => typeof item === 'string') : undefined,
	};
}

function normalizeSuccessBody(body: unknown): BrainstormGenerationSuccess | BrainstormGenerationFailure {
	if (!isRecord(body)) {
		return createFailure('malformed_response', 'Brainstorm generation response was malformed.');
	}

	try {
		const session = parseBrainstormOutput(JSON.stringify(body.session));
		return {
			ok: true,
			status: 'succeeded',
			session,
			model: typeof body.model === 'string' ? body.model : null,
			tokensUsed: typeof body.tokensUsed === 'number' ? body.tokensUsed : 0,
			includedScopes: Array.isArray(body.includedScopes)
				? body.includedScopes.filter((item): item is string => typeof item === 'string')
				: ['seed'],
			warnings: Array.isArray(body.warnings)
				? body.warnings.filter((item): item is string => typeof item === 'string')
				: [],
			contextItemCount: typeof body.contextItemCount === 'number' ? body.contextItemCount : 0,
		};
	} catch (err) {
		const details =
			err && typeof err === 'object' && 'details' in err && Array.isArray(err.details)
				? err.details.filter((item): item is string => typeof item === 'string')
				: undefined;
		return createFailure('malformed_response', 'Brainstorm generation session was malformed.', {
			details,
		});
	}
}

export async function requestBrainstormGeneration(
	input: BrainstormGenerationInput,
	options: BrainstormGenerationOptions = {},
): Promise<BrainstormGenerationResult> {
	const normalized = normalizeInput(input);
	if (!normalized.seedIdea) {
		return createFailure('invalid_request', 'seedIdea is required.');
	}

	const fetcher =
		options.fetch ??
		(typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : fetchUnavailable);
	const endpoint = options.endpoint ?? BRAINSTORM_GENERATION_ENDPOINT;

	try {
		const response = await fetcher(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(normalized),
			signal: options.signal,
		});
		const body = await readJsonBody(response);
		if (!body.ok) return { ok: false, status: 'failed', error: body.error };
		if (!response.ok) {
			return { ok: false, status: 'failed', error: normalizeServerError(response.status, body.value) };
		}
		return normalizeSuccessBody(body.value);
	} catch (err) {
		if (options.signal?.aborted || isAbortError(err)) {
			return createCancellation('Brainstorm generation was cancelled.');
		}
		return createFailure(
			'network_error',
			err instanceof Error ? err.message : 'Brainstorm generation request failed.',
		);
	}
}

export async function runNovaBrainstormSession(
	input: BrainstormGenerationInput,
	options: BrainstormGenerationOptions = {},
): Promise<BrainstormGenerationResult> {
	const normalized = normalizeInput(input);
	if (!normalized.seedIdea || novaSession.isStreaming) {
		return createFailure(
			!normalized.seedIdea ? 'invalid_request' : 'duplicate_run',
			!normalized.seedIdea ? 'seedIdea is required.' : 'Nova is already generating a response.',
		);
	}

	novaSession.append({
		role: 'user',
		content: `Brainstorm: ${normalized.seedIdea}`,
		status: 'complete',
	});
	const message = novaSession.beginStream('nova');
	const signal = options.signal ?? novaSession.getSignal(message.id) ?? undefined;
	const result = await requestBrainstormGeneration(normalized, { ...options, signal });

	if (result.ok) {
		novaSession.setContextDisclosure(result.includedScopes, result.contextItemCount, {
			warnings: result.warnings,
			truncated: result.warnings.some((warning) => /trimmed|truncated/i.test(warning)),
		});
		novaSession.attachArtifact(message.id, {
			kind: 'brainstorm-session',
			session: result.session,
		});
		return result;
	}

	if (result.status === 'cancelled') {
		if (novaSession.activeStreamId === message.id) {
			novaSession.abort(message.id);
		}
		return result;
	}

	novaSession.fail(message.id, result.error.message);
	return result;
}
