import {
	validateOutlineDraftCheckpoint,
	type OutlineDraftCheckpointRecord,
	type OutlineDraftReviewState,
	type OutlineDraftValidationIssue,
} from '$lib/ai/pipeline/outline-draft-contract.js';
import type {
	OutlineContextMissingPrerequisite,
	OutlineContextWarning,
} from '$lib/ai/pipeline/outline-context-sufficiency.js';

type JsonRecord = Record<string, unknown>;
type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export const OUTLINE_GENERATION_ENDPOINT = '/api/ai/outline/generate' as const;

export type OutlineGenerationRunnerStatus =
	| 'idle'
	| 'ready'
	| 'running'
	| 'succeeded'
	| 'failed'
	| 'cancelled';

export interface OutlineGenerationRunnerInput {
	projectId: string;
	instruction?: string;
	confirmContextReady?: boolean;
}

export interface OutlineGenerationRunnerRunOptions {
	signal?: AbortSignal;
}

export interface OutlineGenerationRunnerError {
	code: string;
	message: string;
	status?: number;
	missing?: OutlineContextMissingPrerequisite[];
	warnings?: OutlineContextWarning[];
	issues?: OutlineDraftValidationIssue[];
}

export interface OutlineGenerationConflictWarning {
	code: 'outline_conflict';
	state: 'partial' | 'populated';
	hasConflict: true;
	counts: Record<string, number>;
	total: number;
	message: string;
}

export interface OutlineGenerationRunnerSuccess {
	ok: true;
	status: 'succeeded';
	checkpointId: string;
	checkpoint: OutlineDraftCheckpointRecord;
	review: OutlineDraftReviewState;
	contextHash: string | null;
	attempts: number;
	confirmContextReady: boolean;
	outlineConflict: OutlineGenerationConflictWarning | null;
}

export interface OutlineGenerationRunnerFailure {
	ok: false;
	status: 'failed';
	error: OutlineGenerationRunnerError;
}

export interface OutlineGenerationRunnerCancellation {
	ok: false;
	status: 'cancelled';
	error: OutlineGenerationRunnerError & { code: 'cancelled' };
}

export type OutlineGenerationRunnerResult =
	| OutlineGenerationRunnerSuccess
	| OutlineGenerationRunnerFailure
	| OutlineGenerationRunnerCancellation;

export interface OutlineGenerationRunnerState {
	status: OutlineGenerationRunnerStatus;
	active: boolean;
	lastInput: OutlineGenerationRunnerInput | null;
	result: OutlineGenerationRunnerSuccess | null;
	error: OutlineGenerationRunnerError | null;
}

export interface OutlineGenerationRunnerOptions {
	fetch?: FetchLike;
	endpoint?: string;
}

interface CombinedSignal {
	signal: AbortSignal;
	cleanup: () => void;
}

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeInput(input: OutlineGenerationRunnerInput): OutlineGenerationRunnerInput {
	return {
		projectId: input.projectId.trim(),
		instruction: input.instruction?.trim() || undefined,
		confirmContextReady: input.confirmContextReady === true,
	};
}

function createFailure(
	code: string,
	message: string,
	extra: Omit<OutlineGenerationRunnerError, 'code' | 'message'> = {},
): OutlineGenerationRunnerFailure {
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

function createCancellation(message: string): OutlineGenerationRunnerCancellation {
	return {
		ok: false,
		status: 'cancelled',
		error: {
			code: 'cancelled',
			message,
		},
	};
}

function createCombinedSignal(signals: AbortSignal[]): CombinedSignal {
	const activeSignals = signals.filter(Boolean);
	if (activeSignals.length === 0) {
		const controller = new AbortController();
		return { signal: controller.signal, cleanup: () => undefined };
	}
	if (activeSignals.length === 1) {
		return { signal: activeSignals[0]!, cleanup: () => undefined };
	}
	if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any === 'function') {
		return { signal: AbortSignal.any(activeSignals), cleanup: () => undefined };
	}

	const controller = new AbortController();
	const abort = () => {
		if (!controller.signal.aborted) controller.abort();
	};
	const cleanup = () => {
		for (const signal of activeSignals) {
			signal.removeEventListener('abort', abort);
		}
	};

	for (const signal of activeSignals) {
		if (signal.aborted) {
			abort();
			break;
		}
		signal.addEventListener('abort', abort, { once: true });
	}

	return { signal: controller.signal, cleanup };
}

function isAbortError(err: unknown): boolean {
	return (
		(err instanceof DOMException && err.name === 'AbortError') ||
		(err instanceof Error && err.name === 'AbortError')
	);
}

async function readJsonBody(response: Response): Promise<
	| { ok: true; value: unknown }
	| { ok: false; error: OutlineGenerationRunnerError }
> {
	const text = await response.text();
	if (!text.trim()) return { ok: true, value: null };

	try {
		return { ok: true, value: JSON.parse(text) as unknown };
	} catch {
		return {
			ok: false,
			error: {
				code: 'malformed_response',
				message: 'Outline generation response was not valid JSON.',
				status: response.status,
			},
		};
	}
}

function arrayOrUndefined<T>(value: unknown): T[] | undefined {
	return Array.isArray(value) ? (value as T[]) : undefined;
}

function normalizeServerError(status: number, body: unknown): OutlineGenerationRunnerError {
	const errorValue = isRecord(body) ? body.error : null;
	const error = isRecord(errorValue) ? errorValue : null;
	const code = typeof error?.code === 'string' ? error.code : 'request_failed';
	const message =
		typeof error?.message === 'string'
			? error.message
			: `Outline generation request failed with status ${status}.`;

	return {
		code,
		message,
		status,
		missing: arrayOrUndefined<OutlineContextMissingPrerequisite>(error?.missing),
		warnings: arrayOrUndefined<OutlineContextWarning>(error?.warnings),
		issues: arrayOrUndefined<OutlineDraftValidationIssue>(error?.issues),
	};
}

function normalizeConflictWarning(value: unknown): OutlineGenerationConflictWarning | null {
	if (!isRecord(value)) return null;
	if (value.code !== 'outline_conflict' || value.hasConflict !== true) return null;
	if (value.state !== 'partial' && value.state !== 'populated') return null;
	if (!isRecord(value.counts)) return null;
	const counts = Object.fromEntries(
		Object.entries(value.counts).filter(([, count]) => typeof count === 'number'),
	) as Record<string, number>;
	return {
		code: 'outline_conflict',
		state: value.state,
		hasConflict: true,
		counts,
		total: typeof value.total === 'number' ? value.total : Object.values(counts).reduce((a, b) => a + b, 0),
		message:
			typeof value.message === 'string'
				? value.message
				: 'Existing outline hierarchy is populated.',
	};
}

function normalizeSuccessBody(
	body: unknown,
): OutlineGenerationRunnerSuccess | OutlineGenerationRunnerFailure {
	if (!isRecord(body)) {
		return createFailure('malformed_response', 'Outline generation response was malformed.', {
			issues: [{ path: '$', message: 'Response body must be an object.', code: 'invalid_type' }],
		});
	}

	const checkpointResult = validateOutlineDraftCheckpoint(body.checkpoint);
	if (!checkpointResult.ok) {
		return createFailure('malformed_response', 'Outline generation checkpoint was malformed.', {
			issues: checkpointResult.issues,
		});
	}

	const checkpoint = checkpointResult.data;
	if (checkpoint.lifecycle !== 'review' || !checkpoint.review) {
		return createFailure(
			'malformed_response',
			'Outline generation checkpoint must be ready for review.',
			{
				issues: [
					{
						path: '$.checkpoint.review',
						message: 'Generated outline checkpoint must include a review payload.',
						code: 'invalid_state',
					},
				],
			},
		);
	}

	const contextHash =
		typeof body.contextHash === 'string'
			? body.contextHash
			: checkpoint.draft.sourceContext.contextHash ?? null;
	const attempts = typeof body.attempts === 'number' && Number.isFinite(body.attempts)
		? body.attempts
		: 0;

	return {
		ok: true,
		status: 'succeeded',
		checkpointId: checkpoint.id,
		checkpoint,
		review: checkpoint.review,
		contextHash,
		attempts,
		confirmContextReady: body.confirmContextReady === true,
		outlineConflict: normalizeConflictWarning(body.outlineConflict),
	};
}

function fetchUnavailable(): Promise<Response> {
	throw new Error('fetch is unavailable in this environment.');
}

export class OutlineGenerationRunner {
	#fetcher: FetchLike;
	#endpoint: string;
	#activeController: AbortController | null = null;
	#cancelMessage = 'Outline generation was cancelled.';
	#state: OutlineGenerationRunnerState = {
		status: 'idle',
		active: false,
		lastInput: null,
		result: null,
		error: null,
	};

	constructor(options: OutlineGenerationRunnerOptions = {}) {
		const globalFetch =
			typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null;
		this.#fetcher = options.fetch ?? globalFetch ?? fetchUnavailable;
		this.#endpoint = options.endpoint ?? OUTLINE_GENERATION_ENDPOINT;
	}

	get state(): OutlineGenerationRunnerState {
		return this.#state;
	}

	prepare(input: OutlineGenerationRunnerInput): void {
		this.#state = {
			status: 'ready',
			active: false,
			lastInput: normalizeInput(input),
			result: null,
			error: null,
		};
	}

	cancel(message = 'Outline generation was cancelled.'): void {
		if (!this.#activeController) return;
		this.#cancelMessage = message.trim() || 'Outline generation was cancelled.';
		this.#state = {
			...this.#state,
			status: 'cancelled',
			active: true,
			result: null,
			error: {
				code: 'cancelled',
				message: this.#cancelMessage,
			},
		};
		this.#activeController.abort();
	}

	async retry(options: OutlineGenerationRunnerRunOptions = {}): Promise<OutlineGenerationRunnerResult> {
		if (!this.#state.lastInput) {
			const result = createFailure(
				'invalid_request',
				'Cannot retry outline generation before a request has been prepared.',
			);
			this.#state = {
				status: 'failed',
				active: false,
				lastInput: null,
				result: null,
				error: result.error,
			};
			return result;
		}
		return this.run(this.#state.lastInput, options);
	}

	async run(
		input?: OutlineGenerationRunnerInput,
		options: OutlineGenerationRunnerRunOptions = {},
	): Promise<OutlineGenerationRunnerResult> {
		if (this.#activeController) {
			return createFailure(
				'duplicate_run',
				'Outline generation is already running.',
			);
		}

		const normalizedInput = input ? normalizeInput(input) : this.#state.lastInput;
		if (!normalizedInput?.projectId) {
			const result = createFailure('invalid_request', 'projectId is required.');
			this.#state = {
				status: 'failed',
				active: false,
				lastInput: normalizedInput ?? null,
				result: null,
				error: result.error,
			};
			return result;
		}

		const controller = new AbortController();
		this.#activeController = controller;
		this.#cancelMessage = 'Outline generation was cancelled.';
		const combined = createCombinedSignal(
			options.signal ? [controller.signal, options.signal] : [controller.signal],
		);

		this.#state = {
			status: 'running',
			active: true,
			lastInput: normalizedInput,
			result: null,
			error: null,
		};

		try {
			if (combined.signal.aborted) {
				return this.#finishCancelled(this.#cancelMessage);
			}

			const response = await this.#fetcher(this.#endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(normalizedInput),
				signal: combined.signal,
			});

			if (combined.signal.aborted) {
				return this.#finishCancelled(this.#cancelMessage);
			}

			const jsonBody = await readJsonBody(response);
			if (!jsonBody.ok) {
				return this.#finishFailed(jsonBody.error);
			}

			if (!response.ok) {
				const error = normalizeServerError(response.status, jsonBody.value);
				if (response.status === 499 || error.code === 'aborted') {
					return this.#finishCancelled(error.message);
				}
				return this.#finishFailed(error);
			}

			const result = normalizeSuccessBody(jsonBody.value);
			if (!result.ok) {
				return this.#finishFailed(result.error);
			}
			return this.#finishSucceeded(result);
		} catch (err) {
			if (combined.signal.aborted || controller.signal.aborted || isAbortError(err)) {
				return this.#finishCancelled(this.#cancelMessage);
			}
			const message = err instanceof Error ? err.message : 'Network request failed.';
			return this.#finishFailed({
				code: 'network_error',
				message,
			});
		} finally {
			combined.cleanup();
			if (this.#activeController === controller) {
				this.#activeController = null;
			}
		}
	}

	#finishSucceeded(result: OutlineGenerationRunnerSuccess): OutlineGenerationRunnerSuccess {
		this.#state = {
			status: 'succeeded',
			active: false,
			lastInput: this.#state.lastInput,
			result,
			error: null,
		};
		return result;
	}

	#finishFailed(error: OutlineGenerationRunnerError): OutlineGenerationRunnerFailure {
		const result: OutlineGenerationRunnerFailure = {
			ok: false,
			status: 'failed',
			error,
		};
		this.#state = {
			status: 'failed',
			active: false,
			lastInput: this.#state.lastInput,
			result: null,
			error,
		};
		return result;
	}

	#finishCancelled(message: string): OutlineGenerationRunnerCancellation {
		const result = createCancellation(message);
		this.#state = {
			status: 'cancelled',
			active: false,
			lastInput: this.#state.lastInput,
			result: null,
			error: result.error,
		};
		return result;
	}
}

export function createOutlineGenerationRunner(
	options?: OutlineGenerationRunnerOptions,
): OutlineGenerationRunner {
	return new OutlineGenerationRunner(options);
}
