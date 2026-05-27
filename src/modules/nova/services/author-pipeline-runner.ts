/**
 * plan-027 stage-003 phase-003 part-001 — Author pipeline runner.
 *
 * Drives a single `vibe-author` pipeline task end-to-end on the Nova
 * surface: resolves the task, builds a RAG context, builds the
 * structured prompt, runs a non-streaming OpenRouter completion, then
 * pipes the raw output through `parseAuthorOutput`. On parse success
 * the parsed payload is wrapped in a `PipelineArtifactEnvelope` and
 * attached to the assistant message via `novaSession.attachArtifact()`.
 *
 * This runner deliberately uses a non-streaming completion: both
 * scene-draft and revision-pack outputs require parsing the full
 * payload before they become actionable. Streaming UX is not in
 * plan-027 scope.
 *
 * No prose is ever written back to the manuscript by this module.
 */

import { OpenRouterClient } from '$lib/ai/openrouter.js';
import {
	createAuthorArtifactFromModelOutput,
	isAuthorTaskKey,
	type AuthorPayload,
	type AuthorPayloadByTaskKey,
	type AuthorTaskKey,
} from '$lib/ai/pipeline/author-agent.js';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import { PIPELINE_ACTION_PREFIX } from '$lib/ai/pipeline/task-catalog.js';
import { buildPrompt } from '$lib/ai/prompt-builder.js';
import { resolveTask } from '$lib/ai/task-resolver.js';
import type { AiContext, AiTask, AIRequestPayload, UiContext } from '$lib/ai/types.js';
import { getSelectedModel } from '$lib/stores/model-selection.svelte.js';
import { novaSession } from '../stores/nova-session.svelte.js';
import type { NovaArtifact } from '../types.js';
import { buildRagContext } from './context-hooks.js';

export interface AuthorPipelineRunInput {
	taskKey: AuthorTaskKey;
	projectId: string | null;
	activeSceneId: string | null;
	activeChapterId: string | null;
	instruction: string;
}

export type AuthorPipelineRunResult =
	| {
			ok: true;
			messageId: string;
			artifact: PipelineArtifactEnvelope<AuthorPayload>;
	  }
	| {
			ok: false;
			messageId: string;
			reason: 'invalid_task' | 'parse_failed' | 'transport_failed' | 'aborted';
			error: string;
	  };

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

function toNovaArtifact(
	envelope: PipelineArtifactEnvelope<AuthorPayload>,
	taskKey: AuthorTaskKey,
): NovaArtifact {
	if (taskKey === 'vibe-author.outline') {
		return {
			kind: 'author-outline',
			envelope: envelope as PipelineArtifactEnvelope<
				AuthorPayloadByTaskKey['vibe-author.outline']
			>,
		};
	}
	if (taskKey === 'vibe-author.scene-draft') {
		return {
			kind: 'author-scene-draft',
			envelope: envelope as PipelineArtifactEnvelope<
				Extract<AuthorPayload, { prose: string }>
			>,
		};
	}
	if (taskKey === 'vibe-author.revision-pack') {
		return {
			kind: 'author-revision-pack',
			envelope: envelope as PipelineArtifactEnvelope<
				Extract<AuthorPayload, { issues: unknown[] }>
			>,
		};
	}
	// vibe-author.premise currently has no UI surface. Returning `null`
	// here would force callers to branch; throw so the runner records
	// a clear error.
	throw new Error(
		`Author task ${taskKey} has no Nova artifact surface yet. ` +
			`Only outline, scene-draft, and revision-pack are wired.`,
	);
}

/**
 * Runs a single author-pipeline task and attaches the parsed artifact
 * to a new Nova assistant message. Returns the message id plus the
 * artifact (success) or a typed failure reason.
 */
export async function runAuthorPipelineTask(
	input: AuthorPipelineRunInput,
): Promise<AuthorPipelineRunResult> {
	if (!isAuthorTaskKey(input.taskKey)) {
		const placeholder = novaSession.append({
			role: 'nova',
			content: '',
			status: 'error',
		});
		const reason = `Task key ${input.taskKey} is not an author pipeline stage.`;
		novaSession.fail(placeholder.id, reason);
		return {
			ok: false,
			messageId: placeholder.id,
			reason: 'invalid_task',
			error: reason,
		};
	}

	const action = `${PIPELINE_ACTION_PREFIX}${input.taskKey}`;
	const uiCtx: UiContext = {
		activeProjectId: input.projectId,
		activeSceneId: input.activeSceneId,
		activeChapterId: input.activeChapterId,
		activeBeatId: null,
		instruction: input.instruction.trim(),
	};
	const task: AiTask = resolveTask(action, uiCtx);

	let aiContext: AiContext = EMPTY_AI_CONTEXT;
	try {
		const ragResult = await buildRagContext({
			projectId: input.projectId ?? '',
			activeSceneId: input.activeSceneId,
			policy: input.taskKey === 'vibe-author.outline' ? 'outline_scope' : 'scene_plus_adjacent',
		});
		if (ragResult.aiContext) aiContext = ragResult.aiContext;
	} catch {
		// Author pipeline tasks tolerate an empty context — the prompt
		// builder still emits ROLE/TASK/CONSTRAINTS/OUTPUT FORMAT.
		aiContext = EMPTY_AI_CONTEXT;
	}

	const streaming = novaSession.beginStream('nova');
	const signal = novaSession.getSignal(streaming.id);

	const systemPrompt = buildPrompt(task, aiContext);
	const payload: AIRequestPayload = {
		model: getSelectedModel(),
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: input.instruction.trim() },
		],
	};

	const client = new OpenRouterClient();
	let rawOutput: string;
	try {
		const response = await client.complete(payload, { signal: signal ?? undefined });
		rawOutput = response.text;
	} catch (err) {
		const isAbort =
			(err instanceof Error && err.name === 'AbortError') || (signal?.aborted ?? false);
		if (isAbort) {
			// `novaSession.abort()` already flipped status to 'aborted'.
			return {
				ok: false,
				messageId: streaming.id,
				reason: 'aborted',
				error: 'Author pipeline run was aborted.',
			};
		}
		const message = err instanceof Error ? err.message : 'Unknown transport error';
		novaSession.fail(streaming.id, message);
		return {
			ok: false,
			messageId: streaming.id,
			reason: 'transport_failed',
			error: message,
		};
	}

	const result = createAuthorArtifactFromModelOutput({
		task: {
			key: input.taskKey,
			family: 'vibe-author',
			stage: task.pipelineTask?.stage ?? '',
			outputFormat: task.outputFormat ?? '',
			role: task.role,
			contextPolicy: task.contextPolicy ?? 'scene_plus_adjacent',
		},
		rawOutput,
	});

	if (!result.ok) {
		novaSession.fail(streaming.id, result.parse.fallbackMessage);
		return {
			ok: false,
			messageId: streaming.id,
			reason: 'parse_failed',
			error: result.parse.fallbackMessage,
		};
	}

	try {
		const artifact = toNovaArtifact(result.artifact, input.taskKey);
		novaSession.attachArtifact(streaming.id, artifact);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown artifact-mapping error';
		novaSession.fail(streaming.id, message);
		return {
			ok: false,
			messageId: streaming.id,
			reason: 'parse_failed',
			error: message,
		};
	}

	return {
		ok: true,
		messageId: streaming.id,
		artifact: result.artifact,
	};
}
