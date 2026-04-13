import type { AIRequestPayload, AIResponse } from './types.js';

/**
 * OpenRouterClient — stub implementation.
 * Reads VITE_OPENROUTER_API_KEY from the environment.
 * Throws "Not implemented" until a real key and HTTP layer are wired in.
 */
export class OpenRouterClient {
	private readonly apiKey: string;

	constructor() {
		this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY ?? '';
	}

	async complete(_payload: AIRequestPayload): Promise<AIResponse> {
		if (!this.apiKey) {
			throw new Error(
				'[OpenRouterClient] VITE_OPENROUTER_API_KEY is not set. ' +
					'Add it to .env.local to enable AI features.',
			);
		}
		// TODO: implement real OpenRouter HTTP call
		throw new Error('[OpenRouterClient] Not implemented');
	}
}
