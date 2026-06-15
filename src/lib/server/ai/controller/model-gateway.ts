import type { AiProvider, CompletionResponse } from '$lib/ai/providers/types.js';
import type { AiControllerRequest } from './contracts.js';
import type { AiControllerContextPacket } from './context-packet.js';
import type { AiControllerWorkflowDefinition } from './workflow-contracts.js';
import type { AiControllerWorkflowRegistry } from './workflow-registry.js';

export type ModelGatewayProviderResult =
	| { kind: 'ok'; provider: AiProvider; apiKey: string; modelOverride?: string }
	| { kind: 'mock' }
	| { kind: 'no_credentials' };

export interface ModelGatewayProviderResolver {
	(): Promise<ModelGatewayProviderResult>;
}

export interface ExecuteModelInput {
	request: AiControllerRequest;
	workflow: AiControllerWorkflowDefinition;
	contextPacket: AiControllerContextPacket;
	signal?: AbortSignal;
}

export interface ExecuteModelResult {
	model: string;
	content: string;
	finishReason: CompletionResponse['finishReason'];
	usage?: CompletionResponse['usage'];
	mocked: boolean;
}

export interface ControllerModelGateway {
	execute(input: ExecuteModelInput): Promise<ExecuteModelResult>;
}

export interface ControllerModelGatewayOptions {
	resolveProvider: ModelGatewayProviderResolver;
	registry: AiControllerWorkflowRegistry;
	defaultModel?: string;
}

function buildPrompt(input: ExecuteModelInput): string {
	const snippets = input.contextPacket.snippets
		.map((snippet) => `### ${snippet.label}\n${snippet.text}`)
		.join('\n\n');
	return [
		`ROLE: You are the Novellum governed AI controller executing ${input.workflow.title}.`,
		`TASK: ${input.request.action.instruction ?? input.workflow.description}`,
		`CONTEXT:\n${snippets || '(no additional context)'}`,
		'CONSTRAINTS:',
		'- Do not invent facts outside the provided context.',
		'- Do not mutate manuscript, outline, or worldbuilding canon.',
		'- Return only the requested output format.',
		`OUTPUT FORMAT: ${input.workflow.output.schemaName} version ${input.workflow.output.schemaVersion}.`,
	].join('\n\n');
}

function mockContent(workflow: AiControllerWorkflowDefinition): string {
	switch (workflow.output.schemaName) {
		case 'proposal_list':
			return JSON.stringify({ proposals: [] });
		case 'draft_list':
			return JSON.stringify({ drafts: [] });
		case 'artifact_ref':
			return JSON.stringify({ status: 'review' });
		case 'tool_response':
			return JSON.stringify({ content: '[mock agent response]', tool_calls: null, finish_reason: 'stop' });
		case 'text_response':
		case 'unknown':
			return JSON.stringify({ content: '[mock controller response]' });
	}
}

export function createControllerModelGateway(
	options: ControllerModelGatewayOptions,
): ControllerModelGateway {
	return {
		async execute(input) {
			const providerResult = await options.resolveProvider();
			const model =
				providerResult.kind === 'ok'
					? providerResult.modelOverride ?? input.workflow.model.defaultModel ?? options.defaultModel ?? 'openai/gpt-4o-mini'
					: input.workflow.model.defaultModel ?? options.defaultModel ?? 'mock-model';

			if (providerResult.kind === 'no_credentials') {
				throw new Error('No AI provider credentials configured.');
			}
			if (providerResult.kind === 'mock') {
				return {
					model,
					content: mockContent(input.workflow),
					finishReason: 'stop',
					usage: { totalTokens: 0 },
					mocked: true,
				};
			}

			const responseFormat = options.registry.responseFormatFor(input.workflow);
			const response = await providerResult.provider.complete(providerResult.apiKey, {
				model,
				messages: [{ role: 'user', content: buildPrompt(input) }],
				maxTokens: input.workflow.model.maxOutputTokens,
				temperature: input.workflow.model.temperature,
				responseFormat,
				runtime: { runId: input.request.requestId },
				signal: input.signal,
			});
			return {
				model: response.model,
				content: response.content,
				finishReason: response.finishReason,
				usage: response.usage,
				mocked: false,
			};
		},
	};
}
