import { describe, it, expect, beforeEach } from 'vitest';
import {
	checkModelCapabilities,
	getModelCapabilities,
	getModelCapabilitiesOrUnknown,
	registerModelCapabilities,
	listRegisteredModels,
	validateModelForTask,
	getTaskRequirements,
	type ModelCapabilities,
} from '$lib/ai/model-capabilities.js';

const STUB_CAPS: ModelCapabilities = {
	modelId: 'test/stub-model',
	providerId: 'test-provider',
	displayName: 'Stub Model',
	toolCalling: true,
	jsonSchemaOutput: true,
	streaming: true,
	contextLengthTokens: 8_000,
	capabilityConfidence: 'verified',
	lastUpdatedAt: '2026-01-01T00:00:00Z',
};

describe('checkModelCapabilities', () => {
	it('returns ok:true when all requirements are satisfied', () => {
		const result = checkModelCapabilities(STUB_CAPS, {
			requireToolCalling: true,
			requireJsonSchemaOutput: true,
			requireStreaming: true,
			minContextLengthTokens: 4_000,
		});
		expect(result.ok).toBe(true);
	});

	it('returns ok:false when tool calling is required but absent', () => {
		const caps: ModelCapabilities = { ...STUB_CAPS, toolCalling: false };
		const result = checkModelCapabilities(caps, { requireToolCalling: true });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.length).toBeGreaterThan(0);
			expect(result.reasons[0]).toContain('tool calling');
		}
	});

	it('returns ok:false when JSON schema output is required but absent', () => {
		const caps: ModelCapabilities = { ...STUB_CAPS, jsonSchemaOutput: false };
		const result = checkModelCapabilities(caps, { requireJsonSchemaOutput: true });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons[0]).toContain('JSON schema');
		}
	});

	it('returns ok:false when streaming is required but absent', () => {
		const caps: ModelCapabilities = { ...STUB_CAPS, streaming: false };
		const result = checkModelCapabilities(caps, { requireStreaming: true });
		expect(result.ok).toBe(false);
	});

	it('returns ok:false when context window is below minimum', () => {
		const caps: ModelCapabilities = { ...STUB_CAPS, contextLengthTokens: 4_000 };
		const result = checkModelCapabilities(caps, { minContextLengthTokens: 8_000 });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons[0]).toContain('context window');
		}
	});

	it('ignores context window constraint when contextLengthTokens is 0 (unknown)', () => {
		const caps: ModelCapabilities = { ...STUB_CAPS, contextLengthTokens: 0 };
		const result = checkModelCapabilities(caps, { minContextLengthTokens: 8_000 });
		expect(result.ok).toBe(true);
	});

	it('accumulates multiple failure reasons', () => {
		const caps: ModelCapabilities = {
			...STUB_CAPS,
			toolCalling: false,
			jsonSchemaOutput: false,
		};
		const result = checkModelCapabilities(caps, {
			requireToolCalling: true,
			requireJsonSchemaOutput: true,
		});
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reasons.length).toBe(2);
		}
	});

	it('returns ok:true for empty requirements', () => {
		const result = checkModelCapabilities(STUB_CAPS, {});
		expect(result.ok).toBe(true);
	});
});

describe('model registry', () => {
	it('getModelCapabilities returns undefined for unknown models', () => {
		expect(getModelCapabilities('unknown/model-that-does-not-exist')).toBeUndefined();
	});

	it('getModelCapabilities returns built-in records for known models', () => {
		const caps = getModelCapabilities('openai/gpt-4o');
		expect(caps).toBeDefined();
		expect(caps?.toolCalling).toBe(true);
		expect(caps?.jsonSchemaOutput).toBe(true);
	});

	it('getModelCapabilitiesOrUnknown returns stub for unknown models', () => {
		const caps = getModelCapabilitiesOrUnknown('totally/unknown-model');
		expect(caps.modelId).toBe('totally/unknown-model');
		expect(caps.capabilityConfidence).toBe('unknown');
		expect(caps.toolCalling).toBe(false);
	});

	it('registerModelCapabilities adds a new record', () => {
		const customCaps: ModelCapabilities = {
			...STUB_CAPS,
			modelId: 'custom/test-model-registry',
		};
		registerModelCapabilities(customCaps);
		expect(getModelCapabilities('custom/test-model-registry')).toEqual(customCaps);
	});

	it('registerModelCapabilities replaces an existing record', () => {
		const v1: ModelCapabilities = { ...STUB_CAPS, modelId: 'custom/replace-test', contextLengthTokens: 4_000 };
		const v2: ModelCapabilities = { ...STUB_CAPS, modelId: 'custom/replace-test', contextLengthTokens: 8_000 };
		registerModelCapabilities(v1);
		registerModelCapabilities(v2);
		expect(getModelCapabilities('custom/replace-test')?.contextLengthTokens).toBe(8_000);
	});

	it('listRegisteredModels returns at least the built-in models', () => {
		const list = listRegisteredModels();
		const ids = list.map((c) => c.modelId);
		expect(ids).toContain('openai/gpt-4o');
		expect(ids).toContain('openai/gpt-4o-mini');
	});
});

describe('getTaskRequirements', () => {
	it('returns tool calling requirement for agent tasks', () => {
		const req = getTaskRequirements('agent');
		expect(req.requireToolCalling).toBe(true);
	});

	it('returns json schema requirement for pipeline tasks', () => {
		const req = getTaskRequirements('pipeline');
		expect(req.requireJsonSchemaOutput).toBe(true);
	});

	it('returns empty requirements for unconstrained tasks', () => {
		const req = getTaskRequirements('chat');
		expect(Object.keys(req).length).toBe(0);
	});
});

describe('validateModelForTask', () => {
	beforeEach(() => {
		registerModelCapabilities({
			...STUB_CAPS,
			modelId: 'test/no-tools',
			toolCalling: false,
			jsonSchemaOutput: true,
		});
		registerModelCapabilities({
			...STUB_CAPS,
			modelId: 'test/full-caps',
			toolCalling: true,
			jsonSchemaOutput: true,
		});
	});

	it('returns ok:true when model satisfies agent requirements', () => {
		const result = validateModelForTask('test/full-caps', 'agent');
		expect(result.ok).toBe(true);
	});

	it('returns ok:false when model lacks tool calling for agent task', () => {
		const result = validateModelForTask('test/no-tools', 'agent');
		expect(result.ok).toBe(false);
	});

	it('returns ok:true for unknown models (fail open)', () => {
		const result = validateModelForTask('totally/unknown-model', 'agent');
		expect(result.ok).toBe(true);
	});

	it('returns ok:true for tasks with no requirements', () => {
		const result = validateModelForTask('test/no-tools', 'chat');
		expect(result.ok).toBe(true);
	});
});
