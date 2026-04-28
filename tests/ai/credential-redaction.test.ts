import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterClient } from '../../src/lib/ai/openrouter';

/**
 * Credential redaction test (plan-017 stage-001 phase-001).
 *
 * Asserts that no console sink ever observes the OpenRouter API key
 * — neither in full nor as a partial preview — across the streaming
 * request path, including success and error responses.
 *
 * If this test ever fails, treat it as a release blocker: a credential
 * leak has regressed.
 */

const SECRET_KEY = 'sk-or-v1-supersecretkeythatmustnotleak1234567890';

interface ConsoleSinks {
	log: ReturnType<typeof vi.spyOn>;
	info: ReturnType<typeof vi.spyOn>;
	warn: ReturnType<typeof vi.spyOn>;
	error: ReturnType<typeof vi.spyOn>;
	debug: ReturnType<typeof vi.spyOn>;
}

function spyAllConsole(): ConsoleSinks {
	return {
		log: vi.spyOn(console, 'log').mockImplementation(() => {}),
		info: vi.spyOn(console, 'info').mockImplementation(() => {}),
		warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
		error: vi.spyOn(console, 'error').mockImplementation(() => {}),
		debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
	};
}

function flattenCalls(spy: ConsoleSinks[keyof ConsoleSinks]): string {
	return spy.mock.calls
		.flat()
		.map((arg: unknown) => {
			try {
				return typeof arg === 'string' ? arg : JSON.stringify(arg);
			} catch {
				return String(arg);
			}
		})
		.join('\n');
}

function assertNoLeak(sinks: ConsoleSinks) {
	const haystacks: Array<[string, string]> = [
		['log', flattenCalls(sinks.log)],
		['info', flattenCalls(sinks.info)],
		['warn', flattenCalls(sinks.warn)],
		['error', flattenCalls(sinks.error)],
		['debug', flattenCalls(sinks.debug)],
	];

	const fullKey = SECRET_KEY;
	const headPreview = SECRET_KEY.slice(0, 15);
	const tailPreview = SECRET_KEY.slice(-5);

	for (const [sink, output] of haystacks) {
		expect(output, `console.${sink} must not include the full API key`).not.toContain(fullKey);
		expect(output, `console.${sink} must not include a head preview of the API key`).not.toContain(headPreview);
		expect(output, `console.${sink} must not include a tail preview of the API key`).not.toContain(tailPreview);
		expect(output, `console.${sink} must not include the Bearer header value`).not.toContain(`Bearer ${SECRET_KEY}`);
	}
}

async function drainStream(
	stream: AsyncGenerator<string, void, unknown>,
): Promise<string[]> {
	const chunks: string[] = [];
	try {
		for await (const chunk of stream) chunks.push(chunk);
	} catch {
		// Errors are expected for some scenarios; we only care about console output.
	}
	return chunks;
}

function makeStreamResponse(body: string, ok = true, status = 200): Response {
	const encoder = new TextEncoder();
	const readable = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(encoder.encode(body));
			controller.close();
		},
	});
	return {
		ok,
		status,
		statusText: ok ? 'OK' : 'Error',
		body: readable,
		text: async () => body,
	} as unknown as Response;
}

describe('OpenRouterClient credential redaction', () => {
	let sinks: ConsoleSinks;

	beforeEach(() => {
		vi.stubEnv('VITE_OPENROUTER_API_KEY', SECRET_KEY);
		globalThis.fetch = vi.fn();
		sinks = spyAllConsole();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	it('does not log the API key during a successful streaming request', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			makeStreamResponse('data: {"choices":[{"delta":{"content":"hi"}}]}\n\ndata: [DONE]\n\n'),
		);

		const client = new OpenRouterClient();
		await drainStream(client.streamComplete({ model: 'test-model', messages: [] }));

		assertNoLeak(sinks);
	});

	it('does not log the API key when the streaming request returns an error response', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue(
			makeStreamResponse('forbidden', false, 403),
		);

		const client = new OpenRouterClient();
		await drainStream(client.streamComplete({ model: 'test-model', messages: [] }));

		assertNoLeak(sinks);
	});

	it('does not log the API key when complete() succeeds', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				choices: [{ message: { content: 'ok' } }],
				model: 'test-model',
				usage: { total_tokens: 1 },
			}),
		} as Response);

		const client = new OpenRouterClient();
		await client.complete({ model: 'test-model', messages: [] });

		assertNoLeak(sinks);
	});
});
