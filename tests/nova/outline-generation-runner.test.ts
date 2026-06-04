import { describe, expect, it, vi } from 'vitest';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	OUTLINE_DRAFT_TASK_KEY,
	type OutlineDraft,
	type OutlineDraftCheckpointRecord,
} from '../../src/lib/ai/pipeline/outline-draft-contract.js';
import {
	OUTLINE_GENERATION_ENDPOINT,
	createOutlineGenerationRunner,
	type OutlineGenerationRunnerSuccess,
} from '../../src/modules/nova/services/outline-generation-runner.js';

const now = '2026-06-03T14:20:00.000Z';

function createDraft(projectId = 'project-1'): OutlineDraft {
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: `outline-${projectId}`,
		projectId,
		slug: `outline-${projectId}`,
		title: 'Generated Outline',
		sourceContext: {
			summary: 'Ready source context.',
			includedDomains: ['characters'],
			entityCounts: { characters: 1 },
			contextHash: 'ctx-123',
			promptVersion: 'outline-generation-prompt.v1',
		},
		arcs: [
			{
				id: `arc-${projectId}`,
				slug: `arc-${projectId}`,
				title: 'Arc One',
				order: 0,
				summary: '',
				purpose: '',
				acts: [
					{
						id: `act-${projectId}`,
						slug: `act-${projectId}`,
						title: 'Act One',
						order: 0,
						summary: '',
						chapters: [
							{
								id: `chapter-${projectId}`,
								slug: `chapter-${projectId}`,
								title: 'Chapter One',
								order: 0,
								summary: '',
								scenes: [
									{
										id: `scene-${projectId}`,
										slug: `scene-${projectId}`,
										title: 'Scene One',
										order: 0,
										summary: '',
										intent: {
											goal: 'Recover the missing ledger.',
											conflict: 'A rival courier gets there first.',
											turn: 'The ledger names the protagonist.',
											outcome: 'The protagonist is pulled into the conspiracy.',
										},
										characterIds: ['char-1'],
										locationIds: [],
										plotThreadIds: [],
									},
								],
							},
						],
					},
				],
			},
		],
	};
}

function createCheckpoint(projectId = 'project-1'): OutlineDraftCheckpointRecord {
	return {
		id: `checkpoint-${projectId}`,
		projectId,
		ownerId: OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
		taskKey: OUTLINE_DRAFT_TASK_KEY,
		version: OUTLINE_DRAFT_SCHEMA_VERSION,
		lifecycle: 'review',
		draft: createDraft(projectId),
		createdAt: now,
		updatedAt: now,
		review: {
			reviewedAt: now,
			reviewer: 'outline-generation-route',
			note: 'Generated from context ctx-123.',
		},
		acceptance: null,
		rejection: null,
	};
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function successBody() {
	return {
		checkpoint: createCheckpoint(),
		contextHash: 'ctx-123',
		attempts: 1,
		confirmContextReady: true,
	};
}

function successBodyWithConflict() {
	return {
		...successBody(),
		outlineConflict: {
			code: 'outline_conflict',
			state: 'partial',
			hasConflict: true,
			counts: { arcs: 1, acts: 0, chapters: 0, scenes: 0 },
			total: 1,
			message: 'Existing outline hierarchy is partially populated.',
		},
	};
}

function parseLastBody(fetchMock: ReturnType<typeof vi.fn>): Record<string, unknown> {
	const calls = fetchMock.mock.calls as unknown as Array<[string, RequestInit]>;
	const init = calls.at(-1)?.[1];
	if (!init) throw new Error('Expected a fetch call.');
	return JSON.parse(String(init.body)) as Record<string, unknown>;
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

describe('OutlineGenerationRunner', () => {
	it('returns checkpoint id and review payload on success', async () => {
		const fetchMock = vi.fn(async () => jsonResponse(successBody()));
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });

		const result = await runner.run({
			projectId: ' project-1 ',
			instruction: ' Build a mystery spine. ',
			confirmContextReady: true,
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		expect(result.checkpointId).toBe('checkpoint-project-1');
		expect(result.review.note).toContain('ctx-123');
		expect(result.contextHash).toBe('ctx-123');
		expect(result.attempts).toBe(1);
		expect(result.outlineConflict).toBeNull();
		expect(runner.state.status).toBe('succeeded');
		expect(runner.state.result?.checkpointId).toBe(result.checkpointId);

		expect(fetchMock).toHaveBeenCalledWith(
			OUTLINE_GENERATION_ENDPOINT,
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		expect(parseLastBody(fetchMock)).toEqual({
			projectId: 'project-1',
			instruction: 'Build a mystery spine.',
			confirmContextReady: true,
		});
	});

	it('surfaces review-only conflict warnings from successful generation responses', async () => {
		const fetchMock = vi.fn(async () => jsonResponse(successBodyWithConflict()));
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });

		const result = await runner.run({ projectId: 'project-1', confirmContextReady: true });

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		expect(result.outlineConflict).toMatchObject({
			code: 'outline_conflict',
			state: 'partial',
			hasConflict: true,
			counts: { arcs: 1 },
			total: 1,
		});
		expect(runner.state.result?.outlineConflict?.state).toBe('partial');
	});

	it('normalizes provider errors into failed runner state', async () => {
		const fetchMock = vi.fn(async () =>
			jsonResponse(
				{ error: { code: 'no_credentials', message: 'No AI provider credentials configured.' } },
				401,
			),
		);
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });

		const result = await runner.run({ projectId: 'project-1' });

		expect(result.ok).toBe(false);
		expect(result.status).toBe('failed');
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('no_credentials');
		expect(result.error.status).toBe(401);
		expect(runner.state.status).toBe('failed');
		expect(runner.state.error?.code).toBe('no_credentials');
	});

	it('can prepare and retry the last request', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				jsonResponse({ error: { code: 'provider_error', message: 'Provider failed.' } }, 502),
			)
			.mockResolvedValueOnce(jsonResponse(successBody()));
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });
		runner.prepare({ projectId: ' project-1 ', instruction: ' Use a three-act shape. ' });

		expect(runner.state.status).toBe('ready');
		const first = await runner.run();
		expect(first.ok).toBe(false);
		expect(first.status).toBe('failed');

		const retry = await runner.retry();
		expect(retry.ok).toBe(true);
		if (!retry.ok) throw new Error('expected retry success');
		expect(retry.checkpointId).toBe('checkpoint-project-1');
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(parseLastBody(fetchMock)).toEqual({
			projectId: 'project-1',
			instruction: 'Use a three-act shape.',
			confirmContextReady: false,
		});
	});

	it('keeps schema validation failures as typed failure issues', async () => {
		const issues = [{ path: '$.arcs', message: 'Required', code: 'invalid_type' }];
		const fetchMock = vi.fn(async () =>
			jsonResponse(
				{
					error: {
						code: 'schema_validation_failed',
						message: 'Outline generation response did not match the required schema.',
						issues,
					},
				},
				422,
			),
		);
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });

		const result = await runner.run({ projectId: 'project-1' });

		expect(result.ok).toBe(false);
		expect(result.status).toBe('failed');
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('schema_validation_failed');
		expect(result.error.issues).toEqual(issues);
		expect(runner.state.error?.issues).toEqual(issues);
	});

	it('blocks duplicate active runs without starting a second request', async () => {
		const pending = deferred<Response>();
		const fetchMock = vi.fn(() => pending.promise);
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });

		const firstRun = runner.run({ projectId: 'project-1' });
		const duplicate = await runner.run({ projectId: 'project-1' });

		expect(duplicate.ok).toBe(false);
		expect(duplicate.status).toBe('failed');
		if (duplicate.ok) throw new Error('expected duplicate failure');
		expect(duplicate.error.code).toBe('duplicate_run');
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(runner.state.status).toBe('running');

		pending.resolve(jsonResponse(successBody()));
		const firstResult = await firstRun;
		expect(firstResult.ok).toBe(true);
		expect((firstResult as OutlineGenerationRunnerSuccess).checkpointId).toBe(
			'checkpoint-project-1',
		);
		expect(runner.state.status).toBe('succeeded');
	});

	it('reports cancellation distinctly from failure', async () => {
		const fetchMock = vi.fn((_url: string | URL | Request, init?: RequestInit) => {
			return new Promise<Response>((_resolve, reject) => {
				const signal = init?.signal;
				const abort = () => {
					const err = new Error('Aborted');
					err.name = 'AbortError';
					reject(err);
				};
				if (signal?.aborted) {
					abort();
					return;
				}
				signal?.addEventListener('abort', abort, { once: true });
			});
		});
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });

		const run = runner.run({ projectId: 'project-1' });
		runner.cancel('Author cancelled outline generation.');
		const result = await run;

		expect(result.ok).toBe(false);
		expect(result.status).toBe('cancelled');
		if (result.ok || result.status !== 'cancelled') throw new Error('expected cancellation');
		expect(result.error.code).toBe('cancelled');
		expect(result.error.message).toBe('Author cancelled outline generation.');
		expect(runner.state.status).toBe('cancelled');
		expect(runner.state.error?.code).toBe('cancelled');
	});

	it('fails safely when the response body is malformed JSON', async () => {
		const fetchMock = vi.fn(async () =>
			new Response('{not-json', {
				status: 200,
				headers: { 'content-type': 'application/json' },
			}),
		);
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });

		const result = await runner.run({ projectId: 'project-1' });

		expect(result.ok).toBe(false);
		expect(result.status).toBe('failed');
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('malformed_response');
		expect(result.error.status).toBe(200);
	});

	it('fails safely for network errors before a response body exists', async () => {
		const fetchMock = vi.fn(async () => {
			throw new Error('offline');
		});
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });

		const result = await runner.run({ projectId: 'project-1' });

		expect(result.ok).toBe(false);
		expect(result.status).toBe('failed');
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('network_error');
		expect(result.error.message).toContain('offline');
	});
});
