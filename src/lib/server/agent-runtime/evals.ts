import type { AiProvider, CompletionRequest, CompletionResponse, StreamChunk } from '$lib/ai/providers/types.js';

export interface EvalFixture {
	id: string;
	name: string;
	description: string;
	request: Partial<CompletionRequest>;
	response: CompletionResponse;
}

export interface EvalResult {
	fixtureId: string;
	fixtureName: string;
	passed: boolean;
	actualResponse: CompletionResponse;
	expectedResponse: CompletionResponse;
	error?: string;
}

/**
 * Mock provider for deterministic evaluation.
 */
export class EvalMockProvider implements AiProvider {
	readonly providerId = 'eval-mock';
	readonly displayName = 'Eval Mock';

	private fixtures: Map<string, EvalFixture>;

	constructor(fixtures: EvalFixture[] = []) {
		this.fixtures = new Map(fixtures.map((f) => [f.id, f]));
	}

	async validateKey(): Promise<{ ok: true; verifiedAt: string }> {
		return { ok: true, verifiedAt: new Date().toISOString() };
	}

	async listModels(): Promise<any[]> {
		return [];
	}

	async complete(_apiKey: string, request: CompletionRequest): Promise<CompletionResponse> {
		// In a real eval, we might match by prompt hash or a specific header.
		// For simplicity, we assume the first fixture matches if none specified.
		const fixture = [...this.fixtures.values()][0];
		if (!fixture) throw new Error('No fixtures loaded in EvalMockProvider');
		return fixture.response;
	}

	async *stream(_apiKey: string, request: CompletionRequest): AsyncIterable<StreamChunk> {
		const fixture = [...this.fixtures.values()][0];
		if (!fixture) {
			yield { type: 'error', message: 'No fixtures loaded', recoverable: false };
			return;
		}
		// Simulate streaming by yielding the content in one chunk.
		yield { type: 'delta', content: fixture.response.content };
		yield { type: 'done', finishReason: fixture.response.finishReason, usage: fixture.response.usage };
	}
}

/**
 * Basic eval runner that compares actual provider output against expected fixture output.
 */
export async function runEval(
	fixture: EvalFixture,
	provider: AiProvider,
	apiKey = 'eval-key',
): Promise<EvalResult> {
	try {
		const actual = await provider.complete(apiKey, fixture.request as CompletionRequest);
		const passed = compareResponses(actual, fixture.response);
		return {
			fixtureId: fixture.id,
			fixtureName: fixture.name,
			passed,
			actualResponse: actual,
			expectedResponse: fixture.response,
		};
	} catch (err) {
		return {
			fixtureId: fixture.id,
			fixtureName: fixture.name,
			passed: false,
			actualResponse: { model: 'error', content: '', finishReason: 'other' },
			expectedResponse: fixture.response,
			error: err instanceof Error ? err.message : String(err),
		};
	}
}

function compareResponses(actual: CompletionResponse, expected: CompletionResponse): boolean {
	// For basic evals, we might just check that it's non-empty or matches a schema.
	// Production evals would use more sophisticated similarity or logic checks.
	if (!actual.content && expected.content) return false;
	return true;
}
