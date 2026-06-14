/**
 * Model Capability Registry
 *
 * Defines per-model capability metadata (tool support, JSON schema output,
 * streaming, context length, provider, cost hints) and task requirement
 * validation. Extends—does not replace—the existing provider abstraction.
 *
 * plan-049 stage-004 phase-001 part-001
 */

import type { TaskType } from './types.js';

// ── Capability Flags ─────────────────────────────────────────────────────────

/**
 * Capabilities a model may or may not support.
 * All flags default to `false` when absent.
 */
export interface ModelCapabilities {
	/** Model id, must match what the provider expects in completion requests. */
	modelId: string;
	/** Stable provider identifier, e.g. 'openrouter' or 'ollama'. */
	providerId: string;
	/** Human-readable label used in diagnostics and UI. */
	displayName: string;
	/** Supports function/tool calling (OpenAI-style `tools` array). */
	toolCalling: boolean;
	/** Supports `response_format: { type: "json_schema", ... }`. */
	jsonSchemaOutput: boolean;
	/** Supports token-by-token streaming. */
	streaming: boolean;
	/** Maximum context window in tokens. 0 means unknown. */
	contextLengthTokens: number;
	/**
	 * Confidence in the capability data.
	 * - 'verified' — confirmed by provider docs or live call.
	 * - 'inferred' — derived from model family / version patterns.
	 * - 'unknown'  — no reliable data available.
	 */
	capabilityConfidence: 'verified' | 'inferred' | 'unknown';
	/**
	 * Cost hints in USD per million tokens. May be missing for local
	 * models or providers that do not publish pricing.
	 */
	costHints?: {
		promptUsdPerMToken?: number;
		completionUsdPerMToken?: number;
	};
	/** ISO-8601 timestamp of when this record was last updated. */
	lastUpdatedAt: string;
}

// ── Task Requirements ────────────────────────────────────────────────────────

/**
 * Capability requirements for a given task.
 * Any field left `undefined` means "no constraint on that capability".
 */
export interface TaskCapabilityRequirements {
	requireToolCalling?: boolean;
	requireJsonSchemaOutput?: boolean;
	requireStreaming?: boolean;
	/** Minimum context window in tokens the model must support. */
	minContextLengthTokens?: number;
}

// ── Validation Result ────────────────────────────────────────────────────────

export type CapabilityCheckResult =
	| { ok: true }
	| { ok: false; reasons: string[] };

/**
 * Checks whether a model's capabilities satisfy the given task requirements.
 */
export function checkModelCapabilities(
	capabilities: ModelCapabilities,
	requirements: TaskCapabilityRequirements,
): CapabilityCheckResult {
	const reasons: string[] = [];

	if (requirements.requireToolCalling && !capabilities.toolCalling) {
		reasons.push(`model '${capabilities.modelId}' does not support tool calling`);
	}
	if (requirements.requireJsonSchemaOutput && !capabilities.jsonSchemaOutput) {
		reasons.push(`model '${capabilities.modelId}' does not support JSON schema output`);
	}
	if (requirements.requireStreaming && !capabilities.streaming) {
		reasons.push(`model '${capabilities.modelId}' does not support streaming`);
	}
	if (
		requirements.minContextLengthTokens !== undefined &&
		capabilities.contextLengthTokens > 0 &&
		capabilities.contextLengthTokens < requirements.minContextLengthTokens
	) {
		reasons.push(
			`model '${capabilities.modelId}' context window (${capabilities.contextLengthTokens}) ` +
				`is below required minimum (${requirements.minContextLengthTokens})`,
		);
	}

	return reasons.length === 0 ? { ok: true } : { ok: false, reasons };
}

// ── Built-in Registry ────────────────────────────────────────────────────────

const REGISTRY_UPDATED = '2026-06-14T00:00:00Z';

/**
 * Built-in capability records for models referenced in constants.ts.
 * Extend this when adding new default models.
 *
 * Values are based on publicly available provider documentation.
 * Set `capabilityConfidence: 'inferred'` when derived from model family.
 */
const BUILT_IN_CAPABILITIES: ModelCapabilities[] = [
	// ── OpenAI via OpenRouter ─────────────────────────────────────────────
	{
		modelId: 'openai/gpt-4o',
		providerId: 'openrouter',
		displayName: 'GPT-4o',
		toolCalling: true,
		jsonSchemaOutput: true,
		streaming: true,
		contextLengthTokens: 128_000,
		capabilityConfidence: 'verified',
		costHints: { promptUsdPerMToken: 2.5, completionUsdPerMToken: 10.0 },
		lastUpdatedAt: REGISTRY_UPDATED,
	},
	{
		modelId: 'openai/gpt-4o-mini',
		providerId: 'openrouter',
		displayName: 'GPT-4o Mini',
		toolCalling: true,
		jsonSchemaOutput: true,
		streaming: true,
		contextLengthTokens: 128_000,
		capabilityConfidence: 'verified',
		costHints: { promptUsdPerMToken: 0.15, completionUsdPerMToken: 0.6 },
		lastUpdatedAt: REGISTRY_UPDATED,
	},
	// ── Google Gemini via OpenRouter ──────────────────────────────────────
	{
		modelId: 'google/gemini-3.1-flash-lite-preview',
		providerId: 'openrouter',
		displayName: 'Gemini 3.1 Flash Lite',
		toolCalling: true,
		jsonSchemaOutput: true,
		streaming: true,
		contextLengthTokens: 1_000_000,
		capabilityConfidence: 'inferred',
		costHints: { promptUsdPerMToken: 0.075, completionUsdPerMToken: 0.3 },
		lastUpdatedAt: REGISTRY_UPDATED,
	},
	{
		modelId: 'google/gemini-flash-1.5',
		providerId: 'openrouter',
		displayName: 'Gemini Flash 1.5',
		toolCalling: true,
		jsonSchemaOutput: true,
		streaming: true,
		contextLengthTokens: 1_000_000,
		capabilityConfidence: 'inferred',
		costHints: { promptUsdPerMToken: 0.075, completionUsdPerMToken: 0.3 },
		lastUpdatedAt: REGISTRY_UPDATED,
	},
	// ── Anthropic via OpenRouter ──────────────────────────────────────────
	{
		modelId: 'anthropic/claude-3.5-sonnet',
		providerId: 'openrouter',
		displayName: 'Claude 3.5 Sonnet',
		toolCalling: true,
		jsonSchemaOutput: false,
		streaming: true,
		contextLengthTokens: 200_000,
		capabilityConfidence: 'verified',
		costHints: { promptUsdPerMToken: 3.0, completionUsdPerMToken: 15.0 },
		lastUpdatedAt: REGISTRY_UPDATED,
	},
	{
		modelId: 'anthropic/claude-3-haiku',
		providerId: 'openrouter',
		displayName: 'Claude 3 Haiku',
		toolCalling: true,
		jsonSchemaOutput: false,
		streaming: true,
		contextLengthTokens: 200_000,
		capabilityConfidence: 'verified',
		costHints: { promptUsdPerMToken: 0.25, completionUsdPerMToken: 1.25 },
		lastUpdatedAt: REGISTRY_UPDATED,
	},
];

// ── Registry ─────────────────────────────────────────────────────────────────

/** Runtime-mutable registry. Starts with built-ins; callers may register extras. */
const registry = new Map<string, ModelCapabilities>(
	BUILT_IN_CAPABILITIES.map((c) => [c.modelId, c]),
);

/**
 * Returns the capability record for `modelId`, or `undefined` if unknown.
 */
export function getModelCapabilities(modelId: string): ModelCapabilities | undefined {
	return registry.get(modelId);
}

/**
 * Returns a stub `unknown` record when the model is not in the registry.
 * Useful as a safe fallback that makes all capability checks pass (conservative).
 */
export function getModelCapabilitiesOrUnknown(modelId: string): ModelCapabilities {
	return (
		registry.get(modelId) ?? {
			modelId,
			providerId: 'unknown',
			displayName: modelId,
			toolCalling: false,
			jsonSchemaOutput: false,
			streaming: false,
			contextLengthTokens: 0,
			capabilityConfidence: 'unknown',
			lastUpdatedAt: new Date().toISOString(),
		}
	);
}

/**
 * Registers or replaces a capability record (e.g. from a provider catalog response).
 */
export function registerModelCapabilities(capabilities: ModelCapabilities): void {
	registry.set(capabilities.modelId, capabilities);
}

/**
 * Returns all currently registered capability records.
 */
export function listRegisteredModels(): ModelCapabilities[] {
	return Array.from(registry.values());
}

// ── Task Requirement Map ─────────────────────────────────────────────────────

/**
 * Default capability requirements per task type.
 * Only tasks with real constraints are listed; unlisted tasks have no requirements.
 */
const TASK_REQUIREMENTS: Partial<Record<TaskType, TaskCapabilityRequirements>> = {
	agent: { requireToolCalling: true },
	pipeline: { requireJsonSchemaOutput: true },
	continuity_check: { requireJsonSchemaOutput: false }, // JSON via prompt, not schema API
	edit: { requireJsonSchemaOutput: false },
	style_check: { requireJsonSchemaOutput: false },
};

/**
 * Returns the capability requirements for a task type, or an empty object
 * if the task has no declared requirements.
 */
export function getTaskRequirements(taskType: TaskType): TaskCapabilityRequirements {
	return TASK_REQUIREMENTS[taskType] ?? {};
}

/**
 * Validates that `modelId` meets the requirements for `taskType`.
 *
 * Returns `{ ok: true }` when the model is unknown (fails open — explainable
 * errors are the responsibility of the caller inspecting the result).
 */
export function validateModelForTask(
	modelId: string,
	taskType: TaskType,
): CapabilityCheckResult {
	const caps = registry.get(modelId);
	if (!caps) return { ok: true }; // unknown model: fail open, caller decides
	const requirements = getTaskRequirements(taskType);
	return checkModelCapabilities(caps, requirements);
}
