import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
import { createOutlineGenerationRunner } from '../../src/modules/nova/services/outline-generation-runner.js';
import { OutlineGenerationStateStore } from '../../src/modules/nova/stores/outline-generation-state.svelte.js';

const now = '2026-06-03T14:40:00.000Z';

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
			summary: 'Ready context.',
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
											goal: 'Recover the weather ledger.',
											conflict: 'A rival courier blocks the archive.',
											turn: 'The ledger names the protagonist.',
											outcome: 'The protagonist inherits the conspiracy.',
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

function createCheckpoint(
	projectId = 'project-1',
	id = `checkpoint-${projectId}`,
	updatedAt = now,
	lifecycle: OutlineDraftCheckpointRecord['lifecycle'] = 'review',
): OutlineDraftCheckpointRecord {
	return {
		id,
		projectId,
		ownerId: OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
		taskKey: OUTLINE_DRAFT_TASK_KEY,
		version: OUTLINE_DRAFT_SCHEMA_VERSION,
		lifecycle,
		draft: createDraft(projectId),
		createdAt: now,
		updatedAt,
		review:
			lifecycle === 'review'
				? {
						reviewedAt: updatedAt,
						reviewer: 'outline-generation-route',
						note: 'Generated from context ctx-123.',
					}
				: null,
		acceptance: null,
		rejection: null,
	};
}

function successBody(projectId = 'project-1', id = `checkpoint-${projectId}`) {
	return {
		checkpoint: createCheckpoint(projectId, id),
		contextHash: 'ctx-123',
		attempts: 1,
		confirmContextReady: true,
	};
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
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

describe('OutlineGenerationStateStore', () => {
	it('rediscovers pending review checkpoints on reload', async () => {
		const older = createCheckpoint('project-1', 'older', '2026-06-03T12:00:00.000Z');
		const newer = createCheckpoint('project-1', 'newer', '2026-06-03T14:00:00.000Z');
		const accepted = createCheckpoint(
			'project-1',
			'accepted',
			'2026-06-03T15:00:00.000Z',
			'accepted',
		);
		const listCheckpoints = vi.fn(async () => ({ older, newer, accepted }));
		const store = new OutlineGenerationStateStore({ listCheckpoints });

		store.setProject('project-1');
		await store.loadPendingCheckpoints();

		expect(listCheckpoints).toHaveBeenCalledWith('project-1');
		expect(store.status).toBe('review-ready');
		expect(store.checkpoint?.id).toBe('newer');
		expect(store.checkpoints.map((checkpoint) => checkpoint.id)).toEqual(['newer', 'older']);
	});

	it('applies server-returned checkpoint action lifecycle states', () => {
		const store = new OutlineGenerationStateStore({ listCheckpoints: vi.fn(async () => ({})) });
		store.setProject('project-1');

		const rejected = createCheckpoint('project-1', 'checkpoint-1', now, 'rejected');
		store.applyCheckpointActionResult(rejected);
		expect(store.status).toBe('rejected');
		expect(store.checkpoint?.lifecycle).toBe('rejected');

		const accepted = createCheckpoint('project-1', 'checkpoint-1', '2026-06-03T15:00:00.000Z', 'accepted');
		store.applyCheckpointActionResult(accepted);
		expect(store.status).toBe('accepted');
		expect(store.checkpoint?.lifecycle).toBe('accepted');
		expect(store.checkpoints.map((checkpoint) => checkpoint.lifecycle)).toEqual(['accepted']);
	});

	it('retries after route failure and stores the successful checkpoint', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				jsonResponse({ error: { code: 'provider_error', message: 'Provider failed.' } }, 502),
			)
			.mockResolvedValueOnce(jsonResponse(successBody('project-1', 'retry-success')));
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });
		const store = new OutlineGenerationStateStore({ runner, listCheckpoints: vi.fn(async () => ({})) });

		const failed = await store.generate('project-1');
		expect(failed.ok).toBe(false);
		expect(store.status).toBe('failed');
		expect(store.error?.code).toBe('provider_error');

		const retried = await store.retry();
		expect(retried.ok).toBe(true);
		expect(store.status).toBe('review-ready');
		expect(store.checkpoint?.id).toBe('retry-success');
		expect(store.checkpoints.map((checkpoint) => checkpoint.id)).toEqual(['retry-success']);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('passes the caller instruction through to the generation runner', async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(successBody('project-1', 'instruction-success')));
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });
		const store = new OutlineGenerationStateStore({ runner, listCheckpoints: vi.fn(async () => ({})) });

		const result = await store.generate(' project-1 ', ' Use a mystery spine. ');

		expect(result.ok).toBe(true);
		const [, init] = fetchMock.mock.calls[0];
		expect(JSON.parse(String(init?.body))).toMatchObject({
			projectId: 'project-1',
			instruction: 'Use a mystery spine.',
			confirmContextReady: true,
		});
		expect(store.runnerState.lastInput?.instruction).toBe('Use a mystery spine.');
		expect(store.checkpoint?.id).toBe('instruction-success');
	});

	it('resets state and ignores stale completion when the project changes', async () => {
		const pending = deferred<Response>();
		const fetchMock = vi.fn((_url: string | URL | Request, init?: RequestInit) => {
			const signal = init?.signal;
			return new Promise<Response>((resolve, reject) => {
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
				pending.promise.then(resolve, reject);
			});
		});
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });
		const store = new OutlineGenerationStateStore({ runner, listCheckpoints: vi.fn(async () => ({})) });

		const run = store.generate('project-1');
		expect(store.status).toBe('running');
		store.setProject('project-2');
		expect(store.projectId).toBe('project-2');
		expect(store.status).toBe('idle');
		expect(store.checkpoint).toBeNull();

		const result = await run;
		expect(result.ok).toBe(false);
		expect(store.projectId).toBe('project-2');
		expect(store.status).toBe('idle');
		expect(store.checkpoint).toBeNull();
	});

	it('cancels without creating a phantom checkpoint', async () => {
		const pending = deferred<Response>();
		const fetchMock = vi.fn((_url: string | URL | Request, init?: RequestInit) => {
			const signal = init?.signal;
			return new Promise<Response>((resolve, reject) => {
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
				pending.promise.then(resolve, reject);
			});
		});
		const runner = createOutlineGenerationRunner({ fetch: fetchMock });
		const store = new OutlineGenerationStateStore({ runner, listCheckpoints: vi.fn(async () => ({})) });

		const run = store.generate('project-1');
		expect(store.status).toBe('running');
		store.cancel('User cancelled outline generation.');
		const result = await run;

		expect(result.ok).toBe(false);
		expect(result.status).toBe('cancelled');
		expect(store.status).toBe('cancelled');
		expect(store.error?.code).toBe('cancelled');
		expect(store.checkpoint).toBeNull();
		expect(store.active).toBe(false);
	});
});

describe('OutlineGenerationStateStore source contract', () => {
	const storeSource = readFileSync(
		resolve(process.cwd(), 'src/modules/nova/stores/outline-generation-state.svelte.ts'),
		'utf-8',
	);
	const panelSource = readFileSync(
		resolve(process.cwd(), 'src/modules/nova/components/NovaOutlineGenerationPanel.svelte'),
		'utf-8',
	);

	it('uses Svelte runes and does not use legacy writable stores', () => {
		expect(storeSource).toContain('$state');
		expect(storeSource).not.toContain('writable(');
		expect(panelSource).not.toContain('writable(');
	});
});
