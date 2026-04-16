import type { AIRequestPayload, AIResponse } from './types.js';
import { OPENROUTER_API_URL, FALLBACK_MODELS, DEFAULT_RETRY_CONFIG } from './constants.js';
import { withRetry } from './utils.js';

export class MissingCredentialsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MissingCredentialsError';
	}
}

/**
 * OpenRouterClient — HTTP implementation.
 * Reads VITE_OPENROUTER_API_KEY from the environment or localStorage.
 */
export class OpenRouterClient {
	constructor() {
		// Constructor no longer caches the key; streamComplete() reads it dynamically
	}

	private getApiKey(): string {
		// Read the key dynamically each time it's needed
		let uiKey = '';
		if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
			uiKey = window.localStorage.getItem('novellum_openrouter_key') || '';
		}
		return uiKey || import.meta.env.VITE_OPENROUTER_API_KEY || '';
	}

	async *streamComplete(payload: AIRequestPayload): AsyncGenerator<string, void, unknown> {
		const apiKey = this.getApiKey();
		if (!apiKey) {
			throw new MissingCredentialsError(
				'[OpenRouterClient] API key is not set. Add it in the Settings UI or set VITE_OPENROUTER_API_KEY in .env.local.'
			);
		}

		const modelsToTry = [payload.model, ...(FALLBACK_MODELS[payload.model] ?? [])];
		let lastError: Error | null = null;

		for (const currentModel of modelsToTry) {
			try {
				const response = await withRetry(async () => {
					const requestBody = {
						model: currentModel,
						messages: payload.messages,
						stream: true,
					};

					const keyPreview = apiKey.substring(0, 15) + '...' + apiKey.substring(apiKey.length - 5);
					console.log('[OpenRouterClient] Stream request with API key:', keyPreview);
					console.log('[OpenRouterClient] Using model:', currentModel, 'messages count:', payload.messages.length);

					const res = await fetch(OPENROUTER_API_URL, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${apiKey}`,
							'HTTP-Referer': 'http://localhost:5174',
							'X-Title': 'Novellum',
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(requestBody),
					});

					console.log('[OpenRouterClient] Response status:', res.status);

					if (!res.ok) {
						const errorText = await res.text();
						console.error('[OpenRouterClient] API error response:', res.status, errorText, 'Full response:', res.statusText);
						const err = new Error(`OpenRouter API error ${res.status}: ${errorText}`);
						Object.assign(err, { status: res.status });
						throw err;
					}

					if (!res.body) {
						throw new Error('No response body returned from OpenRouter API');
					}

					return res;
				}, DEFAULT_RETRY_CONFIG);

				const reader = response.body!.getReader();
				const decoder = new TextDecoder();
				let buffer = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split('\n');
					
					// Keep the last incomplete line in the buffer
					buffer = lines.pop() || '';

					for (const line of lines) {
						const trimmedLine = line.trim();
						// Ignore empty lines and SSE comments
						if (!trimmedLine || trimmedLine.startsWith(':')) continue;
						
						if (trimmedLine === 'data: [DONE]') {
							return; // Stream finished
						}

						if (trimmedLine.startsWith('data: ')) {
							const dataStr = trimmedLine.slice(6);
							try {
								const parsed = JSON.parse(dataStr);
								const content = parsed.choices?.[0]?.delta?.content;
								if (content) {
									yield content;
								}
							} catch {
								// Edge Case: Handle malformed JSON chunks in the SSE stream
								console.warn('[OpenRouterClient] Malformed stream chunk:', dataStr);
							}
						}
					}
				}
				
				return; // Successfully streamed
			} catch (err: unknown) {
				lastError = err instanceof Error ? err : new Error(String(err));
				const status = (err as Record<string, unknown>).status;
				if (typeof status === 'number' && status >= 400 && status < 500 && status !== 429) {
					throw new Error(`[OpenRouterClient] Network or API error: ${lastError.message}`, { cause: err });
				}
			}
		}

		throw new Error(`[OpenRouterClient] All models/retries failed for stream. Last error: ${lastError?.message}`, { cause: lastError });
	}

	async complete(payload: AIRequestPayload): Promise<AIResponse> {
		const apiKey = this.getApiKey();
		if (!apiKey) {
			throw new MissingCredentialsError(
				'[OpenRouterClient] API key is not set. Add it in the Settings UI or set VITE_OPENROUTER_API_KEY in .env.local.'
			);
		}

		const modelsToTry = [payload.model, ...(FALLBACK_MODELS[payload.model] ?? [])];
		let lastError: Error | null = null;

		for (const currentModel of modelsToTry) {
			try {
				return await withRetry(async () => {
					const res = await fetch(OPENROUTER_API_URL, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${apiKey}`,
							'HTTP-Referer': 'http://localhost:5173',
							'X-Title': 'Novellum',
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							model: currentModel,
							messages: payload.messages,
						}),
					});

					if (!res.ok) {
						const errorText = await res.text();
						const err = new Error(`OpenRouter API error ${res.status}: ${errorText}`);
						Object.assign(err, { status: res.status });
						throw err;
					}

					const data = await res.json();
					return {
						text: data.choices[0]?.message?.content || '',
						model: data.model || currentModel,
						tokensUsed: data.usage?.total_tokens || 0,
					};
				}, DEFAULT_RETRY_CONFIG);
			} catch (err: unknown) {
				lastError = err instanceof Error ? err : new Error(String(err));
				const status = (err as Record<string, unknown>).status;
				if (typeof status === 'number' && status >= 400 && status < 500 && status !== 429) {
					throw new Error(`[OpenRouterClient] Network or API error: ${lastError.message}`, { cause: err });
				}
			}
		}

		throw new Error(`[OpenRouterClient] All models/retries failed. Last error: ${lastError?.message}`, { cause: lastError });
	}
}
