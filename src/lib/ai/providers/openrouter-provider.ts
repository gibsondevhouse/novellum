import type {
	AiModel,
	AiProvider,
	AiProviderConfig,
	AiProviderFactory,
	CompletionRequest,
	CompletionResponse,
	StreamChunk,
	ValidateKeyResult,
} from './types.js';

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_APP_REFERER = 'http://localhost:5174';
const DEFAULT_APP_TITLE = 'Novellum';

/**
 * Strips any occurrence of the supplied API key from a string. Used for
 * defensive redaction on error paths so a misconfigured remote endpoint
 * cannot echo the key back into our logs.
 */
function redact(value: string, apiKey: string): string {
	if (!apiKey) return value;
	return value.split(apiKey).join('***REDACTED***');
}

function authHeaders(apiKey: string, referer: string, title: string): HeadersInit {
	return {
		Authorization: `Bearer ${apiKey}`,
		'HTTP-Referer': referer,
		'X-Title': title,
		'Content-Type': 'application/json',
	};
}

interface OpenRouterErrorBody {
	error?: { message?: string; code?: number };
}

async function readErrorMessage(response: Response): Promise<string> {
	try {
		const body = (await response.json()) as OpenRouterErrorBody;
		if (body?.error?.message) return body.error.message;
	} catch {
		/* fall through */
	}
	return `${response.status} ${response.statusText}`;
}

class OpenRouterProvider implements AiProvider {
	readonly providerId = 'openrouter';
	readonly displayName = 'OpenRouter';

	private readonly baseUrl: string;
	private readonly appReferer: string;
	private readonly appTitle: string;
	private readonly fetchImpl: typeof fetch;

	constructor(config: AiProviderConfig = {}) {
		this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
		this.appReferer = config.appReferer ?? DEFAULT_APP_REFERER;
		this.appTitle = config.appTitle ?? DEFAULT_APP_TITLE;
		this.fetchImpl = config.fetch ?? globalThis.fetch.bind(globalThis);
	}

	async validateKey(
		apiKey: string,
		options?: { signal?: AbortSignal },
	): Promise<ValidateKeyResult> {
		try {
			const response = await this.fetchImpl(`${this.baseUrl}/auth/key`, {
				method: 'GET',
				headers: authHeaders(apiKey, this.appReferer, this.appTitle),
				signal: options?.signal,
			});

			if (response.ok) {
				return { ok: true, verifiedAt: new Date().toISOString() };
			}
			if (response.status === 401 || response.status === 403) {
				return { ok: false, reason: 'invalid', message: 'Authentication failed.' };
			}
			if (response.status === 429) {
				return { ok: false, reason: 'rate_limited', message: 'Rate limited.' };
			}
			return {
				ok: false,
				reason: 'unknown',
				message: redact(await readErrorMessage(response), apiKey),
			};
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return { ok: false, reason: 'network_error', message: redact(message, apiKey) };
		}
	}

	async listModels(apiKey: string, options?: { signal?: AbortSignal }): Promise<AiModel[]> {
		const response = await this.fetchImpl(`${this.baseUrl}/models`, {
			method: 'GET',
			headers: authHeaders(apiKey, this.appReferer, this.appTitle),
			signal: options?.signal,
		});

		if (!response.ok) {
			const message = await readErrorMessage(response);
			throw new Error(redact(`OpenRouter listModels failed: ${message}`, apiKey));
		}

		const body = (await response.json()) as {
			data?: Array<{
				id: string;
				name?: string;
				context_length?: number;
				pricing?: { prompt?: string; completion?: string };
			}>;
		};

		return (body.data ?? []).map((m) => ({
			id: m.id,
			name: m.name ?? m.id,
			contextLength: m.context_length,
			pricing: m.pricing
				? { prompt: m.pricing.prompt, completion: m.pricing.completion }
				: undefined,
		}));
	}

	async complete(apiKey: string, request: CompletionRequest): Promise<CompletionResponse> {
		const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
			method: 'POST',
			headers: authHeaders(apiKey, this.appReferer, this.appTitle),
			body: JSON.stringify(this.buildBody(request, false)),
			signal: request.signal,
		});

		if (!response.ok) {
			const message = await readErrorMessage(response);
			throw new Error(redact(`OpenRouter complete failed: ${message}`, apiKey));
		}

		const body = (await response.json()) as {
			model?: string;
			choices?: Array<{
				message?: { content?: string };
				finish_reason?: CompletionResponse['finishReason'];
			}>;
			usage?: {
				prompt_tokens?: number;
				completion_tokens?: number;
				total_tokens?: number;
			};
		};

		const choice = body.choices?.[0];
		return {
			model: body.model ?? request.model,
			content: choice?.message?.content ?? '',
			finishReason: choice?.finish_reason ?? 'other',
			usage: body.usage
				? {
						promptTokens: body.usage.prompt_tokens,
						completionTokens: body.usage.completion_tokens,
						totalTokens: body.usage.total_tokens,
					}
				: undefined,
		};
	}

	async *stream(apiKey: string, request: CompletionRequest): AsyncIterable<StreamChunk> {
		const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
			method: 'POST',
			headers: authHeaders(apiKey, this.appReferer, this.appTitle),
			body: JSON.stringify(this.buildBody(request, true)),
			signal: request.signal,
		});

		if (!response.ok || !response.body) {
			const message = await readErrorMessage(response);
			yield {
				type: 'error',
				message: redact(`OpenRouter stream failed: ${message}`, apiKey),
				recoverable: false,
			};
			return;
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		let finishReason: CompletionResponse['finishReason'] = 'other';
		let usage: CompletionResponse['usage'] | undefined;

		try {
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });

				const events = buffer.split('\n\n');
				buffer = events.pop() ?? '';

				for (const raw of events) {
					const line = raw.trim();
					if (!line.startsWith('data:')) continue;
					const payload = line.slice(5).trim();
					if (payload === '[DONE]') {
						yield { type: 'done', finishReason, usage };
						return;
					}
					try {
						const parsed = JSON.parse(payload) as {
							choices?: Array<{
								delta?: { content?: string };
								finish_reason?: CompletionResponse['finishReason'];
							}>;
							usage?: {
								prompt_tokens?: number;
								completion_tokens?: number;
								total_tokens?: number;
							};
						};
						const delta = parsed.choices?.[0]?.delta?.content;
						if (delta) yield { type: 'delta', content: delta };
						if (parsed.choices?.[0]?.finish_reason) {
							finishReason = parsed.choices[0].finish_reason;
						}
						if (parsed.usage) {
							usage = {
								promptTokens: parsed.usage.prompt_tokens,
								completionTokens: parsed.usage.completion_tokens,
								totalTokens: parsed.usage.total_tokens,
							};
						}
					} catch {
						/* ignore malformed event */
					}
				}
			}
			yield { type: 'done', finishReason, usage };
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			yield {
				type: 'error',
				message: redact(message, apiKey),
				recoverable: err instanceof DOMException && err.name === 'AbortError',
			};
		} finally {
			reader.releaseLock?.();
		}
	}

	private buildBody(request: CompletionRequest, stream: boolean): Record<string, unknown> {
		const body: Record<string, unknown> = {
			model: request.model,
			messages: request.messages,
			stream,
		};
		if (request.temperature !== undefined) body.temperature = request.temperature;
		if (request.maxTokens !== undefined) body.max_tokens = request.maxTokens;
		if (request.topP !== undefined) body.top_p = request.topP;
		if (request.responseFormat) {
			body.response_format = {
				type: 'json_schema',
				json_schema: {
					name: request.responseFormat.jsonSchema.name,
					strict: request.responseFormat.jsonSchema.strict ?? true,
					schema: request.responseFormat.jsonSchema.schema,
				},
			};
		}
		return body;
	}
}

/** Default factory exposed through the barrel. */
export const createOpenRouterProvider: AiProviderFactory = (config) => new OpenRouterProvider(config);

export { OpenRouterProvider };
