import { describe, expect, it, vi } from 'vitest';
import type { AiProvider } from '../../src/lib/ai/providers/types.js';
import {
	createControllerModelGateway,
	createControllerWorkflowRegistry,
	type AiControllerRequest,
	type AiControllerContextPacket,
} from '../../src/lib/server/ai/controller/index.js';

const request: AiControllerRequest = {
	requestId: 'request-1',
	projectId: 'project-1',
	requestedBy: 'user',
	action: { source: 'nova', id: 'nova.ask', instruction: 'What changed?' },
	target: { kind: 'project', id: 'project-1', projectId: 'project-1' },
	createdAt: '2026-06-15T00:00:00.000Z',
};

const packet: AiControllerContextPacket = {
	version: '1.0.0',
	projectId: 'project-1',
	target: request.target,
	contextRefs: [],
	snippets: [
		{
			id: 'project:project-1',
			source: 'project',
			label: 'Project',
			text: 'Project context',
			charCount: 15,
			estimatedTokens: 4,
			relevance: 'required',
			redacted: false,
		},
	],
	tokenBudget: { maxTokens: 100, estimatedTokens: 4, truncated: false, truncatedSnippetIds: [] },
	disclosure: { includedSources: ['project'], excludedSources: [] },
	contextHash: 'sha256:context',
	createdAt: '2026-06-15T00:00:00.000Z',
};

describe('controller model gateway', () => {
	it('calls the resolved provider with controller prompt and workflow settings', async () => {
		const registry = createControllerWorkflowRegistry();
		const workflow = registry.get('nova.ask');
		if (!workflow) throw new Error('missing workflow');

		const complete = vi.fn<AiProvider['complete']>().mockResolvedValue({
			model: 'model-a',
			content: '{"content":"answer"}',
			finishReason: 'stop',
		});
		const provider: AiProvider = {
			providerId: 'test',
			displayName: 'Test',
			validateKey: vi.fn(),
			listModels: vi.fn(),
			complete,
			stream: vi.fn(),
		};
		const gateway = createControllerModelGateway({
			registry,
			resolveProvider: async () => ({ kind: 'ok', provider, apiKey: 'secret', modelOverride: 'model-a' }),
		});

		const result = await gateway.execute({ request, workflow, contextPacket: packet });

		expect(result.content).toBe('{"content":"answer"}');
		expect(complete).toHaveBeenCalledWith(
			'secret',
			expect.objectContaining({
				model: 'model-a',
				maxTokens: workflow.model.maxOutputTokens,
			}),
		);
		expect(JSON.stringify(complete.mock.calls[0][1])).toContain('ROLE:');
	});

	it('returns schema-shaped mock content in mock mode', async () => {
		const registry = createControllerWorkflowRegistry();
		const workflow = registry.get('worldbuilding.scan');
		if (!workflow) throw new Error('missing workflow');
		const gateway = createControllerModelGateway({
			registry,
			resolveProvider: async () => ({ kind: 'mock' }),
		});

		const result = await gateway.execute({ request, workflow, contextPacket: packet });

		expect(result.mocked).toBe(true);
		expect(JSON.parse(result.content)).toEqual({ proposals: [] });
	});
});
