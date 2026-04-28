import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterClient } from '../../src/lib/ai/openrouter';

/**
 * Credential redaction test (plan-017 stage-005 phase-003).
 *
 * Two layers of redaction must hold:
 * 1. The browser proxy `OpenRouterClient` must never send an
 *    Authorization header — the key never leaves the server.
 * 2. The browser must never log a credential value, even when the
 *    upstream server echoes one back in an error message.
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
		expect(output, `console.${sink} must not include a head preview of the API key`).not.toContain(
			headPreview,
		);
		expect(output, `console.${sink} must not include a tail preview of the API key`).not.toContain(
			tailPreview,
		);
		expect(output, `console.${sink} must not include the Bearer header value`).not.toContain(
			`Bearer ${SECRET_KEY}`,
		);
	}
}

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

describe('OpenRouterClient browser redaction', () => {
	let sinks: ConsoleSinks;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
		sinks = spyAllConsole();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('never sets an Authorization header on the proxy request', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			jsonResponse({ text: 'ok', model: 'm', tokensUsed: 0 }),
		);

		const client = new OpenRouterClient();
		await client.complete({ model: 'm', messages: [] });

		const init = vi.mocked(globalThis.fetch).mock.calls[0][1];
		const headers = (init?.headers as Record<string, string>) ?? {};
		expect(headers.Authorization).toBeUndefined();
		expect(JSON.stringify(headers)).not.toContain(SECRET_KEY);
		expect(JSON.stringify(init?.body)).not.toContain(SECRET_KEY);
	});

	it('does not log the API key when proxy stream completes successfully', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			streamResponse([
				'data: {"choices":[{"delta":{"content":"hi"}}]}\n\n',
				'data: [DONE]\n\n',
			]),
		);

		const client = new OpenRouterClient();
		for await (const _chunk of client.streamComplete({ model: 'm', messages: [] })) {
			void _chunk;
		}

		assertNoLeak(sinks);
	});

	it('does not log the API key even if the upstream error message echoes it', async () => {
		// Simulate a server-side leak that smuggles the key into an error.
		// The browser must NEVER reflect it into console.
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			jsonResponse({ error: { code: 'provider_error', message: `bad ${SECRET_KEY}` } }, 502),
		);

		const client = new OpenRouterClient();
		try {
			await client.complete({ model: 'm', messages: [] });
		} catch {
			/* expected */
		}

		assertNoLeak(sinks);
	});
});
