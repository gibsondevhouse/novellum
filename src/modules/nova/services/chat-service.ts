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
import { sceneIntent } from '$lib/stores/scene-intent.svelte.js';
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
	/**
	 * When true, the user prompt is assumed to already be in the message
	 * log (e.g. a retry after a failed assistant turn) and a duplicate
	 * user message is NOT appended.
	 */
	skipUserAppend?: boolean;
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

	if (!input.skipUserAppend) {
		novaSession.append({ role: 'user', content: trimmed, status: 'complete' });
	}

	// Nova is a chat-first surface: the user is having a working
	// conversation with the AI about their novel, not asking it to
	// continue prose. The 'chat' task gives the model a conversational
	// role + plain-text output and prevents the "match existing tone,
	// continue the narrative" framing from the 'continue' task, which
	// caused the model to hallucinate manuscript text in response to
	// brainstorming prompts.
	const action = 'chat';
	const uiCtx: UiContext = {
		activeProjectId: input.projectId,
		activeSceneId: input.activeSceneId,
		activeChapterId: input.activeChapterId,
		activeBeatId: null,
		instruction: trimmed,
	};
	const task: AiTask = resolveTask(action, uiCtx);

	let aiContext: AiContext = EMPTY_AI_CONTEXT;
	let ragResult: Awaited<ReturnType<typeof buildRagContext>> | null = null;
	try {
		ragResult = await buildRagContext({
			projectId: input.projectId ?? '',
			activeSceneId: input.activeSceneId,
			policy: 'scene_plus_adjacent',
		});
		if (ragResult.aiContext) aiContext = ragResult.aiContext;
	} catch {
		// Fall back to empty context — the chat still runs.
		aiContext = EMPTY_AI_CONTEXT;
	}

	// Fold in the writer's live scene intent + signals when they apply to
	// the active scene. Editor publishes this through the scene-intent store.
	const intentSnapshot = sceneIntent.current;
	if (intentSnapshot && input.activeSceneId && intentSnapshot.sceneId === input.activeSceneId) {
		aiContext = { ...aiContext, sceneIntent: intentSnapshot };
	}

	const contextItemCount =
		(aiContext.scene ? 1 : 0) +
		aiContext.adjacentScenes.length +
		aiContext.characters.length +
		aiContext.locations.length +
		aiContext.loreEntries.length +
		aiContext.plotThreads.length;
	novaSession.setContextDisclosure(ragResult?.includedScopes ?? [], contextItemCount);

	const systemPrompt = buildPrompt(task, aiContext);

	const streaming = novaSession.beginStream('nova');
	const signal = novaSession.getSignal(streaming.id);

	// Reconstruct chat history so multi-turn brainstorming has memory.
	// We include only completed user/nova turns (skip tool-call / system /
	// errored messages) and cap the tail to keep the prompt bounded.
	const HISTORY_TURN_LIMIT = 20;
	const history = novaSession.messages
		.filter(
			(m) =>
				(m.role === 'user' || m.role === 'nova') &&
				m.status === 'complete' &&
				m.content.trim().length > 0,
		)
		// Drop the in-flight assistant message (status would be 'streaming',
		// already filtered) and the freshly-appended user turn — we add it
		// explicitly below as the final user message.
		.slice(-HISTORY_TURN_LIMIT);

	const historyMessages = history
		.slice(0, -1) // exclude the trailing user prompt; appended below
		.map((m) => ({
			role: (m.role === 'nova' ? 'assistant' : 'user') as 'assistant' | 'user',
			content: m.content,
		}));

	const payload: AIRequestPayload & { tools?: ToolDefinition[] } = {
		model: getSelectedModel(),
		messages: [
			{ role: 'system', content: systemPrompt },
			...historyMessages,
			{ role: 'user', content: trimmed },
		],
	};
	// Tool advertisement is guarded by the agentic flag (off by default).
	// The streaming loop does not yet parse tool_use blocks — enabling
	// this flag is intentionally experimental until the parse loop lands.
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
