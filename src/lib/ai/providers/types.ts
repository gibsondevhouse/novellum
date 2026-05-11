/**
 * Canonical AI provider abstraction.
 *
 * Every vendor integration (OpenRouter, Ollama, Anthropic, OpenAI, ...) must
 * implement {@link AiProvider}. Providers are intentionally stateless and
 * **must not** read API keys from any ambient store: every method that
 * contacts the network takes the API key as an explicit argument.
 *
 * Credential look-up is the responsibility of the credential service
 * (`src/lib/server/credentials/credential-service.ts`).
 */

/**
 * Information about a single model exposed by a provider.
 */
export interface AiModel {
	id: string;
	name: string;
	contextLength?: number;
	pricing?: {
		prompt?: string;
		completion?: string;
	};
}

/**
 * Result of a key validation request.
 *
 * Discriminated so callers can distinguish "your key is wrong" from
 * "the network is down" without parsing error strings.
 */
export type ValidateKeyResult =
	| { ok: true; verifiedAt: string }
	| { ok: false; reason: 'invalid' | 'rate_limited' | 'network_error' | 'unknown'; message: string };

export interface CompletionMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface CompletionRequest {
	model: string;
	messages: CompletionMessage[];
	temperature?: number;
	maxTokens?: number;
	topP?: number;
	/**
	 * Optional JSON-schema response format (OpenRouter / OpenAI compatible).
	 * Implementations that do not support structured outputs may ignore this.
	 */
	responseFormat?: {
		type: 'json_schema';
		jsonSchema: {
			name: string;
			strict?: boolean;
			schema: Record<string, unknown>;
		};
	};
	signal?: AbortSignal;
}

export interface CompletionResponse {
	model: string;
	content: string;
	finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'other';
	usage?: {
		promptTokens?: number;
		completionTokens?: number;
		totalTokens?: number;
	};
}

/**
 * One streamed event. Implementations should yield `delta` chunks during
 * generation and a single `done` event at the end.
 */
export type StreamChunk =
	| { type: 'delta'; content: string }
	| { type: 'done'; finishReason: CompletionResponse['finishReason']; usage?: CompletionResponse['usage'] }
	| {
			type: 'error';
			message: string;
			recoverable: boolean;
			/** Set when the upstream HTTP status is known (pre-stream failures). */
			status?: number;
			/** Set when the failure can be classified — used by the proxy to map onto the user-facing AppError code. */
			code?: AiProviderErrorCode;
	  };

export interface AiProvider {
	/** Stable identifier used by the credential store (e.g. `'openrouter'`). */
	readonly providerId: string;

	/** Human-readable name for UI surfaces. */
	readonly displayName: string;

	/**
	 * Verifies the supplied key by issuing a low-cost request against the
	 * provider. Must never throw on a 4xx / 5xx — failures are returned as
	 * {@link ValidateKeyResult} variants so callers do not need to inspect
	 * error messages.
	 */
	validateKey(apiKey: string, options?: { signal?: AbortSignal }): Promise<ValidateKeyResult>;

	/**
	 * Returns the catalogue of models offered by the provider for the given key.
	 */
	listModels(apiKey: string, options?: { signal?: AbortSignal }): Promise<AiModel[]>;

	/**
	 * Issues a non-streaming completion. Throws on transport errors; the error
	 * message **must not** include the supplied API key.
	 */
	complete(apiKey: string, request: CompletionRequest): Promise<CompletionResponse>;

	/**
	 * Streams completion events. The async iterator must be cancellable via
	 * `request.signal`.
	 */
	stream(apiKey: string, request: CompletionRequest): AsyncIterable<StreamChunk>;
}

/**
 * Optional config object passed to a provider factory. Vendors that need
 * extra configuration (custom base URL, app referer, etc.) declare a
 * vendor-specific extension of this type.
 */
export interface AiProviderConfig {
	/** Override the base URL — useful for self-hosted gateways. */
	baseUrl?: string;
	/** App identifier surfaced in the provider's `HTTP-Referer` / `X-Title`. */
	appReferer?: string;
	appTitle?: string;
	/** Override the global fetch implementation (testing). */
	fetch?: typeof fetch;
}

/**
 * Factory shape — providers expose a default factory so callers can swap
 * implementations behind the {@link AiProvider} interface.
 */
export type AiProviderFactory = (config?: AiProviderConfig) => AiProvider;

/**
 * Discriminator for provider failures that the proxy and the browser
 * client need to distinguish (so the UI can surface the right
 * user-friendly message from `error-map`).
 */
export type AiProviderErrorCode = 'invalid_key' | 'rate_limit' | 'provider_error';

/**
 * Typed error thrown by an {@link AiProvider}'s `complete` / `stream`
 * methods when the upstream vendor returns a 4xx / 5xx. The proxy
 * (`/api/ai`) maps these codes onto HTTP status + a structured error
 * body; the browser-side client (`OpenRouterClient`) maps the body
 * back onto the user-facing `AppError` codes
 * (`AI_INVALID_KEY`, `AI_RATE_LIMIT`).
 *
 * The `message` is the upstream provider's error text, with the
 * caller's API key already redacted by the implementation.
 */
export class AiProviderError extends Error {
	readonly code: AiProviderErrorCode;
	readonly status: number;

	constructor(code: AiProviderErrorCode, status: number, message: string) {
		super(message);
		this.name = 'AiProviderError';
		this.code = code;
		this.status = status;
	}
}
