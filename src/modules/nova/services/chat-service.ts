/**
 * plan-023 stage-005 phase-002 — Nova chat service.
 *
 * Drives the editor-side copilot: appends the user message, resolves
 * an `AiTask`, builds RAG context via the Nova module's hook (which
 * delegates to module-ai's `ContextEngine`), constructs the structured
 * prompt via `buildPrompt`, then streams chunks from
 * `OpenRouterClient` into a new assistant message via `novaSession`.
 *
 * Aborts are handled via the per-stream `AbortSignal` exposed by
 * `novaSession.getSignal(id)`. Aborted streams preserve partial
 * content; transport / proxy errors surface via `novaSession.fail()`.
 */

import { OpenRouterClient } from '$lib/ai/openrouter.js';
import { buildPrompt } from '$lib/ai/prompt-builder.js';
import { resolveTask } from '$lib/ai/task-resolver.js';
import type { AiContext, AiTask, AIRequestPayload, UiContext } from '$lib/ai/types.js';
import { getSelectedModel } from '$lib/stores/model-selection.svelte.js';
import { novaSession } from '../stores/nova-session.svelte.js';
import { buildRagContext } from './context-hooks.js';
import { isNovaAgenticEnabled } from './feature-flags.js';
import { listTools } from './tool-registry.js';
import type { ToolDefinition } from '../types.js';

export interface SendChatInput {
	prompt: string;
	projectId: string | null;
	activeSceneId: string | null;
	activeChapterId: string | null;
}

/**
 * Minimal `AiContext` used when no scene is active. `buildPrompt`
 * tolerates empty arrays and a null scene; the structured prompt
 * still emits ROLE/TASK/CONSTRAINTS/OUTPUT FORMAT correctly.
 */
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

export async function sendNovaChat(input: SendChatInput): Promise<void> {
	const trimmed = input.prompt.trim();
	if (!trimmed || novaSession.isStreaming) return;

	novaSession.append({ role: 'user', content: trimmed, status: 'complete' });

	const action = input.activeSceneId ? 'continue' : 'brainstorm';
	const uiCtx: UiContext = {
		activeProjectId: input.projectId,
		activeSceneId: input.activeSceneId,
		activeChapterId: input.activeChapterId,
		activeBeatId: null,
		instruction: trimmed,
	};
	const task: AiTask = resolveTask(action, uiCtx);

	let aiContext: AiContext = EMPTY_AI_CONTEXT;
	try {
		const rag = await buildRagContext({
			projectId: input.projectId ?? '',
			activeSceneId: input.activeSceneId,
			policy: 'scene_plus_adjacent',
		});
		if (rag.aiContext) aiContext = rag.aiContext;
	} catch {
		// Fall back to empty context — the chat still runs.
		aiContext = EMPTY_AI_CONTEXT;
	}

	const systemPrompt = buildPrompt(task, aiContext);

	const streaming = novaSession.beginStream('nova');
	const signal = novaSession.getSignal(streaming.id);

	// stage-006: tool dispatch is not yet wired end-to-end. When the
	// agentic flag is enabled we *advertise* the registered tool
	// definitions to OpenRouter, but the chat loop does NOT yet parse
	// tool-call deltas from the response. Future stages thread tool
	// calls back through `dispatchTool`.
	const payload: AIRequestPayload & { tools?: ToolDefinition[] } = {
		model: getSelectedModel(),
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: trimmed },
		],
	};
	if (isNovaAgenticEnabled()) {
		payload.tools = listTools();
	}

	const client = new OpenRouterClient();
	try {
		for await (const chunk of client.streamComplete(payload, {
			signal: signal ?? undefined,
		})) {
			novaSession.appendDelta(streaming.id, chunk);
		}
		novaSession.endStream(streaming.id);
	} catch (err) {
		const isAbort =
			(err instanceof Error && err.name === 'AbortError') ||
			(signal?.aborted ?? false);
		if (isAbort) {
			// `novaSession.abort()` already flipped the message status
			// to `aborted`; nothing more to do.
			return;
		}
		const message = err instanceof Error ? err.message : 'Unknown error';
		novaSession.fail(streaming.id, message);
	}
}
