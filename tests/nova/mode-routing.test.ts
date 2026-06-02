/**
 * plan-031 stage-002 phase-005 — Nova mode routing test suite.
 *
 * Covers Ask, Write, and Agent route selection and prompt behaviour,
 * per-project mode persistence, and invalid-value normalisation.
 * AI I/O and OpenRouter are mocked so no network calls are made.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const streamCompleteMock = vi.fn();
const buildRagContextMock = vi.fn();
const runAuthorPipelineTaskMock = vi.fn();
const runAgentLoopMock = vi.fn();

vi.mock('$lib/ai/openrouter.js', async () => {
	const actual = await vi.importActual<typeof import('$lib/ai/openrouter.js')>(
		'$lib/ai/openrouter.js',
	);
	class MockOpenRouterClient {
		streamComplete(...args: unknown[]) {
			return streamCompleteMock(...args);
		}
		complete() {
			return Promise.resolve({ text: '', model: '', tokensUsed: 0 });
		}
	}
	return { ...actual, OpenRouterClient: MockOpenRouterClient };
});

vi.mock('$lib/stores/model-selection.svelte.js', () => ({
	getSelectedModel: () => 'mock/model',
}));

vi.mock('$modules/nova/services/context-hooks.js', () => ({
	buildRagContext: (...args: unknown[]) => buildRagContextMock(...args),
}));

vi.mock('$modules/nova/services/author-pipeline-runner.js', () => ({
	runAuthorPipelineTask: (...args: unknown[]) => runAuthorPipelineTaskMock(...args),
}));

vi.mock('$modules/nova/services/agent-loop.js', () => ({
	runAgentLoop: (...args: unknown[]) => runAgentLoopMock(...args),
	MAX_AGENT_STEPS: 8,
}));

import { sendNovaChat } from '$modules/nova/services/chat-service.js';
import { novaSession } from '$modules/nova/stores/nova-session.svelte.js';
import { novaMode } from '$modules/nova/stores/nova-mode.svelte.js';
import { PIPELINE_TASK_KEYS } from '$lib/ai/pipeline/task-catalog.js';

async function* yieldChunks(chunks: string[]): AsyncGenerator<string> {
	for (const chunk of chunks) yield chunk;
}

const defaultRagResult = {
	aiContext: null,
	contextText: '',
	includedScopes: [],
	warnings: [],
};

describe('NovaComposer source — agent mode copy', () => {
	it('does not label agent mode as coming soon', () => {
		const src = readFileSync(
			resolve(process.cwd(), 'src/modules/nova/components/NovaComposer.svelte'),
			'utf-8',
		);
		// Agent mode description must not claim it is coming soon
		expect(src).not.toMatch(/agent[^>]*coming soon/i);
		// Placeholder must not say agent is routed to Ask
		expect(src).not.toContain('routed to Ask');
		// The MODE_OPTIONS agent description must not literally contain the old stale phrase
		expect(src).not.toContain("Multi-step planning — coming soon.");
	});
});

describe('Nova mode routing — sendNovaChat', () => {
	beforeEach(() => {
		streamCompleteMock.mockReset();
		buildRagContextMock.mockReset();
		runAuthorPipelineTaskMock.mockReset();
		runAgentLoopMock.mockReset();
		buildRagContextMock.mockResolvedValue(defaultRagResult);
		runAgentLoopMock.mockResolvedValue(undefined);
		novaSession.clear();
	});

	it('ask mode streams through the chat path without calling pipeline runner', async () => {
		streamCompleteMock.mockReturnValueOnce(yieldChunks(['Hello.']));

		await sendNovaChat({
			prompt: 'What themes should I explore?',
			mode: 'ask',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
		});

		expect(runAuthorPipelineTaskMock).not.toHaveBeenCalled();
		expect(novaSession.messages).toHaveLength(2);
		expect(novaSession.messages[1].content).toBe('Hello.');
	});

	it('ask mode defaults when mode is omitted', async () => {
		streamCompleteMock.mockReturnValueOnce(yieldChunks(['Hi.']));

		await sendNovaChat({
			prompt: 'Tell me about act two.',
			projectId: null,
			activeSceneId: null,
			activeChapterId: null,
		});

		expect(runAuthorPipelineTaskMock).not.toHaveBeenCalled();
		expect(novaSession.messages[1].content).toBe('Hi.');
	});

	it('write mode + outline request routes to pipeline runner', async () => {
		runAuthorPipelineTaskMock.mockResolvedValue({ ok: true });

		await sendNovaChat({
			prompt: 'Build a chapter outline for act one.',
			mode: 'write',
			projectId: 'p1',
			activeSceneId: 's1',
			activeChapterId: 'c1',
		});

		expect(runAuthorPipelineTaskMock).toHaveBeenCalledWith({
			taskKey: PIPELINE_TASK_KEYS.AUTHOR_OUTLINE,
			projectId: 'p1',
			activeSceneId: 's1',
			activeChapterId: 'c1',
			instruction: 'Build a chapter outline for act one.',
		});
		expect(streamCompleteMock).not.toHaveBeenCalled();
	});

	it('write mode + unsupported concrete request appends unsupported-action state', async () => {
		await sendNovaChat({
			prompt: 'Draft the opening scene in first person.',
			mode: 'write',
			projectId: 'p1',
			activeSceneId: 's1',
			activeChapterId: 'c1',
		});

		expect(runAuthorPipelineTaskMock).not.toHaveBeenCalled();
		expect(streamCompleteMock).not.toHaveBeenCalled();
		const novaMessages = novaSession.messages.filter((m) => m.role === 'nova');
		expect(novaMessages).toHaveLength(1);
		expect(novaMessages[0].intent).toBe('unsupported_action');
		expect(novaMessages[0].content).toContain('outline generation');
		expect(novaMessages[0].content).toContain('Ask mode');
	});

	it('write mode + outline without projectId fails with an error message', async () => {
		await sendNovaChat({
			prompt: 'Create a plot outline for the story.',
			mode: 'write',
			projectId: null,
			activeSceneId: null,
			activeChapterId: null,
		});

		expect(runAuthorPipelineTaskMock).not.toHaveBeenCalled();
		const novaMsg = novaSession.messages.find((m) => m.role === 'nova');
		expect(novaMsg?.status).toBe('error');
	});

	it('agent mode routes to runAgentLoop without streaming', async () => {
		await sendNovaChat({
			prompt: 'Analyze all continuity issues.',
			mode: 'agent',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
		});

		expect(streamCompleteMock).not.toHaveBeenCalled();
		expect(runAuthorPipelineTaskMock).not.toHaveBeenCalled();
		expect(runAgentLoopMock).toHaveBeenCalledWith({
			prompt: 'Analyze all continuity issues.',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
		});
	});
});

describe('Nova mode store — per-project persistence', () => {
	beforeEach(() => {
		window.sessionStorage.clear();
	});

	afterEach(() => {
		window.sessionStorage.clear();
	});

	it('defaults to ask when no persisted value exists', () => {
		novaMode.loadForProject('fresh-project');
		expect(novaMode.current).toBe('ask');
	});

	it('restores the persisted mode for the same project', () => {
		novaMode.loadForProject('proj-a');
		novaMode.setMode('write');
		// Re-load simulates panel close/reopen.
		// Force projectId change then back to trigger loadForProject.
		novaMode.loadForProject('proj-b');
		novaMode.loadForProject('proj-a');
		expect(novaMode.current).toBe('write');
	});

	it('does not leak mode between different projects', () => {
		novaMode.loadForProject('proj-a');
		novaMode.setMode('agent');

		novaMode.loadForProject('proj-b');
		expect(novaMode.current).toBe('ask');
	});

	it('normalises invalid persisted values to ask', () => {
		// Simulate a stale storage value from a previous format.
		window.sessionStorage.setItem('novellum.nova.mode.legacy-proj', 'scribe');
		novaMode.loadForProject('legacy-proj');
		expect(novaMode.current).toBe('ask');
	});

	it('cycles modes in order ask → write → agent → ask', () => {
		novaMode.loadForProject('cycle-test');
		novaMode.setMode('ask');

		novaMode.cycle();
		expect(novaMode.current).toBe('write');

		novaMode.cycle();
		expect(novaMode.current).toBe('agent');

		novaMode.cycle();
		expect(novaMode.current).toBe('ask');
	});
});
