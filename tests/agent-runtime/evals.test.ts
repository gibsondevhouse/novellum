import { describe, it, expect } from 'vitest';
import { runEval, EvalMockProvider, type EvalFixture } from '$lib/server/agent-runtime/evals.js';
import outlineFixture from '../fixtures/ai-runtime/outline-generation.json';

describe('AI Runtime Evals', () => {
	it('should run an eval against a mock provider', async () => {
		const fixture = outlineFixture as EvalFixture;
		const provider = new EvalMockProvider([fixture]);

		const result = await runEval(fixture, provider);

		expect(result.passed).toBe(true);
		expect(result.fixtureId).toBe(fixture.id);
		expect(result.actualResponse.content).toBe(fixture.response.content);
	});

	it('should fail an eval if responses do not match', async () => {
		const fixture = outlineFixture as EvalFixture;
		const provider = new EvalMockProvider([{
			...fixture,
			response: { ...fixture.response, content: '' }
		}]);

		const result = await runEval(fixture, provider);

		expect(result.passed).toBe(false);
	});
});
