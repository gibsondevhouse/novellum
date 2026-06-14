import { describe, expect, it } from 'vitest';
import { redactRuntimePayload, toRedactedJson } from '$lib/server/agent-runtime';

describe('agent runtime redaction', () => {
	it('redacts credential-like fields and manuscript-bearing fields', () => {
		const result = redactRuntimePayload({
			runId: 'run-1',
			status: 'running',
			apiKey: 'sk-live',
			authorization: 'Bearer secret',
			prompt: 'Write the full scene.',
			messages: [{ role: 'user', content: 'chapter text' }],
			output: {
				rawOutput: 'model dump',
				contentHash: 'sha256:abc',
			},
		});

		expect(result.redacted).toEqual({
			runId: 'run-1',
			status: 'running',
			apiKey: '[redacted]',
			authorization: '[redacted]',
			prompt: '[redacted]',
			messages: '[redacted]',
			output: {
				rawOutput: '[redacted]',
				contentHash: 'sha256:abc',
			},
		});
		expect(result.redactions.map((redaction) => redaction.fieldPath)).toEqual([
			'$.apiKey',
			'$.authorization',
			'$.prompt',
			'$.messages',
			'$.output.rawOutput',
		]);
		expect(result.redactions.map((redaction) => redaction.redactionType)).toContain('credential');
		expect(result.redactions.map((redaction) => redaction.redactionType)).toContain(
			'manuscript_text',
		);
		expect(result.redactions.map((redaction) => redaction.redactionType)).toContain(
			'raw_model_output',
		);
	});

	it('serializes redacted payloads without leaking sensitive strings', () => {
		const { json, redactions } = toRedactedJson({
			projectId: 'project-1',
			contextHash: 'sha256:context',
			content: 'scene body',
			nested: { token: 'secret-token' },
		});

		expect(json).toBe(
			'{"projectId":"project-1","contextHash":"sha256:context","content":"[redacted]","nested":{"token":"[redacted]"}}',
		);
		expect(json).not.toContain('scene body');
		expect(json).not.toContain('secret-token');
		expect(redactions).toHaveLength(2);
	});

	it('guards against circular diagnostic payloads', () => {
		const payload: Record<string, unknown> = { id: 'payload-1' };
		payload.self = payload;

		const result = redactRuntimePayload(payload);

		expect(result.redacted).toEqual({ id: 'payload-1', self: '[redacted]' });
		expect(result.redactions).toEqual([
			expect.objectContaining({
				fieldPath: '$.self',
				redactionType: 'custom',
				reason: 'circular reference',
			}),
		]);
	});
});
