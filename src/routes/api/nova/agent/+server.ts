/**
 * plan-031 stage-004 phase-001 — Agent-mode single-iteration completion endpoint.
 *
 * Handles ONE tool-capable round-trip for the Nova Agent loop:
 *   POST { model, messages, tools? }
 *   →    { content, tool_calls, finish_reason }
 *
 * Messages may include `system`, `user`, `assistant`, and `tool` roles
 * as required by the OpenAI/OpenRouter tool-calling protocol.
 * API keys are loaded server-side only; they never reach the client.
 *
 * Supports NOVELLUM_AI_MOCK=1 for test environments.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';

const credentialService = createCredentialService();

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_OUTPUT_TOKENS = 2000;
const APP_REFERER = 'http://localhost:5174';
const APP_TITLE = 'Novellum';

interface AgentToolFunction {
	type: 'function';
	function: { name: string; description: string; parameters: unknown };
}

interface AgentToolCall {
	id: string;
	type: 'function';
	function: { name: string; arguments: string };
}

interface RequestBody {
	model?: unknown;
	messages?: unknown;
	tools?: AgentToolFunction[];
}

function isValidBody(body: unknown): body is RequestBody {
	return (
		!!body &&
		typeof body === 'object' &&
		Array.isArray((body as RequestBody).messages) &&
		typeof (body as RequestBody).model === 'string'
	);
}

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	if (!isValidBody(body)) {
		error(400, 'Missing required fields: model, messages');
	}

	const { model, messages, tools } = body as {
		model: string;
		messages: unknown[];
		tools?: AgentToolFunction[];
	};

	// Mock mode for local dev/test
	if (process.env.NOVELLUM_AI_MOCK === '1') {
		return json({
			content: '[mock agent response]',
			tool_calls: null,
			finish_reason: 'stop',
		});
	}

	const key = await credentialService.loadProviderKey('openrouter');
	if (!key) {
		return json(
			{ error: { code: 'no_credentials', message: 'No OpenRouter credentials configured.' } },
			{ status: 401 },
		);
	}

	const openRouterBody: Record<string, unknown> = {
		model,
		messages,
		max_tokens: MAX_OUTPUT_TOKENS,
		parallel_tool_calls: false,
	};
	if (tools && tools.length > 0) {
		openRouterBody.tools = tools;
	}

	let response: Response;
	try {
		response = await fetch(OPENROUTER_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${key}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': APP_REFERER,
				'X-Title': APP_TITLE,
			},
			body: JSON.stringify(openRouterBody),
			signal: request.signal,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Network error';
		return json({ error: { code: 'network_error', message } }, { status: 502 });
	}

	if (!response.ok) {
		let errBody: { error?: { message?: string; code?: string } } = {};
		try {
			errBody = (await response.json()) as typeof errBody;
		} catch { /* ignore */ }
		const status = response.status === 401 ? 401 : response.status === 429 ? 429 : 502;
		return json({ error: errBody.error ?? { message: `OpenRouter error ${response.status}` } }, { status });
	}

	const data = (await response.json()) as {
		choices?: Array<{
			message?: {
				content?: string | null;
				tool_calls?: AgentToolCall[];
			};
			finish_reason?: string;
		}>;
	};

	const choice = data.choices?.[0];
	return json({
		content: choice?.message?.content ?? null,
		tool_calls: choice?.message?.tool_calls ?? null,
		finish_reason: choice?.finish_reason ?? 'stop',
	});
};
