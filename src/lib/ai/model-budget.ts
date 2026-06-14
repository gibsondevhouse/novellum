/**
 * Model Budget Tracking
 *
 * Estimates token counts and cost before agent runs, then reconciles
 * against provider-reported usage after completion. Budget estimates
 * and provider-reported values are stored in separate fields so
 * discrepancies are auditable.
 *
 * plan-049 stage-004 phase-001 part-001
 */

import type { ModelCapabilities } from './model-capabilities.js';

// ── Token Estimation ─────────────────────────────────────────────────────────

/**
 * Characters-per-token approximation used before a live count is available.
 * OpenAI/Anthropic models average ~4 chars per token for English prose.
 * This constant is intentionally conservative (3.5) to avoid underestimating.
 */
export const CHARS_PER_TOKEN_ESTIMATE = 3.5;

/**
 * Estimates the token count for a text string using a simple character
 * ratio heuristic. Suitable for pre-run budget checks; not a replacement
 * for tokenizer-based counts.
 */
export function estimateTokens(text: string): number {
	if (!text) return 0;
	return Math.ceil(text.length / CHARS_PER_TOKEN_ESTIMATE);
}

/**
 * Estimates tokens for a list of completion messages (role+content pairs).
 * Adds a small fixed overhead per message to approximate real tokenization.
 */
export function estimateMessagesTokens(
	messages: Array<{ role: string; content: string }>,
): number {
	// 4 overhead tokens per message (role, separator, special tokens)
	const MESSAGE_OVERHEAD = 4;
	return messages.reduce((sum, m) => sum + estimateTokens(m.content) + MESSAGE_OVERHEAD, 0);
}

// ── Cost Estimation ──────────────────────────────────────────────────────────

/**
 * Pre-run cost estimate.
 */
export interface BudgetEstimate {
	modelId: string;
	estimatedPromptTokens: number;
	estimatedCompletionTokens: number;
	estimatedTotalTokens: number;
	/** Cost estimate in USD. Null when the model has no cost hints. */
	estimatedCostUsd: number | null;
}

/**
 * Produces a pre-run cost estimate from prompt text and an expected
 * completion length hint. Uses capability cost hints; returns `null`
 * cost when cost metadata is unavailable.
 *
 * @param caps        - Model capability record from the registry.
 * @param promptText  - Full prompt text (or concatenated message content).
 * @param expectedCompletionTokens - Expected output length in tokens.
 */
export function buildBudgetEstimate(
	caps: ModelCapabilities,
	promptText: string,
	expectedCompletionTokens = 512,
): BudgetEstimate {
	const estimatedPromptTokens = estimateTokens(promptText);
	const estimatedTotalTokens = estimatedPromptTokens + expectedCompletionTokens;

	let estimatedCostUsd: number | null = null;
	if (caps.costHints?.promptUsdPerMToken !== undefined) {
		const promptCost = (estimatedPromptTokens / 1_000_000) * caps.costHints.promptUsdPerMToken;
		const completionCost = caps.costHints.completionUsdPerMToken
			? (expectedCompletionTokens / 1_000_000) * caps.costHints.completionUsdPerMToken
			: 0;
		estimatedCostUsd = promptCost + completionCost;
	}

	return {
		modelId: caps.modelId,
		estimatedPromptTokens,
		estimatedCompletionTokens: expectedCompletionTokens,
		estimatedTotalTokens,
		estimatedCostUsd,
	};
}

// ── Provider Usage Reconciliation ────────────────────────────────────────────

/**
 * Provider-reported token usage from a completion response.
 * Fields may be absent if the provider does not return them.
 */
export interface ProviderUsage {
	promptTokens?: number;
	completionTokens?: number;
	totalTokens?: number;
}

/**
 * Reconciled usage record combining pre-run estimates and post-run actuals.
 * Stored in `agent_usage` rows; never overwrites the estimate fields.
 */
export interface ReconciledUsage {
	modelId: string;
	providerId: string;
	/** Estimated values (characters derived). */
	estimatedPromptTokens: number;
	estimatedCompletionTokens: number;
	estimatedTotalTokens: number;
	estimatedCostUsd: number | null;
	/** Actuals from provider response (may be null if not returned). */
	providerPromptTokens: number | null;
	providerCompletionTokens: number | null;
	providerTotalTokens: number | null;
	/**
	 * Variance ratio between estimate and actual total tokens.
	 * Positive = underestimated. Null when actuals are unavailable.
	 */
	varianceRatio: number | null;
}

/**
 * Reconciles a pre-run budget estimate with provider-reported usage.
 * Both are preserved; the variance ratio enables calibration over time.
 */
export function reconcileUsage(
	estimate: BudgetEstimate,
	providerId: string,
	providerUsage: ProviderUsage,
): ReconciledUsage {
	const providerTotal = providerUsage.totalTokens ?? null;
	const varianceRatio =
		providerTotal !== null && estimate.estimatedTotalTokens > 0
			? (providerTotal - estimate.estimatedTotalTokens) / estimate.estimatedTotalTokens
			: null;

	return {
		modelId: estimate.modelId,
		providerId,
		estimatedPromptTokens: estimate.estimatedPromptTokens,
		estimatedCompletionTokens: estimate.estimatedCompletionTokens,
		estimatedTotalTokens: estimate.estimatedTotalTokens,
		estimatedCostUsd: estimate.estimatedCostUsd,
		providerPromptTokens: providerUsage.promptTokens ?? null,
		providerCompletionTokens: providerUsage.completionTokens ?? null,
		providerTotalTokens: providerTotal,
		varianceRatio,
	};
}

// ── Context Window Budget Guard ───────────────────────────────────────────────

export interface ContextWindowGuardResult {
	fits: boolean;
	estimatedPromptTokens: number;
	contextLengthTokens: number;
	/** Headroom remaining for completion after prompt. */
	headroomTokens: number;
}

/**
 * Checks whether an estimated prompt fits within the model's context window,
 * leaving at least `reservedForCompletion` tokens for output.
 */
export function checkContextWindowBudget(
	caps: ModelCapabilities,
	estimatedPromptTokens: number,
	reservedForCompletion = 1024,
): ContextWindowGuardResult {
	const contextLengthTokens = caps.contextLengthTokens;
	// If context length is unknown (0), we cannot reject — fail open.
	if (contextLengthTokens === 0) {
		return {
			fits: true,
			estimatedPromptTokens,
			contextLengthTokens: 0,
			headroomTokens: 0,
		};
	}
	const headroomTokens = contextLengthTokens - estimatedPromptTokens - reservedForCompletion;
	return {
		fits: headroomTokens >= 0,
		estimatedPromptTokens,
		contextLengthTokens,
		headroomTokens: Math.max(0, headroomTokens),
	};
}
