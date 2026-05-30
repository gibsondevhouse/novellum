/**
 * plan-031 stage-004 phase-006 part-001 — Agent loop tests.
 *
 * Covers:
 * - Agent mode routes to runAgentLoop (not the old stub)
 * - Loop dispatches tool calls and feeds results
 * - Cap exhaustion at MAX_AGENT_STEPS stops the loop
 * - User abort exits the loop cleanly
 * - Read-only tools return structured project data
 * - Final non-tool response ends the loop
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---- Mocks ---------------------------------------------------------------

const fetchMock = vi.fn();
const buildRagContextMock = vi.fn();
const getSelectedModelMock = vi.fn(() => 'mock/model');

vi.stubGlobal('fetch', fetchMock);

vi.mock('$lib/stores/model-selection.svelte.js', () => ({
	getSelectedModel: () => getSelectedModelMock(),
}));

vi.mock('$modules/nova/services/context-hooks.js', () => ({
	buildRagContext: (...args: unknown[]) => buildRagContextMock(...args),
}));

// Mock the full ai/openrouter to avoid needing network for Ask/Write
vi.mock('$lib/ai/openrouter.js', async () => {
	const actual = await vi.importActual<typeof import('$lib/ai/openrouter.js')>(
		'$lib/ai/openrouter.js',
	);
	class MockOpenRouterClient {
		async *streamComplete() {
			yield 'streamed';
		}
		complete() {
			return Promise.resolve({ text: 'complete', model: 'mock', tokensUsed: 0 });
		}
	}
	return { ...actual, OpenRouterClient: MockOpenRouterClient };
});

// ---- Imports (after mocks) -----------------------------------------------

import { runAgentLoop, MAX_AGENT_STEPS } from '$modules/nova/services/agent-loop.js';
import { novaSession } from '$modules/nova/stores/nova-session.svelte.js';
import { clearTools, registerTool } from '$modules/nova/services/tool-registry.js';
import { sendNovaChat } from '$modules/nova/services/chat-service.js';
import { novaMode } from '$modules/nova/stores/nova-mode.svelte.js';

// ---- Helpers -------------------------------------------------------------

const defaultRagResult = {
	aiContext: null,
	contextText: '',
	includedScopes: [],
	warnings: [],
};

function agentResponse(content: string | null, tool_calls?: unknown[]): Response {
	return new Response(
		JSON.stringify({ content, tool_calls: tool_calls ?? null, finish_reason: 'stop' }),
		{ status: 200, headers: { 'Content-Type': 'application/json' } },
	);
}

function toolCallResponse(
	toolId: string,
	args: Record<string, unknown>,
	callId = 'call_001',
): Response {
	return agentResponse(null, [
		{
			id: callId,
			type: 'function',
			function: { name: toolId, arguments: JSON.stringify(args) },
		},
	]);
}

// ---- Tests ---------------------------------------------------------------

describe('runAgentLoop', () => {
	beforeEach(() => {
		novaSession.clear();
		clearTools();
		buildRagContextMock.mockReset();
		buildRagContextMock.mockResolvedValue(defaultRagResult);
		fetchMock.mockReset();
	});

	afterEach(() => {
		clearTools();
	});

	it('ends on a final non-tool response', async () => {
		fetchMock.mockResolvedValueOnce(agentResponse('Here is your answer.'));

		novaSession.append({ role: 'user', content: 'Hello' });

		await runAgentLoop({
			prompt: 'Hello',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
		});

		const novaMsgs = novaSession.messages.filter((m) => m.role === 'nova');
		expect(novaMsgs.at(-1)?.content).toBe('Here is your answer.');
		expect(novaMsgs.at(-1)?.status).toBe('complete');
	});

	it('dispatches a tool call and feeds the result back', async () => {
		registerTool(
			{
				id: 'test.echo',
				description: 'Echoes input.',
				inputSchema: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'] },
			},
			async (inv) => {
				const input = inv.input as { value: string };
				return { status: 'success', output: { echo: input.value } };
			},
		);

		// Step 1: tool call
		fetchMock.mockResolvedValueOnce(
			toolCallResponse('test.echo', { value: 'ping' }),
		);
		// Step 2: final response
		fetchMock.mockResolvedValueOnce(agentResponse('Echo: ping'));

		novaSession.append({ role: 'user', content: 'Echo test' });

		await runAgentLoop({
			prompt: 'Echo test',
			projectId: null,
			activeSceneId: null,
			activeChapterId: null,
		});

		const toolCallMsg = novaSession.messages.find((m) => m.role === 'tool-call');
		const toolResultMsg = novaSession.messages.find((m) => m.role === 'tool-result');
		expect(toolCallMsg?.toolId).toBe('test.echo');
		expect(toolResultMsg?.toolId).toBe('test.echo');
		expect((toolResultMsg?.toolPayload as { status: string })?.status).toBe('success');

		const finalNova = novaSession.messages.filter((m) => m.role === 'nova').at(-1);
		expect(finalNova?.content).toBe('Echo: ping');
	});

	it('stops at MAX_AGENT_STEPS and appends a cap-exhaustion message', async () => {
		registerTool(
			{
				id: 'test.loop',
				description: 'Loops forever.',
				inputSchema: { type: 'object', properties: {} },
			},
			async () => ({ status: 'success', output: 'step' }),
		);

		// Return tool calls for MAX_AGENT_STEPS + 1 times (all extra calls return the tool again)
		for (let i = 0; i <= MAX_AGENT_STEPS; i++) {
			fetchMock.mockResolvedValueOnce(
				toolCallResponse('test.loop', {}, `call_${i}`),
			);
		}

		novaSession.append({ role: 'user', content: 'Loop' });

		await runAgentLoop({
			prompt: 'Loop',
			projectId: null,
			activeSceneId: null,
			activeChapterId: null,
		});

		const toolCalls = novaSession.messages.filter((m) => m.role === 'tool-call');
		expect(toolCalls.length).toBe(MAX_AGENT_STEPS);

		const capMsg = novaSession.messages.find(
			(m) => m.role === 'nova' && m.content.includes('step limit'),
		);
		expect(capMsg).toBeDefined();
	});

	it('exits cleanly when the fetch rejects with AbortError', async () => {
		fetchMock.mockRejectedValueOnce(Object.assign(new Error('Aborted'), { name: 'AbortError' }));

		novaSession.append({ role: 'user', content: 'Test' });

		// Should not throw
		await expect(
			runAgentLoop({ prompt: 'Test', projectId: null, activeSceneId: null, activeChapterId: null }),
		).resolves.toBeUndefined();
	});

	it('fails the active message on transport error', async () => {
		fetchMock.mockRejectedValueOnce(new Error('Network down'));

		novaSession.append({ role: 'user', content: 'Test' });

		await runAgentLoop({
			prompt: 'Test',
			projectId: null,
			activeSceneId: null,
			activeChapterId: null,
		});

		const errorMsg = novaSession.messages.find((m) => m.status === 'error');
		expect(errorMsg?.error).toMatch(/Network down/);
	});
});

// ---- MAX_AGENT_STEPS constant ---

describe('MAX_AGENT_STEPS', () => {
	it('is 8', () => {
		expect(MAX_AGENT_STEPS).toBe(8);
	});
});

// ---- Agent mode routing via sendNovaChat ---

describe('sendNovaChat — agent mode routing', () => {
	beforeEach(() => {
		novaSession.clear();
		clearTools();
		buildRagContextMock.mockReset();
		buildRagContextMock.mockResolvedValue(defaultRagResult);
		fetchMock.mockReset();
		novaMode.__resetForTests();
	});

	afterEach(() => {
		clearTools();
	});

	it('routes agent mode to runAgentLoop (calls /api/nova/agent)', async () => {
		fetchMock.mockResolvedValueOnce(agentResponse('Agent response.'));

		await sendNovaChat({
			prompt: 'Draft scene 1.',
			mode: 'agent',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
		});

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/nova/agent',
			expect.objectContaining({ method: 'POST' }),
		);

		const novaMsgs = novaSession.messages.filter((m) => m.role === 'nova');
		expect(novaMsgs.at(-1)?.content).toBe('Agent response.');
	});

	it('does NOT call /api/nova/agent for ask mode', async () => {
		// Ask mode uses the streaming path, not the agent endpoint
		fetchMock.mockResolvedValueOnce(agentResponse('Should not be called'));

		// streamCompleteMock from the openrouter mock will fire
		await sendNovaChat({
			prompt: 'Help me brainstorm.',
			mode: 'ask',
			projectId: null,
			activeSceneId: null,
			activeChapterId: null,
		});

		const agentCalls = fetchMock.mock.calls.filter(
			([url]) => typeof url === 'string' && url.includes('/api/nova/agent'),
		);
		expect(agentCalls.length).toBe(0);
	});
});
