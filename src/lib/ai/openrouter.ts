import type { AIRequestPayload, AIResponse } from './types.js';

export class MissingCredentialsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MissingCredentialsError';
	}
}

export const FALLBACK_MODELS: Record<string, string[]> = {
	// No fallbacks for now - we're testing with a single model
};

/**
 * OpenRouterClient — HTTP implementation.
 * Reads VITE_OPENROUTER_API_KEY from the environment or localStorage.
 */
export class OpenRouterClient {
	private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
	private readonly maxRetries = 3;
	private readonly baseDelayMs = 1000;

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

	private async sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async *streamComplete(payload: AIRequestPayload): AsyncGenerator<string, void, unknown> {
		const apiKey = this.getApiKey();
		if (!apiKey) {
			throw new MissingCredentialsError(
				'[OpenRouterClient] API key is not set. Add it in the Settings UI or set VITE_OPENROUTER_API_KEY in .env.local.'
			);
		}

		const modelsToTry = [payload.model];
		if (FALLBACK_MODELS[payload.model]) {
			modelsToTry.push(...FALLBACK_MODELS[payload.model]);
		}

		let lastError: Error | null = null;

		for (const currentModel of modelsToTry) {
			let attempt = 0;
			
			while (attempt < this.maxRetries) {
				attempt++;
				try {
					const requestBody = {
						model: currentModel,
						messages: payload.messages,
						stream: true,
					};

					const keyPreview = apiKey.substring(0, 15) + '...' + apiKey.substring(apiKey.length - 5);
					console.log('[OpenRouterClient] Attempt', attempt, 'with API key:', keyPreview);
					console.log('[OpenRouterClient] Using model:', currentModel, 'messages count:', payload.messages.length);

					const res = await fetch(this.apiUrl, {
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
						const isRetryable = res.status === 429 || res.status >= 500;

						console.error('[OpenRouterClient] API error response:', res.status, errorText, 'Full response:', res.statusText);

						if (isRetryable) {
							throw new Error(`OpenRouter API error ${res.status}: ${errorText}`);
						} else {
							// For 4xx (except 429), don't retry same model
							const err = new Error(`OpenRouter API error ${res.status}: ${errorText}`);
							Object.assign(err, { status: res.status });
							throw err;
						}
					}

					if (!res.body) {
						throw new Error('No response body returned from OpenRouter API');
					}

					const reader = res.body.getReader();
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

					console.error('[OpenRouterClient] Fetch error on attempt', attempt, 'for model', currentModel, ':', {
						message: lastError.message,
						type: lastError.constructor.name,
						fullError: lastError,
					});

					// If it's a 4xx error that is not 429, don't retry this model
					const status = (err as Record<string, unknown>).status;
					if (typeof status === 'number' && status >= 400 && status < 500 && status !== 429) {
						throw new Error(`[OpenRouterClient] Network or API error: ${lastError.message}`, { cause: err });
					}

					if (attempt < this.maxRetries) {
						// Exponential backoff
						const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
						console.log('[OpenRouterClient] Retrying stream in', delay, 'ms...');
						await this.sleep(delay);
					}
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

		const modelsToTry = [payload.model];
		if (FALLBACK_MODELS[payload.model]) {
			modelsToTry.push(...FALLBACK_MODELS[payload.model]);
		}

		let lastError: Error | null = null;

		for (const currentModel of modelsToTry) {
			let attempt = 0;
			
			while (attempt < this.maxRetries) {
				attempt++;
				try {
					const res = await fetch(this.apiUrl, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${apiKey}`,
							'HTTP-Referer': 'http://localhost:5173', // Adjust this with dynamic url if available
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
						const isRetryable = res.status === 429 || res.status >= 500;

						if (isRetryable) {
							throw new Error(`OpenRouter API error ${res.status}: ${errorText}`);
						} else {
							// For 4xx (except 429), don't retry same model
							const err = new Error(`OpenRouter API error ${res.status}: ${errorText}`);
							Object.assign(err, { status: res.status });
							throw err;
						}
					}

					const data = await res.json();
					const text = data.choices[0]?.message?.content || '';

					return {
						text,
						model: data.model || currentModel,
						tokensUsed: data.usage?.total_tokens || 0,
					};
				} catch (err: unknown) {
					lastError = err instanceof Error ? err : new Error(String(err));

					console.error('[OpenRouterClient] Complete error on attempt', attempt, 'for model', currentModel, ':', {
						message: lastError.message,
						type: lastError.constructor.name,
					});

					// If it's a 4xx error that is not 429, don't retry this model
					const status = (err as Record<string, unknown>).status;
					if (typeof status === 'number' && status >= 400 && status < 500 && status !== 429) {
						throw new Error(`[OpenRouterClient] Network or API error: ${lastError.message}`, { cause: err });
					}

					if (attempt < this.maxRetries) {
						// Exponential backoff
						const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
						console.log('[OpenRouterClient] Retrying complete in', delay, 'ms...');
						await this.sleep(delay);
					}
				}
			}
		}

		throw new Error(`[OpenRouterClient] All models/retries failed. Last error: ${lastError?.message}`, { cause: lastError });
	}
}
