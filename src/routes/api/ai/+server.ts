import { OPENROUTER_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolveTask, buildContext, buildPrompt, selectModel } from '$lib/ai/index.js';
import type { UiContext } from '$lib/ai/types.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const GET: RequestHandler = () => {
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
};

export const POST: RequestHandler = async ({ request }) => {
	let body: { action?: unknown; uiContext?: unknown; projectId?: unknown } | null = null;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

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
	const prompt = buildPrompt(task, ctx);
	const model = selectModel(task.taskType);

	if (!OPENROUTER_API_KEY) {
		return json({
			content: `[Mock AI response] Action: "${body.action}" | Prompt length: ${prompt.length} chars`,
		});
	}

	const response = await fetch(OPENROUTER_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${OPENROUTER_API_KEY}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'http://localhost:5173',
			'X-Title': 'Novellum',
		},
		body: JSON.stringify({
			model,
			messages: [{ role: 'user', content: prompt }],
		}),
	});

	if (!response.ok) {
		error(response.status as Parameters<typeof error>[0], `OpenRouter error: ${response.status}`);
	}

	const data = await response.json();
	return json({ content: data.choices?.[0]?.message?.content ?? null });
};
