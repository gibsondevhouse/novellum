import type { AIRequestPayload, AIResponse } from './types.js';

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

		if (response.status === 401) {
			throw new MissingCredentialsError();
		}
		if (!response.ok || !response.body) {
			let detail = `${response.status}`;
			try {
				const body = (await response.json()) as { error?: { message?: string } };
				if (body?.error?.message) detail = body.error.message;
			} catch {
				/* ignore */
			}
			throw new Error(`[OpenRouterClient] proxy stream failed: ${detail}`);
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

		if (response.status === 401) {
			throw new MissingCredentialsError();
		}
		if (!response.ok) {
			let detail = `${response.status}`;
			try {
				const body = (await response.json()) as { error?: { message?: string } };
				if (body?.error?.message) detail = body.error.message;
			} catch {
				/* ignore */
			}
			throw new Error(`[OpenRouterClient] proxy complete failed: ${detail}`);
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
