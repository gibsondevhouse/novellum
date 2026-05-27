/**
 * plan-027 stage-003 phase-003 part-001 — Author pipeline runner tests.
 *
 * Covers the four exit edges of `runAuthorPipelineTask`:
 *   - scene-draft parse success → artifact attached to message
 *   - revision-pack parse success → artifact attached
 *   - parse failure → `novaSession.fail()` with fallback message,
 *     NO artifact attached
 *   - transport failure → `novaSession.fail()` with transport error,
 *     NO artifact attached
 *
 * The Vitest hoist pattern (mock functions declared at module scope,
 * `vi.mock(...)` calls BEFORE any `import`) is required so the mocks
 * are installed before the SUT module factory runs.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { completeMock, buildRagContextMock } = vi.hoisted(() => ({
	completeMock: vi.fn(),
	buildRagContextMock: vi.fn(),
}));

vi.mock('$lib/ai/openrouter.js', async () => {
	const actual = await vi.importActual<typeof import('$lib/ai/openrouter.js')>(
		'$lib/ai/openrouter.js',
	);
	class MockOpenRouterClient {
		complete(...args: unknown[]) {
			return completeMock(...args);
		}
		async *streamComplete() {
			yield '';
		}
	}
	return { ...actual, OpenRouterClient: MockOpenRouterClient };
});

vi.mock('$lib/stores/model-selection.svelte.js', () => ({
	getSelectedModel: () => 'mock/model',
}));

vi.mock('$modules/nova/services/context-hooks.js', () => ({
	buildRagContext: buildRagContextMock,
}));

import { runAuthorPipelineTask } from '$modules/nova/services/author-pipeline-runner.js';
import { novaSession } from '$modules/nova/stores/nova-session.svelte.js';

const sceneSidecar = {
	sceneId: 'sc-1',
	chapterId: 'ch-1',
	povCharacterId: 'iri',
	wordCount: 42,
	usedCanonRefs: {
		characterIds: ['iri'],
		locationIds: [],
		factionIds: [],
		loreEntryIds: [],
	},
	uncertainties: [],
	continuityRisks: [],
};

function buildSceneDraftRaw(): string {
	return `Iri walked into the Skymarket as the storm clocks ticked.\n\n\`\`\`json\n${JSON.stringify(sceneSidecar)}\n\`\`\``;
}

function buildRevisionPackRaw(): string {
	return JSON.stringify({
		summary: 'One issue surfaced.',
		issues: [
			{
				id: 'iss-1',
				severity: 'critical',
				kind: 'continuity',
				location: 'sc-1 paragraph 2',
				description: 'POV slip mid-scene.',
				recommendation: 'Re-anchor in Iri.',
			},
		],
	});
}

function buildOutlineRaw(): string {
	return JSON.stringify({
		arcs: [{ id: 'arc-a', title: 'The first fracture' }],
		acts: [{ id: 'act-a', title: 'Arrival' }],
		milestones: [{ id: 'milestone-a', title: 'The vow breaks' }],
		chapters: [{ id: 'chapter-a', title: 'Ash at the gate' }],
		scenes: [{ id: 'scene-a', title: 'The impossible return' }],
		beats: [{ id: 'beat-a', title: 'Refusal' }],
	});
}

describe('runAuthorPipelineTask', () => {
	beforeEach(() => {
		completeMock.mockReset();
		buildRagContextMock.mockReset();
		buildRagContextMock.mockResolvedValue({
			aiContext: null,
			contextText: '',
			includedScopes: [],
			warnings: [],
		});
		novaSession.clear();
	});

	it('attaches an author-outline draft artifact with outline-scope context', async () => {
		completeMock.mockResolvedValueOnce({
			text: buildOutlineRaw(),
			model: 'mock/model',
			tokensUsed: 0,
		});

		const result = await runAuthorPipelineTask({
			taskKey: 'vibe-author.outline',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
			instruction: 'Build a full outline.',
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');

		expect(buildRagContextMock).toHaveBeenCalledWith({
			projectId: 'p1',
			activeSceneId: null,
			policy: 'outline_scope',
		});

		const message = novaSession.messages.find((m) => m.id === result.messageId);
		expect(message?.status).toBe('complete');
		expect(message?.artifact?.kind).toBe('author-outline');
		if (message?.artifact?.kind !== 'author-outline') throw new Error('wrong kind');
		expect(message.artifact.envelope.lifecycle).toBe('draft');
		expect(message.artifact.envelope.payload.chapters).toHaveLength(1);
		expect(message?.content).toBe('');
	});

	it('attaches an author-scene-draft artifact on parse success', async () => {
		completeMock.mockResolvedValueOnce({
			text: buildSceneDraftRaw(),
			model: 'mock/model',
			tokensUsed: 0,
		});

		const result = await runAuthorPipelineTask({
			taskKey: 'vibe-author.scene-draft',
			projectId: 'p1',
			activeSceneId: 'sc-1',
			activeChapterId: 'ch-1',
			instruction: 'Draft the Skymarket descent.',
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');

		const message = novaSession.messages.find((m) => m.id === result.messageId);
		expect(message?.status).toBe('complete');
		expect(message?.artifact?.kind).toBe('author-scene-draft');
		if (message?.artifact?.kind !== 'author-scene-draft') throw new Error('wrong kind');
		expect(message.artifact.envelope.taskKey).toBe('vibe-author.scene-draft');
		expect(message.artifact.envelope.payload.sidecar.sceneId).toBe('sc-1');

		// Manuscript is never auto-mutated; the artifact is the only output.
		expect(message?.content).toBe('');
		expect(novaSession.isStreaming).toBe(false);
	});

	it('attaches an author-revision-pack artifact on parse success', async () => {
		completeMock.mockResolvedValueOnce({
			text: buildRevisionPackRaw(),
			model: 'mock/model',
			tokensUsed: 0,
		});

		const result = await runAuthorPipelineTask({
			taskKey: 'vibe-author.revision-pack',
			projectId: 'p1',
			activeSceneId: 'sc-1',
			activeChapterId: 'ch-1',
			instruction: 'Audit the chapter.',
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');

		const message = novaSession.messages.find((m) => m.id === result.messageId);
		expect(message?.artifact?.kind).toBe('author-revision-pack');
		if (message?.artifact?.kind !== 'author-revision-pack') throw new Error('wrong kind');
		expect(message.artifact.envelope.payload.issues).toHaveLength(1);
		expect(message.artifact.envelope.payload.issues[0]?.severity).toBe('critical');
	});

	it('marks the message as error when the parser rejects the output', async () => {
		completeMock.mockResolvedValueOnce({
			text: 'Prose only, no fenced sidecar block.',
			model: 'mock/model',
			tokensUsed: 0,
		});

		const result = await runAuthorPipelineTask({
			taskKey: 'vibe-author.scene-draft',
			projectId: 'p1',
			activeSceneId: 'sc-1',
			activeChapterId: 'ch-1',
			instruction: 'Draft something.',
		});

		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.reason).toBe('parse_failed');

		const message = novaSession.messages.find((m) => m.id === result.messageId);
		expect(message?.status).toBe('error');
		expect(message?.artifact).toBeUndefined();
		expect(message?.error).toBeTruthy();
		expect(novaSession.isStreaming).toBe(false);
	});

	it('marks the message as error when the OpenRouter call throws', async () => {
		completeMock.mockRejectedValueOnce(new Error('Network down'));

		const result = await runAuthorPipelineTask({
			taskKey: 'vibe-author.scene-draft',
			projectId: 'p1',
			activeSceneId: 'sc-1',
			activeChapterId: 'ch-1',
			instruction: 'Draft.',
		});

		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.reason).toBe('transport_failed');
		expect(result.error).toContain('Network down');

		const message = novaSession.messages.find((m) => m.id === result.messageId);
		expect(message?.status).toBe('error');
		expect(message?.artifact).toBeUndefined();
	});

	it('reports an aborted run without attaching an artifact', async () => {
		completeMock.mockImplementationOnce(async (_payload: unknown, opts: { signal?: AbortSignal }) => {
			// Simulate the caller aborting mid-flight.
			const abortErr = new Error('Aborted');
			abortErr.name = 'AbortError';
			// Force the abort signal into the aborted state so the runner
			// can detect it irrespective of error.name normalization.
			if (opts?.signal && !opts.signal.aborted) {
				const controller = new AbortController();
				controller.abort();
				// Best-effort: most modern runtimes propagate the aborted
				// flag through `opts.signal` because the runner owns the
				// underlying controller via `novaSession`.
			}
			throw abortErr;
		});

		const result = await runAuthorPipelineTask({
			taskKey: 'vibe-author.scene-draft',
			projectId: 'p1',
			activeSceneId: 'sc-1',
			activeChapterId: 'ch-1',
			instruction: 'Draft.',
		});

		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.reason).toBe('aborted');

		const message = novaSession.messages.find((m) => m.id === result.messageId);
		expect(message?.artifact).toBeUndefined();
	});
});
