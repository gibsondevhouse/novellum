import type { ContextBundle, AIResponse } from './types.js';
import { OpenRouterClient } from './openrouter.js';
import { DEFAULT_MODEL } from './constants.js';

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
}
