/**
 * Ollama provider — local-first AI integration.
 *
 * Talks to the Ollama HTTP server (default `http://127.0.0.1:11434`).
 * No API key is required — `validateKey` ignores its first argument
 * and instead performs a connectivity check against `/api/tags`.
 *
 * Reference: https://github.com/ollama/ollama/blob/main/docs/api.md
 */

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

const DEFAULT_BASE_URL = 'http://127.0.0.1:11434';

interface OllamaTagsResponse {
	models?: Array<{
		name: string;
		size?: number;
		details?: { parameter_size?: string; family?: string };
	}>;
}

interface OllamaChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface OllamaChatResponse {
	model?: string;
	message?: OllamaChatMessage;
	done?: boolean;
	done_reason?: string;
	prompt_eval_count?: number;
	eval_count?: number;
}

class OllamaProvider implements AiProvider {
	readonly providerId = 'ollama';
	readonly displayName = 'Ollama';

	private readonly baseUrl: string;
	private readonly fetchImpl: typeof fetch;

	constructor(config: AiProviderConfig = {}) {
		this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
		this.fetchImpl = config.fetch ?? globalThis.fetch.bind(globalThis);
	}

	/**
	 * "Validate" the Ollama connection. The `apiKey` argument is unused;
	 * we hit `/api/tags` to confirm the daemon is reachable and the host
	 * is who we expect.
	 */
	async validateKey(
		_apiKey: string,
		options?: { signal?: AbortSignal },
	): Promise<ValidateKeyResult> {
		try {
			const response = await this.fetchImpl(`${this.baseUrl}/api/tags`, {
				method: 'GET',
				signal: options?.signal,
			});
			if (response.ok) {
				return { ok: true, verifiedAt: new Date().toISOString() };
			}
			return {
				ok: false,
				reason: 'unknown',
				message: `${response.status} ${response.statusText}`,
			};
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return { ok: false, reason: 'network_error', message };
		}
	}

	async listModels(_apiKey: string, options?: { signal?: AbortSignal }): Promise<AiModel[]> {
		const response = await this.fetchImpl(`${this.baseUrl}/api/tags`, {
			method: 'GET',
			signal: options?.signal,
		});
		if (!response.ok) {
			throw new Error(`Ollama listModels failed: ${response.status} ${response.statusText}`);
		}
		const body = (await response.json()) as OllamaTagsResponse;
		return (body.models ?? []).map((m) => ({
			id: m.name,
			name: m.details?.family ? `${m.name} (${m.details.family})` : m.name,
		}));
	}

	async complete(_apiKey: string, request: CompletionRequest): Promise<CompletionResponse> {
		const response = await this.fetchImpl(`${this.baseUrl}/api/chat`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(this.buildBody(request, false)),
			signal: request.signal,
		});
		if (!response.ok) {
			throw new Error(`Ollama complete failed: ${response.status} ${response.statusText}`);
		}
		const body = (await response.json()) as OllamaChatResponse;
		return {
			model: body.model ?? request.model,
			content: body.message?.content ?? '',
			finishReason: mapFinishReason(body.done_reason),
			usage: {
				promptTokens: body.prompt_eval_count,
				completionTokens: body.eval_count,
				totalTokens:
					(body.prompt_eval_count ?? 0) + (body.eval_count ?? 0) || undefined,
			},
		};
	}

	async *stream(
		_apiKey: string,
		request: CompletionRequest,
	): AsyncIterable<StreamChunk> {
		const response = await this.fetchImpl(`${this.baseUrl}/api/chat`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(this.buildBody(request, true)),
			signal: request.signal,
		});

		if (!response.ok || !response.body) {
			yield {
				type: 'error',
				message: `Ollama stream failed: ${response.status} ${response.statusText}`,
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

				// Ollama emits one JSON object per line.
				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';

				for (const raw of lines) {
					const line = raw.trim();
					if (!line) continue;
					try {
						const parsed = JSON.parse(line) as OllamaChatResponse;
						const delta = parsed.message?.content;
						if (delta) yield { type: 'delta', content: delta };
						if (parsed.done) {
							finishReason = mapFinishReason(parsed.done_reason);
							usage = {
								promptTokens: parsed.prompt_eval_count,
								completionTokens: parsed.eval_count,
								totalTokens:
									(parsed.prompt_eval_count ?? 0) + (parsed.eval_count ?? 0) ||
									undefined,
							};
						}
					} catch {
						/* ignore malformed line */
					}
				}
			}
			yield { type: 'done', finishReason, usage };
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			yield {
				type: 'error',
				message,
				recoverable: err instanceof DOMException && err.name === 'AbortError',
			};
		} finally {
			reader.releaseLock?.();
		}
	}

	private buildBody(request: CompletionRequest, stream: boolean): Record<string, unknown> {
		const options: Record<string, unknown> = {};
		if (request.temperature !== undefined) options.temperature = request.temperature;
		if (request.maxTokens !== undefined) options.num_predict = request.maxTokens;
		if (request.topP !== undefined) options.top_p = request.topP;

		const body: Record<string, unknown> = {
			model: request.model,
			messages: request.messages,
			stream,
		};
		if (Object.keys(options).length > 0) body.options = options;
		// Structured outputs: Ollama supports `format: 'json'` (or a JSON
		// schema since v0.5+). We forward the schema when present.
		if (request.responseFormat) {
			body.format = request.responseFormat.jsonSchema.schema;
		}
		return body;
	}
}

function mapFinishReason(reason: string | undefined): CompletionResponse['finishReason'] {
	if (reason === 'stop') return 'stop';
	if (reason === 'length') return 'length';
	return 'other';
}

/** Default factory exposed through the barrel. */
export const createOllamaProvider: AiProviderFactory = (config) => new OllamaProvider(config);

export { OllamaProvider, DEFAULT_BASE_URL as OLLAMA_DEFAULT_BASE_URL };
