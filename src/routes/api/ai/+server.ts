import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolveTask, buildContext, buildPrompt, selectModel } from '$lib/ai/index.js';
import type { UiContext } from '$lib/ai/types.js';
import { db } from '$lib/server/db/index.js';
import type { ChatInstruction, SystemPrompt, WritingStyle } from '$lib/db/domain-types.js';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';
import {
	createOpenRouterProvider,
	createOllamaProvider,
	OLLAMA_DEFAULT_BASE_URL,
} from '$lib/ai/providers/index.js';
import type { AiProvider, CompletionMessage } from '$lib/ai/providers/index.js';
import { getPreference } from '$lib/server/preferences/preferences-service.js';
import {
	ACTIVE_PROVIDER_KEY,
	OLLAMA_BASE_URL_KEY,
	OLLAMA_MODEL_KEY,
	type ActiveProvider,
} from '$lib/ai/provider-config.js';
import { ensureOllamaRunning } from '$lib/server/ai/ollama-launcher.js';

const credentialService = createCredentialService();
const openRouterProvider = createOpenRouterProvider();

const MOCK_ENABLED = () => process.env.NOVELLUM_AI_MOCK === '1';

interface ResolvedProvider {
	provider: AiProvider;
	apiKey: string;
	/** When set, overrides the model the caller asked for (Ollama). */
	modelOverride?: string;
	id: ActiveProvider;
}

type LoadResult =
	| { kind: 'ok'; resolved: ResolvedProvider }
	| { kind: 'mock' }
	| { kind: 'no_creds' };

export const GET: RequestHandler = () => {
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};

interface ProxyBody {
	model?: unknown;
	messages?: unknown;
	stream?: unknown;
}

interface TaskBody {
	action?: unknown;
	uiContext?: unknown;
	projectId?: unknown;
}

function isProxyShape(body: unknown): body is ProxyBody {
	return (
		!!body &&
		typeof body === 'object' &&
		Array.isArray((body as ProxyBody).messages) &&
		typeof (body as ProxyBody).model === 'string'
	);
}

async function loadKeyOrRespond(): Promise<LoadResult> {
	const activeProvider: ActiveProvider =
		getPreference<ActiveProvider>(ACTIVE_PROVIDER_KEY) ?? 'openrouter';

	if (activeProvider === 'ollama') {
		const baseUrl =
			getPreference<string>(OLLAMA_BASE_URL_KEY) ?? OLLAMA_DEFAULT_BASE_URL;
		const modelOverride = getPreference<string>(OLLAMA_MODEL_KEY) ?? undefined;
		// Make sure the daemon is up before we try to talk to it.
		const launchResult = await ensureOllamaRunning(baseUrl);
		if (!launchResult.ok) {
			console.warn(`[api/ai] ollama launch failed: ${launchResult.message}`);
		}
		return {
			kind: 'ok',
			resolved: {
				provider: createOllamaProvider({ baseUrl }),
				apiKey: '',
				modelOverride,
				id: 'ollama',
			},
		};
	}

	const key = await credentialService.loadProviderKey('openrouter');
	if (key) {
		return {
			kind: 'ok',
			resolved: { provider: openRouterProvider, apiKey: key, id: 'openrouter' },
		};
	}
	if (MOCK_ENABLED()) {
		console.warn('[api/ai] NOVELLUM_AI_MOCK=1 — returning mock responses');
		return { kind: 'mock' };
	}
	return { kind: 'no_creds' };
}

function noCredentialsResponse(): Response {
	return json(
		{ error: { code: 'no_credentials', message: 'No AI provider credentials configured.' } },
		{ status: 401 },
	);
}

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown = null;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	if (isProxyShape(body)) {
		return handleProxy(body);
	}
	return handleTask(body as TaskBody);
};

async function handleProxy(body: ProxyBody): Promise<Response> {
	const requestedModel = body.model as string;
	const messages = body.messages as CompletionMessage[];
	const wantStream = body.stream === true;

	const keyResult = await loadKeyOrRespond();
	if (keyResult.kind === 'no_creds') return noCredentialsResponse();

	if (keyResult.kind === 'mock') {
		if (wantStream) return mockStreamResponse();
		return json({ text: '[Mock AI response]', model: requestedModel, tokensUsed: 0 });
	}

	const { provider, apiKey, modelOverride } = keyResult.resolved;
	const model = modelOverride ?? requestedModel;

	if (wantStream) {
		const encoder = new TextEncoder();
		const stream = new ReadableStream<Uint8Array>({
			async start(controller) {
				try {
					for await (const chunk of provider.stream(apiKey, { model, messages })) {
						if (chunk.type === 'delta') {
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({ choices: [{ delta: { content: chunk.content } }] })}\n\n`,
								),
							);
						} else if (chunk.type === 'done') {
							controller.enqueue(encoder.encode('data: [DONE]\n\n'));
						} else {
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({ error: { message: chunk.message } })}\n\n`,
								),
							);
						}
					}
				} catch (err) {
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({
								error: { message: err instanceof Error ? err.message : 'stream error' },
							})}\n\n`,
						),
					);
				} finally {
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			},
		});
	}

	try {
		const result = await provider.complete(apiKey, { model, messages });
		return json({
			text: result.content,
			model: result.model,
			tokensUsed: result.usage?.totalTokens ?? 0,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'unknown';
		return json({ error: { code: 'provider_error', message } }, { status: 502 });
	}
}

async function handleTask(body: TaskBody): Promise<Response> {
	if (!body?.action || typeof body.action !== 'string') {
		error(400, 'Missing or invalid "action" field');
	}
	if (!body?.projectId || typeof body.projectId !== 'string') {
		error(400, 'Missing or invalid "projectId" field');
	}

	const uiCtx: UiContext = {
		activeProjectId: body.projectId as string,
		activeSceneId: (body.uiContext as UiContext)?.activeSceneId ?? null,
		activeBeatId: (body.uiContext as UiContext)?.activeBeatId ?? null,
		activeChapterId: (body.uiContext as UiContext)?.activeChapterId ?? null,
	};

	const task = resolveTask(body.action as string, uiCtx);
	const ctx = await buildContext(task, body.projectId as string);

	const writingStyles = db
		.prepare(`SELECT * FROM writing_styles WHERE projectId = ?`)
		.all(body.projectId) as WritingStyle[];
	const systemPrompts = db
		.prepare(`SELECT * FROM system_prompts WHERE projectId = ?`)
		.all(body.projectId) as SystemPrompt[];
	const chatInstructions = db
		.prepare(`SELECT * FROM chat_instructions WHERE projectId = ?`)
		.all(body.projectId) as ChatInstruction[];

	if (writingStyles.length > 0) ctx.writingStyles = writingStyles;
	if (systemPrompts.length > 0) ctx.systemPrompts = systemPrompts;
	if (chatInstructions.length > 0) ctx.chatInstructions = chatInstructions;

	const prompt = buildPrompt(task, ctx);
	const defaultModel = selectModel(task.taskType);

	const keyResult = await loadKeyOrRespond();
	if (keyResult.kind === 'no_creds') return noCredentialsResponse();

	if (keyResult.kind === 'mock') {
		return json({
			content: `[Mock AI response] Action: "${body.action}" | Prompt length: ${prompt.length} chars`,
		});
	}

	const { provider, apiKey, modelOverride } = keyResult.resolved;
	const model = modelOverride ?? defaultModel;

	try {
		const result = await provider.complete(apiKey, {
			model,
			messages: [{ role: 'user', content: prompt }],
		});
		return json({ content: result.content });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'unknown';
		return json({ error: { code: 'provider_error', message } }, { status: 502 });
	}
}

function mockStreamResponse(): Response {
	const encoder = new TextEncoder();
	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(
				encoder.encode(
					`data: ${JSON.stringify({ choices: [{ delta: { content: '[mock]' } }] })}\n\n`,
				),
			);
			controller.enqueue(encoder.encode('data: [DONE]\n\n'));
			controller.close();
		},
	});
	return new Response(stream, {
		headers: { 'Content-Type': 'text/event-stream' },
	});
}
