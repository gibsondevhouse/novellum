import type { ContextBundle, AIResponse } from './types.js';
import { OpenRouterClient } from './openrouter.js';
import { DEFAULT_MODEL } from './constants.js';
import {
	createPipelineArtifactEnvelope,
	type PipelineArtifactEnvelope,
	type PipelineRunRequest,
} from './pipeline/contracts.js';
import {
	createWorldbuildArtifactFromModelOutput,
	type WorldbuildArtifactBuildRequest,
	type WorldbuildArtifactResult,
} from './pipeline/worldbuild-agent.js';
import {
	createAuthorArtifactFromModelOutput,
	type AuthorArtifactBuildRequest,
	type AuthorArtifactResult,
} from './pipeline/author-agent.js';

export class Orchestrator {
	private readonly client: OpenRouterClient;

	constructor() {
		this.client = new OpenRouterClient();
	}

	async run(context: ContextBundle): Promise<AIResponse> {
		const systemParts: string[] = ['You are a creative writing assistant helping with a novel.'];
		if (context.bibleSummary) systemParts.push(`Story Bible: ${context.bibleSummary}`);
		if (context.outlineSection) systemParts.push(`Outline: ${context.outlineSection}`);
		if (context.chapterText) systemParts.push(`Current chapter draft: ${context.chapterText}`);

		return this.client.complete({
			model: DEFAULT_MODEL,
			messages: [
				{ role: 'system', content: systemParts.join('\n\n') },
				{ role: 'user', content: context.userPrompt },
			],
		});
	}

	async runPipeline<TPayload>(
		request: PipelineRunRequest<TPayload>,
	): Promise<PipelineArtifactEnvelope<TPayload>> {
		return createPipelineArtifactEnvelope(request);
	}

	runWorldbuildPipeline(request: WorldbuildArtifactBuildRequest): WorldbuildArtifactResult {
		return createWorldbuildArtifactFromModelOutput(request);
	}

	runAuthorPipeline(request: AuthorArtifactBuildRequest): AuthorArtifactResult {
		return createAuthorArtifactFromModelOutput(request);
	}
}
