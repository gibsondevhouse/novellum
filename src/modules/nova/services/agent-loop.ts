/**
 * plan-031 stage-004 phase-004 + phase-005 — Nova Agent-mode tool loop.
 *
 * Runs a bounded multi-step tool loop for Agent mode:
 *   1. Calls /api/nova/agent (non-streaming, tool-capable) for each step.
 *   2. Dispatches tool calls through dispatchTool (tool-router).
 *   3. Appends tool-call and tool-result chips to the session.
 *   4. Repeats until: no tool calls, MAX_AGENT_STEPS reached, or user abort.
 *   5. Final assistant content is streamed into the last nova message.
 *
 * Hard step cap: MAX_AGENT_STEPS = 8. The cap-exhaustion state is
 * surfaced in the message log so the user knows the loop stopped.
 *
 * Abort: the active stream's AbortSignal is threaded through to the
 * fetch. When the user clicks Stop, novaSession.abort(id) fires the
 * signal, the fetch throws AbortError, and the loop exits cleanly.
 */

import { buildPrompt } from '$lib/ai/prompt-builder.js';
import { resolveTask } from '$lib/ai/task-resolver.js';
import { getSelectedModel } from '$lib/stores/model-selection.svelte.js';
import type { AiContext, AiTask, UiContext } from '$lib/ai/types.js';
import { novaSession } from '../stores/nova-session.svelte.js';
import { buildRagContext } from './context-hooks.js';
import { dispatchTool } from './tool-router.js';
import { listModelCallableTools } from './tool-registry.js';
import type { ToolDefinition, ToolInvocation } from '../types.js';

export const MAX_AGENT_STEPS = 8;

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface OpenRouterToolCall {
	id: string;
	type: 'function';
	function: { name: string; arguments: string };
}

type AgentMessage =
	| { role: 'system'; content: string }
	| { role: 'user'; content: string }
	| { role: 'assistant'; content: string | null; tool_calls?: OpenRouterToolCall[] }
	| { role: 'tool'; tool_call_id: string; content: string };

interface AgentCompletionResult {
	content: string | null;
	tool_calls: OpenRouterToolCall[] | null;
	finish_reason: string;
}

export interface AgentLoopInput {
	prompt: string;
	projectId: string | null;
	activeSceneId: string | null;
	activeChapterId: string | null;
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const EMPTY_AI_CONTEXT: AiContext = {
	policy: 'scene_plus_adjacent',
	scene: null,
	adjacentScenes: [],
	chapter: null,
	beats: [],
	characters: [],
	locations: [],
	loreEntries: [],
	plotThreads: [],
};

function toOpenRouterTool(def: ToolDefinition): {
	type: 'function';
	function: { name: string; description: string; parameters: unknown };
} {
	return {
		type: 'function',
		function: {
			name: def.id,
			description: def.description,
			parameters: def.inputSchema,
		},
	};
}

function tryParseJson(str: string): unknown {
	try {
		return JSON.parse(str);
	} catch {
		return str;
	}
}

async function callAgentEndpoint(
	model: string,
	messages: AgentMessage[],
	tools: ReturnType<typeof toOpenRouterTool>[],
	signal: AbortSignal | undefined,
): Promise<AgentCompletionResult> {
	const res = await fetch('/api/nova/agent', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ model, messages, tools }),
		signal,
	});

	if (!res.ok) {
		const body = (await res.json().catch(() => ({}))) as {
			error?: { code?: string; message?: string };
		};
		const code = body.error?.code;
		if (res.status === 401 && code === 'no_credentials') {
			throw new Error('No AI provider credentials configured.');
		}
		throw new Error(body.error?.message ?? `Agent endpoint error ${res.status}`);
	}

	return res.json() as Promise<AgentCompletionResult>;
}

// --------------------------------------------------------------------------
// Main loop
// --------------------------------------------------------------------------

export async function runAgentLoop(input: AgentLoopInput): Promise<void> {
	const { prompt, projectId, activeSceneId, activeChapterId } = input;
	const trimmed = prompt.trim();

	// Build RAG context for the system prompt
	let aiContext: AiContext = EMPTY_AI_CONTEXT;
	let ragResult: Awaited<ReturnType<typeof buildRagContext>> | null = null;
	try {
		ragResult = await buildRagContext({
			projectId: projectId ?? '',
			activeSceneId,
			policy: 'scene_plus_adjacent',
		});
		if (ragResult.aiContext) aiContext = ragResult.aiContext;
	} catch {
		// Fall back to empty context.
	}

	// Build system prompt using the 'agent' task type
	const uiCtx: UiContext = {
		activeProjectId: projectId,
		activeSceneId,
		activeChapterId,
		activeBeatId: null,
		instruction: trimmed,
	};
	const task: AiTask = resolveTask('agent', uiCtx);
	const systemPrompt = buildPrompt(task, aiContext);

	// Set context disclosure
	novaSession.setContextDisclosure(ragResult?.includedScopes ?? ['no-context'], 0, {
		warnings: ragResult?.warnings ?? [],
		attachedCount: novaSession.attachments.length,
	});

	// Build tool list for OpenRouter
	const toolDefs = listModelCallableTools();
	const openRouterTools = toolDefs.map(toOpenRouterTool);

	// Build initial message history (last 10 complete turns)
	const HISTORY_LIMIT = 10;
	const history = novaSession.messages
		.filter(
			(m) =>
				(m.role === 'user' || m.role === 'nova') &&
				m.status === 'complete' &&
				m.content.trim().length > 0,
		)
		.slice(-HISTORY_LIMIT)
		.slice(0, -1); // drop last user msg (we add it explicitly below)

	const messages: AgentMessage[] = [
		{ role: 'system', content: systemPrompt },
		...history.map((m) => ({
			role: (m.role === 'nova' ? 'assistant' : 'user') as 'assistant' | 'user',
			content: m.content,
		})),
		{ role: 'user', content: trimmed },
	];

	const model = getSelectedModel();
	let stepCount = 0;

	while (true) {
		// Hard cap: stop before starting a new step if already at limit.
		if (stepCount >= MAX_AGENT_STEPS) {
			novaSession.append({
				role: 'nova',
				content:
					`Agent reached the ${MAX_AGENT_STEPS}-step limit. ` +
					'Review the tool results above for the collected information.',
				status: 'complete',
			});
			return;
		}

		// Begin a streaming nova message (thinking indicator + holds abort signal)
		const thinkingMsg = novaSession.beginStream('nova');
		const signal = novaSession.getSignal(thinkingMsg.id) ?? undefined;

		let result: AgentCompletionResult;
		try {
			result = await callAgentEndpoint(model, messages, openRouterTools, signal);
		} catch (err) {
			const isAbort =
				(err instanceof Error && err.name === 'AbortError') ||
				(signal?.aborted ?? false);
			if (isAbort) {
				// novaSession.abort() already set status to 'aborted'; nothing else to do.
				return;
			}
			const msg = err instanceof Error ? err.message : 'Unknown error';
			novaSession.fail(thinkingMsg.id, msg);
			return;
		}

		// Check if aborted between fetch completing and result processing
		if (signal?.aborted) {
			return;
		}

		const { content, tool_calls } = result;

		if (tool_calls && tool_calls.length > 0) {
			// --- Tool-call turn ---
			// The model is requesting tools. Show partial content if any, then process calls.
			if (content) {
				novaSession.appendDelta(thinkingMsg.id, content);
			}
			novaSession.endStream(thinkingMsg.id);

			// Add assistant message to history (with tool_calls)
			messages.push({
				role: 'assistant',
				content: content ?? null,
				tool_calls,
			});

			// Dispatch each tool call
			for (const toolCall of tool_calls) {
				const parsedInput = tryParseJson(toolCall.function.arguments);

				// Append tool-call chip
				novaSession.append({
					role: 'tool-call',
					content: '',
					status: 'complete',
					toolId: toolCall.function.name,
					toolPayload: parsedInput,
				});

				const invocation: ToolInvocation = {
					invocationId: toolCall.id,
					toolId: toolCall.function.name,
					input: parsedInput,
					requestedAt: new Date().toISOString(),
				};

				const toolResult = await dispatchTool(invocation);

				// Append tool-result chip
				novaSession.append({
					role: 'tool-result',
					content: '',
					status: 'complete',
					toolId: toolCall.function.name,
					toolPayload: toolResult,
				});

				// Add tool result to message history
				messages.push({
					role: 'tool',
					tool_call_id: toolCall.id,
					content: JSON.stringify(toolResult.output ?? toolResult.error ?? ''),
				});
			}

			stepCount++;
		} else {
			// --- Final response turn — no tool calls ---
			if (content) {
				novaSession.appendDelta(thinkingMsg.id, content);
			}
			novaSession.endStream(thinkingMsg.id);
			return;
		}
	}
}
