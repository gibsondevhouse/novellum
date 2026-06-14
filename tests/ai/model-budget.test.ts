import { describe, it, expect } from 'vitest';
import {
	estimateTokens,
	estimateMessagesTokens,
	buildBudgetEstimate,
	reconcileUsage,
	checkContextWindowBudget,
	CHARS_PER_TOKEN_ESTIMATE,
} from '$lib/ai/model-budget.js';
import type { ModelCapabilities } from '$lib/ai/model-capabilities.js';

const CAPS_WITH_COST: ModelCapabilities = {
	modelId: 'test/model-with-cost',
	providerId: 'test',
	displayName: 'Test Model With Cost',
	toolCalling: true,
	jsonSchemaOutput: true,
	streaming: true,
	contextLengthTokens: 8_000,
	capabilityConfidence: 'verified',
	costHints: { promptUsdPerMToken: 1.0, completionUsdPerMToken: 4.0 },
	lastUpdatedAt: '2026-01-01T00:00:00Z',
};

const CAPS_NO_COST: ModelCapabilities = {
	...CAPS_WITH_COST,
	modelId: 'test/model-no-cost',
	costHints: undefined,
};

const CAPS_UNKNOWN_CONTEXT: ModelCapabilities = {
	...CAPS_WITH_COST,
	modelId: 'test/model-unknown-context',
	contextLengthTokens: 0,
};

describe('estimateTokens', () => {
	it('returns 0 for empty string', () => {
		expect(estimateTokens('')).toBe(0);
	});

	it('estimates token count proportional to character length', () => {
		const text = 'a'.repeat(350); // 100 tokens at 3.5 chars/token
		expect(estimateTokens(text)).toBe(100);
	});

	it('rounds up fractional tokens', () => {
		const text = 'a'.repeat(8); // 8 / 3.5 = 2.28 → 3
		expect(estimateTokens(text)).toBe(Math.ceil(8 / CHARS_PER_TOKEN_ESTIMATE));
	});
});

describe('estimateMessagesTokens', () => {
	it('returns 0 for empty message list', () => {
		expect(estimateMessagesTokens([])).toBe(0);
	});

	it('includes overhead per message', () => {
		const messages = [
			{ role: 'system', content: 'a'.repeat(350) },
			{ role: 'user', content: 'a'.repeat(350) },
		];
		const base = estimateTokens('a'.repeat(350));
		// 2 messages × (base + 4 overhead)
		expect(estimateMessagesTokens(messages)).toBe((base + 4) * 2);
	});
});

describe('buildBudgetEstimate', () => {
	it('estimates cost when cost hints are available', () => {
		const estimate = buildBudgetEstimate(CAPS_WITH_COST, 'a'.repeat(700_000), 512);
		// 700k chars / 3.5 = 200k prompt tokens
		// cost = (200k/1M) * 1.0 + (512/1M) * 4.0
		const expectedCost = (200_000 / 1_000_000) * 1.0 + (512 / 1_000_000) * 4.0;
		expect(estimate.estimatedCostUsd).toBeCloseTo(expectedCost, 5);
	});

	it('returns null cost when cost hints are absent', () => {
		const estimate = buildBudgetEstimate(CAPS_NO_COST, 'hello world', 512);
		expect(estimate.estimatedCostUsd).toBeNull();
	});

	it('includes model id in the estimate', () => {
		const estimate = buildBudgetEstimate(CAPS_WITH_COST, 'test', 100);
		expect(estimate.modelId).toBe('test/model-with-cost');
	});

	it('uses default 512 completion tokens when not specified', () => {
		const estimate = buildBudgetEstimate(CAPS_WITH_COST, 'test');
		expect(estimate.estimatedCompletionTokens).toBe(512);
	});

	it('total tokens equals prompt + completion', () => {
		const estimate = buildBudgetEstimate(CAPS_WITH_COST, 'a'.repeat(350), 200);
		expect(estimate.estimatedTotalTokens).toBe(
			estimate.estimatedPromptTokens + estimate.estimatedCompletionTokens,
		);
	});
});

describe('reconcileUsage', () => {
	it('preserves estimate values alongside provider actuals', () => {
		const estimate = buildBudgetEstimate(CAPS_WITH_COST, 'a'.repeat(350), 200);
		const reconciled = reconcileUsage(estimate, 'openrouter', {
			promptTokens: 95,
			completionTokens: 210,
			totalTokens: 305,
		});

		expect(reconciled.estimatedPromptTokens).toBe(estimate.estimatedPromptTokens);
		expect(reconciled.providerPromptTokens).toBe(95);
		expect(reconciled.providerCompletionTokens).toBe(210);
		expect(reconciled.providerTotalTokens).toBe(305);
	});

	it('calculates variance ratio correctly', () => {
		const estimate = buildBudgetEstimate(CAPS_WITH_COST, 'a'.repeat(350), 100);
		// estimatedTotal = 100 + 100 = 200; actual = 250 → ratio = (250 - 200) / 200 = 0.25
		const reconciled = reconcileUsage(estimate, 'openrouter', { totalTokens: 250 });
		expect(reconciled.varianceRatio).toBeCloseTo(
			(250 - estimate.estimatedTotalTokens) / estimate.estimatedTotalTokens,
			5,
		);
	});

	it('sets variance to null when provider total is not reported', () => {
		const estimate = buildBudgetEstimate(CAPS_WITH_COST, 'test', 100);
		const reconciled = reconcileUsage(estimate, 'openrouter', {});
		expect(reconciled.varianceRatio).toBeNull();
		expect(reconciled.providerTotalTokens).toBeNull();
	});

	it('stores the provider id', () => {
		const estimate = buildBudgetEstimate(CAPS_WITH_COST, 'test', 100);
		const reconciled = reconcileUsage(estimate, 'openrouter', { totalTokens: 100 });
		expect(reconciled.providerId).toBe('openrouter');
	});
});

describe('checkContextWindowBudget', () => {
	it('returns fits:true when prompt fits in context window', () => {
		const result = checkContextWindowBudget(CAPS_WITH_COST, 5_000, 1_024);
		expect(result.fits).toBe(true);
		expect(result.headroomTokens).toBe(8_000 - 5_000 - 1_024);
	});

	it('returns fits:false when prompt exceeds context window', () => {
		const result = checkContextWindowBudget(CAPS_WITH_COST, 8_000, 1_024);
		expect(result.fits).toBe(false);
		expect(result.headroomTokens).toBe(0);
	});

	it('returns fits:true when context length is unknown (0)', () => {
		const result = checkContextWindowBudget(CAPS_UNKNOWN_CONTEXT, 999_999, 1_024);
		expect(result.fits).toBe(true);
		expect(result.contextLengthTokens).toBe(0);
	});

	it('includes prompt and context length in result', () => {
		const result = checkContextWindowBudget(CAPS_WITH_COST, 3_000, 512);
		expect(result.estimatedPromptTokens).toBe(3_000);
		expect(result.contextLengthTokens).toBe(8_000);
	});
});
