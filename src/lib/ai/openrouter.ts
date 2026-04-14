import type { AIRequestPayload, AIResponse } from './types.js';

export class MissingCredentialsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MissingCredentialsError';
	}
}

/**
 * OpenRouterClient — HTTP implementation.
 * Reads VITE_OPENROUTER_API_KEY from the environment.
 */
export class OpenRouterClient {
	private readonly apiKey: string;
	private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

	constructor() {
		this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY ?? '';
	}

	async complete(payload: AIRequestPayload): Promise<AIResponse> {
		if (!this.apiKey) {
			throw new MissingCredentialsError(
				'[OpenRouterClient] VITE_OPENROUTER_API_KEY is not set. Add it to .env.local to enable AI features.'
			);
		}

		try {
			const res = await fetch(this.apiUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.apiKey}`,
					'HTTP-Referer': 'http://localhost:5173', // Adjust this with dynamic url if available
					'X-Title': 'Novellum',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: payload.model,
					messages: payload.messages,
				}),
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(`OpenRouter API error ${res.status}: ${errorText}`);
			}

			const data = await res.json();
			const text = data.choices[0]?.message?.content || '';

			return {
				text,
				model: data.model || payload.model,
				tokensUsed: data.usage?.total_tokens || 0,
			};
		} catch (err) {
			if (err instanceof MissingCredentialsError) {
				throw err;
			}
			throw new Error(`[OpenRouterClient] Network or API error: ${(err as Error).message}`);
		}
	}
