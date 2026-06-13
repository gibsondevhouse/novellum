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
import { outlineGenerationState } from '../stores/outline-generation-state.svelte.js';
import { buildRagContext } from './context-hooks.js';
import { isNovaAgenticEnabled } from './feature-flags.js';
import { listModelCallableTools } from './tool-registry.js';
import { runAgentLoop } from './agent-loop.js';
import { validateAttachment } from '../utils/attachment-validator.js';
import type { NovaAttachment, NovaMode, ToolDefinition } from '../types.js';

export interface SendChatInput {
	prompt: string;
	projectId: string | null;
	activeSceneId: string | null;
	activeChapterId: string | null;
	/** Nova interaction mode. Defaults to 'ask' when omitted. */
	mode?: NovaMode;
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

function isOutlineContextRequest(prompt: string): boolean {
	return /\b(outline|story\s*structure|plot\s*map|chapter\s*plan|chapter\s*outline)\b/i.test(prompt);
}

function isOutlineBuildRequest(prompt: string): boolean {
	return (
		/\b(outline|story\s*structure|plot\s*map|chapter\s*plan|chapter\s*outline)\b/i.test(prompt) &&
		/\b(build|create|generate|draft|make|design|plan|structure)\b/i.test(prompt)
	);
}

function isWriteConcreteRequest(prompt: string): boolean {
	return /\b(build|create|generate|draft|write|rewrite|revise|edit|analy(?:s|z)e|critique|plan|structure)\b/i.test(
		prompt,
	);
}

function isProjectDependentGenerationRequest(prompt: string): boolean {
	return /\b(outline|first\s*chapter|chapter\s*outline|chapter\s*draft|scene\s*draft|draft\s+the\s+scene|plot\s*map|story\s*structure)\b/i.test(prompt);
}

function buildAttachmentContext(attachments: NovaAttachment[]): string {
	if (attachments.length === 0) return '';

	const sections: string[] = [];

	const entities = attachments.filter((a) => a.kind === 'entity');
	if (entities.length > 0) {
		sections.push('## User-Attached Project Entities\n');
		for (const a of entities) {
			if (a.kind !== 'entity') continue;
			const kindLabel = a.entityKind.charAt(0).toUpperCase() + a.entityKind.slice(1);
			sections.push(`### ${kindLabel}: ${a.label}`);
			if (a.summary) sections.push(a.summary);
			sections.push('');
		}
	}

	const files = attachments.filter((a) => a.kind === 'file');
	for (const a of files) {
		if (a.kind !== 'file') continue;
		const validation = validateAttachment(a);
		if (!validation.valid) continue; // silently drop invalid at server boundary
		sections.push(`## Attached File: ${a.filename}\n`);
		sections.push(a.content.trim());
		sections.push('');
	}

	if (sections.length === 0) return '';
	return `\n\n---\n# User-Attached Context\n${sections.join('\n').trim()}`;
}

function parseMissingProjectFields(warnings: string[]): string[] {
	for (const warning of warnings) {
		const match = warning.match(/^Project context is missing:\s*(.+)\.$/i);
		if (!match) continue;
		return match[1]
			.split(',')
			.map((field) => field.trim())
			.filter(Boolean);
	}
	return [];
}

function formatMissingFieldsMessage(fields: string[]): string {
	if (fields.length === 0) return 'project baseline details';
	if (fields.length === 1) return fields[0];
	if (fields.length === 2) return `${fields[0]} and ${fields[1]}`;
	return `${fields.slice(0, -1).join(', ')}, and ${fields.at(-1) ?? ''}`;
}

function appendErrorMessage(message: string): void {
	const errorMessage = novaSession.append({
		role: 'nova',
		content: '',
		status: 'error',
	});
	novaSession.fail(errorMessage.id, message);
}

async function runOutlineCheckpointGeneration(projectId: string, instruction: string): Promise<void> {
	const result = await outlineGenerationState.generate(projectId, instruction);
	if (result.ok) {
		novaSession.append({
			role: 'nova',
			status: 'complete',
			content:
				`Outline checkpoint ${result.checkpointId} is ready for review. ` +
				'Use the outline review panel to accept or reject it.',
			toolPayload: {
				kind: 'outline-checkpoint-generation',
				checkpointId: result.checkpointId,
			},
		});
		return;
	}

	appendErrorMessage(result.error.message);
}

export async function sendNovaChat(input: SendChatInput): Promise<void> {
	const trimmed = input.prompt.trim();
	if (!trimmed || novaSession.isStreaming) return;

	const mode: NovaMode = input.mode ?? 'ask';

	if (!input.skipUserAppend) {
		novaSession.append({ role: 'user', content: trimmed, status: 'complete' });
	}

	// Agent mode: real bounded tool loop (plan-031 stage-004).
	if (mode === 'agent') {
		await runAgentLoop({
			prompt: trimmed,
			projectId: input.projectId,
			activeSceneId: input.activeSceneId,
			activeChapterId: input.activeChapterId,
		});
		return;
	}

	// Write mode: route outline-build requests to the checkpoint pipeline;
	// concrete write requests that are not yet supported return an unsupported-action state.
	if (mode === 'write') {
		if (isOutlineBuildRequest(trimmed)) {
			if (!input.projectId) {
				appendErrorMessage('Open a project before asking Write mode to build an outline.');
				return;
			}
			await runOutlineCheckpointGeneration(input.projectId, trimmed);
			return;
		}

		if (isWriteConcreteRequest(trimmed)) {
			novaSession.appendUnsupportedWriteAction(trimmed);
			return;
		}
		// Non-outline, non-concrete Write requests fall through to the write-mode chat path.
	}

	// Ask mode (or Write mode fallthrough for conversational requests):
	// Uses the 'ask' task for conversational grounded chat, or 'write' task
	// for the write-mode system prompt when Write mode is active.
	const action = mode === 'write' ? 'write' : 'ask';
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
		const ragPolicy =
			isOutlineContextRequest(trimmed) && input.projectId
				? 'outline_scope'
				: input.activeSceneId
					? 'scene_plus_adjacent'
					: 'worldbuilding_scope';
		ragResult = await buildRagContext({
			projectId: input.projectId ?? '',
			activeSceneId: input.activeSceneId,
			policy: ragPolicy,
		});
		if (ragResult.aiContext) aiContext = ragResult.aiContext;
	} catch {
		// Fall back to empty context — the chat still runs.
		aiContext = EMPTY_AI_CONTEXT;
	}

	const ragWarnings = ragResult?.warnings ?? [];
	if (isProjectDependentGenerationRequest(trimmed) && !input.projectId) {
		novaSession.append({
			role: 'nova',
			content: 'Open a project in Project Hub before asking Nova to generate outlines or drafts.',
			status: 'error',
		});
		return;
	}

	const missingProjectFields = parseMissingProjectFields(ragWarnings);
	if (isProjectDependentGenerationRequest(trimmed) && missingProjectFields.length > 0) {
		novaSession.append({
			role: 'nova',
			content:
				`I can help with that, but Project Hub is missing ${formatMissingFieldsMessage(missingProjectFields)}. ` +
				'Add those fields, then retry so I can ground the output.',
			status: 'complete',
		});
		return;
	}

	// Fold in the writer's live scene intent + signals when they apply to
	// the active scene. Editor publishes this through the scene-intent store.
	const intentSnapshot = sceneIntent.current;
	if (intentSnapshot && input.activeSceneId && intentSnapshot.sceneId === input.activeSceneId) {
		aiContext = { ...aiContext, sceneIntent: intentSnapshot };
	}

	const contextItemCount =
		(aiContext.project ? 1 : 0) +
		(aiContext.storyFrames?.length ?? 0) +
		(aiContext.scene ? 1 : 0) +
		aiContext.adjacentScenes.length +
		aiContext.characters.length +
		aiContext.locations.length +
		aiContext.loreEntries.length +
		aiContext.plotThreads.length;
	const currentAttachments = novaSession.attachments;
	novaSession.setContextDisclosure(ragResult?.includedScopes ?? ['no-context'], contextItemCount, {
		warnings: ragWarnings,
		compressed: ragWarnings.some((warning) => /compressed/i.test(warning)),
		truncated: ragWarnings.some((warning) => /trimmed|truncated/i.test(warning)),
		attachedCount: currentAttachments.length,
	});

	const attachmentContext = buildAttachmentContext(currentAttachments);
	const systemPrompt = buildPrompt(task, aiContext) + attachmentContext;

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
		payload.tools = listModelCallableTools();
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
