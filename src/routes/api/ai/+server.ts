import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolveTask, buildContext, buildPrompt, selectModel } from '$lib/ai/index.js';
import type { UiContext } from '$lib/ai/types.js';
import { db } from '$lib/server/db/index.js';
import type { ChatInstruction, SystemPrompt, WritingStyle } from '$lib/db/domain-types.js';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';
import { createOpenRouterProvider } from '$lib/ai/providers/index.js';
import type { CompletionMessage } from '$lib/ai/providers/index.js';

const credentialService = createCredentialService();
const provider = createOpenRouterProvider();

const MOCK_ENABLED = () => process.env.NOVELLUM_AI_MOCK === '1';

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

async function loadKeyOrRespond(): Promise<
	{ kind: 'ok'; key: string } | { kind: 'mock' } | { kind: 'no_creds' }
> {
	const key = await credentialService.loadProviderKey('openrouter');
	if (key) return { kind: 'ok', key };
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
	const model = body.model as string;
	const messages = body.messages as CompletionMessage[];
	const wantStream = body.stream === true;

	const keyResult = await loadKeyOrRespond();
	if (keyResult.kind === 'no_creds') return noCredentialsResponse();

	if (keyResult.kind === 'mock') {
		if (wantStream) return mockStreamResponse();
		return json({ text: '[Mock AI response]', model, tokensUsed: 0 });
	}

	if (wantStream) {
		const encoder = new TextEncoder();
		const stream = new ReadableStream<Uint8Array>({
			async start(controller) {
				try {
					for await (const chunk of provider.stream(keyResult.key, { model, messages })) {
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
		const result = await provider.complete(keyResult.key, { model, messages });
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
	const model = selectModel(task.taskType);

	const keyResult = await loadKeyOrRespond();
	if (keyResult.kind === 'no_creds') return noCredentialsResponse();

	if (keyResult.kind === 'mock') {
		return json({
			content: `[Mock AI response] Action: "${body.action}" | Prompt length: ${prompt.length} chars`,
		});
	}

	try {
		const result = await provider.complete(keyResult.key, {
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
