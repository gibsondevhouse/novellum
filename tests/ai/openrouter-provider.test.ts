import { describe, it, expect, vi } from 'vitest';
import { OpenRouterProvider } from '../../src/lib/ai/providers/openrouter-provider.js';

const SENTINEL_KEY = 'sk-or-v1-TEST-SENTINEL-12345678';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { 'content-type': 'application/json' },
		...init,
	});
}

function sseResponse(events: string[]): Response {
	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();
			for (const e of events) controller.enqueue(encoder.encode(e));
			controller.close();
		},
	});
	return new Response(stream, {
		status: 200,
		headers: { 'content-type': 'text/event-stream' },
	});
}

describe('OpenRouterProvider', () => {
	describe('validateKey', () => {
		it('returns ok=true when /auth/key responds 200', async () => {
			const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			const result = await provider.validateKey(SENTINEL_KEY);

			expect(result.ok).toBe(true);
			expect(fetchMock).toHaveBeenCalledOnce();
			const [url, init] = fetchMock.mock.calls[0];
			expect(url).toContain('/auth/key');
			expect((init.headers as Record<string, string>).Authorization).toBe(
				`Bearer ${SENTINEL_KEY}`,
			);
		});

		it('returns reason=invalid on 401', async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValue(new Response(null, { status: 401, statusText: 'Unauthorized' }));
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			const result = await provider.validateKey(SENTINEL_KEY);

			expect(result).toEqual({ ok: false, reason: 'invalid', message: 'Authentication failed.' });
		});

		it('returns reason=rate_limited on 429', async () => {
			const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 429 }));
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			const result = await provider.validateKey(SENTINEL_KEY);

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.reason).toBe('rate_limited');
		});

		it('redacts the supplied key from network errors', async () => {
			const fetchMock = vi.fn().mockRejectedValue(new Error(`boom for ${SENTINEL_KEY}`));
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			const result = await provider.validateKey(SENTINEL_KEY);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.reason).toBe('network_error');
				expect(result.message).not.toContain(SENTINEL_KEY);
				expect(result.message).toContain('***REDACTED***');
			}
		});
	});

	describe('listModels', () => {
		it('maps the provider response to AiModel[]', async () => {
			const fetchMock = vi.fn().mockResolvedValue(
				jsonResponse({
					data: [
						{
							id: 'anthropic/claude-opus',
							name: 'Claude Opus',
							context_length: 200000,
							pricing: { prompt: '15', completion: '75' },
						},
						{ id: 'google/gemini-2.5-flash' },
					],
				}),
			);
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			const models = await provider.listModels(SENTINEL_KEY);

			expect(models).toEqual([
				{
					id: 'anthropic/claude-opus',
					name: 'Claude Opus',
					contextLength: 200000,
					pricing: { prompt: '15', completion: '75' },
				},
				{ id: 'google/gemini-2.5-flash', name: 'google/gemini-2.5-flash', contextLength: undefined, pricing: undefined },
			]);
		});

		it('redacts the key from error messages on non-200', async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValue(new Response('upstream rejected', { status: 500 }));
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			await expect(provider.listModels(SENTINEL_KEY)).rejects.toThrow(/listModels failed/);
			await expect(provider.listModels(SENTINEL_KEY)).rejects.not.toThrow(SENTINEL_KEY);
		});
	});

	describe('complete', () => {
		it('issues a non-stream chat completion and parses the response', async () => {
			const fetchMock = vi.fn().mockResolvedValue(
				jsonResponse({
					model: 'google/gemini-2.5-flash',
					choices: [
						{ message: { content: 'hello' }, finish_reason: 'stop' },
					],
					usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
				}),
			);
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			const response = await provider.complete(SENTINEL_KEY, {
				model: 'google/gemini-2.5-flash',
				messages: [{ role: 'user', content: 'hi' }],
				temperature: 0.7,
			});

			expect(response).toEqual({
				model: 'google/gemini-2.5-flash',
				content: 'hello',
				finishReason: 'stop',
				usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
			});

			const [, init] = fetchMock.mock.calls[0];
			const body = JSON.parse(init.body as string);
			expect(body).toMatchObject({
				model: 'google/gemini-2.5-flash',
				stream: false,
				temperature: 0.7,
			});
		});

		it('forwards JSON schema response_format', async () => {
			const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ choices: [{}] }));
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			await provider.complete(SENTINEL_KEY, {
				model: 'google/gemini-2.5-flash',
				messages: [{ role: 'user', content: 'hi' }],
				responseFormat: {
					type: 'json_schema',
					jsonSchema: { name: 'r', schema: { type: 'object' } },
				},
			});

			const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
			expect(body.response_format).toEqual({
				type: 'json_schema',
				json_schema: { name: 'r', strict: true, schema: { type: 'object' } },
			});
		});

		it('redacts the key from upstream error messages', async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValue(
					jsonResponse({ error: { message: `bad key ${SENTINEL_KEY}` } }, { status: 401 }),
				);
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			await expect(
				provider.complete(SENTINEL_KEY, {
					model: 'google/gemini-2.5-flash',
					messages: [{ role: 'user', content: 'hi' }],
				}),
			).rejects.toThrow(/complete failed/);
		});
	});

	describe('stream', () => {
		it('yields delta chunks then a done event', async () => {
			const events = [
				'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
				'data: {"choices":[{"delta":{"content":"lo"},"finish_reason":"stop"}]}\n\n',
				'data: [DONE]\n\n',
			];
			const fetchMock = vi.fn().mockResolvedValue(sseResponse(events));
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			const chunks = [];
			for await (const chunk of provider.stream(SENTINEL_KEY, {
				model: 'google/gemini-2.5-flash',
				messages: [{ role: 'user', content: 'hi' }],
			})) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual([
				{ type: 'delta', content: 'Hel' },
				{ type: 'delta', content: 'lo' },
				{ type: 'done', finishReason: 'stop', usage: undefined },
			]);

			const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
			expect(body.stream).toBe(true);
		});

		it('emits an error chunk on non-200 without leaking the key', async () => {
			const fetchMock = vi.fn().mockResolvedValue(
				jsonResponse({ error: { message: `nope ${SENTINEL_KEY}` } }, { status: 500 }),
			);
			const provider = new OpenRouterProvider({ fetch: fetchMock });

			const chunks = [];
			for await (const chunk of provider.stream(SENTINEL_KEY, {
				model: 'google/gemini-2.5-flash',
				messages: [{ role: 'user', content: 'hi' }],
			})) {
				chunks.push(chunk);
			}

			expect(chunks).toHaveLength(1);
			expect(chunks[0].type).toBe('error');
			if (chunks[0].type === 'error') {
				expect(chunks[0].message).not.toContain(SENTINEL_KEY);
			}
		});
	});

	it('uses Authorization Bearer with the supplied key', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		const provider = new OpenRouterProvider({ fetch: fetchMock });

		await provider.listModels(SENTINEL_KEY);

		const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
		expect(headers.Authorization).toBe(`Bearer ${SENTINEL_KEY}`);
		expect(headers['HTTP-Referer']).toBeDefined();
		expect(headers['X-Title']).toBeDefined();
	});

	it('respects custom baseUrl, appReferer, and appTitle', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
		const provider = new OpenRouterProvider({
			fetch: fetchMock,
			baseUrl: 'https://example.test/v9',
			appReferer: 'https://app.example/test',
			appTitle: 'TestSuite',
		});

		await provider.validateKey(SENTINEL_KEY);

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe('https://example.test/v9/auth/key');
		const headers = init.headers as Record<string, string>;
		expect(headers['HTTP-Referer']).toBe('https://app.example/test');
		expect(headers['X-Title']).toBe('TestSuite');
	});
});
