import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterClient, MissingCredentialsError } from '../../src/lib/ai/openrouter';

/**
 * As of plan-017 stage-005 phase-003, OpenRouterClient is a thin proxy
 * around `/api/ai`. The browser never holds the API key and the client
 * never sends an Authorization header.
 */
describe('OpenRouterClient (browser proxy)', () => {
	let client: OpenRouterClient;

	beforeEach(() => {
		client = new OpenRouterClient();
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function jsonResponse(body: unknown, status = 200): Response {
		return new Response(JSON.stringify(body), {
			status,
			headers: { 'content-type': 'application/json' },
		});
	}

	function streamResponse(events: string[]): Response {
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				for (const e of events) controller.enqueue(encoder.encode(e));
				controller.close();
			},
		});
		return new Response(stream, {
			status: 200,
			headers: { 'content-type': 'text/event-stream' },
		});
	}

	describe('complete', () => {
		it('POSTs to /api/ai with messages and model, no Authorization header', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValueOnce(
				jsonResponse({ text: 'hello', model: 'm1', tokensUsed: 7 }),
			);

			const result = await client.complete({ model: 'm1', messages: [] });

			expect(result).toEqual({ text: 'hello', model: 'm1', tokensUsed: 7 });
			const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
			expect(url).toBe('/api/ai');
			expect(init?.method).toBe('POST');
			const headers = init?.headers as Record<string, string>;
			expect(headers.Authorization).toBeUndefined();
		});

		it('throws MissingCredentialsError on 401 no_credentials', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValueOnce(
				jsonResponse({ error: { code: 'no_credentials', message: 'no key' } }, 401),
			);

			await expect(client.complete({ model: 'm1', messages: [] })).rejects.toBeInstanceOf(
				MissingCredentialsError,
			);
		});

		it('falls back to data.content when data.text is absent (task-mode response)', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse({ content: 'taskish' }));
			const result = await client.complete({ model: 'm1', messages: [] });
			expect(result.text).toBe('taskish');
		});

		it('throws on a 502 proxy error with the upstream message', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValueOnce(
				jsonResponse({ error: { code: 'provider_error', message: 'rate limited' } }, 502),
			);

			await expect(client.complete({ model: 'm1', messages: [] })).rejects.toThrow(/rate limited/);
		});
	});

	describe('streamComplete', () => {
		it('yields delta chunks from the proxy SSE response', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValueOnce(
				streamResponse([
					'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
					'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
					'data: [DONE]\n\n',
				]),
			);

			const chunks: string[] = [];
			for await (const c of client.streamComplete({ model: 'm1', messages: [] })) chunks.push(c);

			expect(chunks).toEqual(['Hel', 'lo']);
			const init = vi.mocked(globalThis.fetch).mock.calls[0][1];
			expect(JSON.parse(init?.body as string)).toEqual({
				model: 'm1',
				messages: [],
				stream: true,
			});
		});

		it('throws MissingCredentialsError if the proxy returns 401', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValueOnce(
				jsonResponse({ error: { code: 'no_credentials', message: 'no key' } }, 401),
			);

			const generator = client.streamComplete({ model: 'm1', messages: [] });
			await expect(async () => {
				for await (const _chunk of generator) {
					void _chunk;
				}
			}).rejects.toBeInstanceOf(MissingCredentialsError);
		});

		it('surfaces an upstream error chunk as a thrown Error', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValueOnce(
				streamResponse(['data: {"error":{"message":"upstream boom"}}\n\n']),
			);

			const generator = client.streamComplete({ model: 'm1', messages: [] });
			await expect(async () => {
				for await (const _chunk of generator) {
					void _chunk;
				}
			}).rejects.toThrow(/upstream boom/);
		});
	});
});
