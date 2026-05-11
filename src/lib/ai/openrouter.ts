import type { AIRequestPayload, AIResponse } from './types.js';
import { AppError } from '../errors.js';

/**
 * Browser-facing OpenRouter client.
 *
 * As of plan-017 stage-005 phase-003, the browser **never** holds the
 * API key. All requests are proxied through `/api/ai`, which loads the
 * key from the server-side credential service (see
 * `src/lib/server/credentials/credential-service.ts`).
 */

export class MissingCredentialsError extends Error {
	constructor(message = 'No AI provider credentials configured.') {
		super(message);
		this.name = 'MissingCredentialsError';
	}
}

const PROXY_URL = '/api/ai';

interface ProxyErrorBody {
	error?: { code?: string; message?: string };
}

async function readProxyError(response: Response): Promise<ProxyErrorBody> {
	try {
		return (await response.json()) as ProxyErrorBody;
	} catch {
		return {};
	}
}

/**
 * Maps a non-OK proxy response onto the right user-facing error.
 * Throws `MissingCredentialsError` for "no key configured", an
 * `AppError` keyed on `AI_INVALID_KEY` / `AI_RATE_LIMIT` for the
 * named DoD codes, or a generic `Error` carrying the upstream message.
 */
function throwMappedProxyError(response: Response, body: ProxyErrorBody, surface: string): never {
	const code = body.error?.code;
	const message = body.error?.message;

	if (response.status === 401 && code === 'no_credentials') {
		throw new MissingCredentialsError();
	}
	if (code === 'invalid_key' || (response.status === 401 && code !== 'no_credentials')) {
		throw new AppError('AI_INVALID_KEY', new Error(message ?? `proxy ${surface} failed: 401`));
	}
	if (code === 'rate_limit' || response.status === 429) {
		throw new AppError('AI_RATE_LIMIT', new Error(message ?? `proxy ${surface} failed: 429`));
	}
	throw new Error(`[OpenRouterClient] proxy ${surface} failed: ${message ?? response.status}`);
}

async function postProxy(body: object, init?: { signal?: AbortSignal }): Promise<Response> {
	return fetch(PROXY_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		signal: init?.signal,
	});
}

export class OpenRouterClient {
	async *streamComplete(
		payload: AIRequestPayload,
		options: { signal?: AbortSignal } = {},
	): AsyncGenerator<string, void, unknown> {
		const response = await postProxy(
			{ model: payload.model, messages: payload.messages, stream: true },
			options,
		);

		if (!response.ok || !response.body) {
			const body = await readProxyError(response);
			throwMappedProxyError(response, body, 'stream');
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const events = buffer.split('\n\n');
				buffer = events.pop() ?? '';
				for (const raw of events) {
					const line = raw.trim();
					if (!line.startsWith('data:')) continue;
					const payloadStr = line.slice(5).trim();
					if (payloadStr === '[DONE]') return;
					try {
						const parsed = JSON.parse(payloadStr) as {
							choices?: Array<{ delta?: { content?: string } }>;
							error?: { message?: string };
						};
						if (parsed.error?.message) {
							throw new Error(`[OpenRouterClient] ${parsed.error.message}`);
						}
						const delta = parsed.choices?.[0]?.delta?.content;
						if (delta) yield delta;
					} catch (err) {
						if (err instanceof Error && err.message.includes('[OpenRouterClient]')) throw err;
						console.warn('[OpenRouterClient] Malformed stream chunk');
					}
				}
			}
		} finally {
			reader.releaseLock?.();
		}
	}

	async complete(
		payload: AIRequestPayload,
		options: { signal?: AbortSignal } = {},
	): Promise<AIResponse> {
		const response = await postProxy(
			{ model: payload.model, messages: payload.messages },
			options,
		);

		if (!response.ok) {
			const body = await readProxyError(response);
			throwMappedProxyError(response, body, 'complete');
		}

		const data = (await response.json()) as {
			text?: string;
			content?: string;
			model?: string;
			tokensUsed?: number;
		};

		return {
			text: data.text ?? data.content ?? '',
			model: data.model ?? payload.model,
			tokensUsed: data.tokensUsed ?? 0,
		};
	}
}
