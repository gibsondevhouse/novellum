import { describe, it, expect, vi } from 'vitest';
import { OllamaProvider } from '../../src/lib/ai/providers/ollama-provider.js';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { 'content-type': 'application/json' },
		...init,
	});
}

function ndjsonResponse(events: unknown[]): Response {
	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();
			for (const e of events) {
				controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
			}
			controller.close();
		},
	});
	return new Response(stream, {
		status: 200,
		headers: { 'content-type': 'application/x-ndjson' },
	});
}

describe('OllamaProvider', () => {
	describe('validateKey', () => {
		it('returns ok when /api/tags responds 200', async () => {
			const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ models: [] }));
			const provider = new OllamaProvider({ fetch: fetchMock });

			const result = await provider.validateKey('');

			expect(result.ok).toBe(true);
			const [url, init] = fetchMock.mock.calls[0];
			expect(url).toBe('http://127.0.0.1:11434/api/tags');
			expect(init.method).toBe('GET');
		});

		it('returns network_error when fetch throws', async () => {
			const fetchMock = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
			const provider = new OllamaProvider({ fetch: fetchMock });

			const result = await provider.validateKey('');

			expect(result).toEqual({
				ok: false,
				reason: 'network_error',
				message: 'ECONNREFUSED',
			});
		});

		it('honours custom baseUrl and trims trailing slashes', async () => {
			const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ models: [] }));
			const provider = new OllamaProvider({
				fetch: fetchMock,
				baseUrl: 'http://example.test:9999///',
			});

			await provider.validateKey('');

			expect(fetchMock.mock.calls[0][0]).toBe('http://example.test:9999/api/tags');
		});
	});

	describe('listModels', () => {
		it('maps Ollama tag entries to AiModel shape', async () => {
			const fetchMock = vi.fn().mockResolvedValue(
				jsonResponse({
					models: [
						{ name: 'llama3:8b', details: { family: 'llama' } },
						{ name: 'mistral:latest' },
					],
				}),
			);
			const provider = new OllamaProvider({ fetch: fetchMock });

			const models = await provider.listModels('');

			expect(models).toEqual([
				{ id: 'llama3:8b', name: 'llama3:8b (llama)' },
				{ id: 'mistral:latest', name: 'mistral:latest' },
			]);
		});
	});

	describe('complete', () => {
		it('sends a chat request and unwraps the assistant message', async () => {
			const fetchMock = vi.fn().mockResolvedValue(
				jsonResponse({
					model: 'llama3:8b',
					message: { role: 'assistant', content: 'hello there' },
					done: true,
					done_reason: 'stop',
					prompt_eval_count: 4,
					eval_count: 7,
				}),
			);
			const provider = new OllamaProvider({ fetch: fetchMock });

			const response = await provider.complete('', {
				model: 'llama3:8b',
				messages: [{ role: 'user', content: 'hi' }],
			});

			expect(response.content).toBe('hello there');
			expect(response.finishReason).toBe('stop');
			expect(response.usage).toEqual({
				promptTokens: 4,
				completionTokens: 7,
				totalTokens: 11,
			});

			const [url, init] = fetchMock.mock.calls[0];
			expect(url).toBe('http://127.0.0.1:11434/api/chat');
			expect(init.method).toBe('POST');
			const body = JSON.parse(init.body as string);
			expect(body).toMatchObject({
				model: 'llama3:8b',
				stream: false,
				messages: [{ role: 'user', content: 'hi' }],
			});
		});

		it('forwards generation options when provided', async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValue(
					jsonResponse({ message: { role: 'assistant', content: '' }, done: true }),
				);
			const provider = new OllamaProvider({ fetch: fetchMock });

			await provider.complete('', {
				model: 'llama3:8b',
				messages: [],
				temperature: 0.2,
				maxTokens: 256,
				topP: 0.9,
			});

			const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
			expect(body.options).toEqual({
				temperature: 0.2,
				num_predict: 256,
				top_p: 0.9,
			});
		});
	});

	describe('stream', () => {
		it('yields delta chunks per NDJSON line and terminates with done', async () => {
			const fetchMock = vi.fn().mockResolvedValue(
				ndjsonResponse([
					{ message: { role: 'assistant', content: 'Hello' } },
					{ message: { role: 'assistant', content: ' world' } },
					{ done: true, done_reason: 'stop', prompt_eval_count: 2, eval_count: 3 },
				]),
			);
			const provider = new OllamaProvider({ fetch: fetchMock });

			const chunks: unknown[] = [];
			for await (const chunk of provider.stream('', {
				model: 'llama3:8b',
				messages: [],
			})) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual([
				{ type: 'delta', content: 'Hello' },
				{ type: 'delta', content: ' world' },
				{
					type: 'done',
					finishReason: 'stop',
					usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 },
				},
			]);
		});

		it('emits an error chunk when the response is not ok', async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValue(new Response(null, { status: 500, statusText: 'Boom' }));
			const provider = new OllamaProvider({ fetch: fetchMock });

			const chunks: unknown[] = [];
			for await (const chunk of provider.stream('', {
				model: 'llama3:8b',
				messages: [],
			})) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual([
				{ type: 'error', message: 'Ollama stream failed: 500 Boom', recoverable: false },
			]);
		});
	});
});
