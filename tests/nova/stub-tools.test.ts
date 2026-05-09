import { describe, it, expect, beforeEach } from 'vitest';
import {
	STUB_TOOLS,
	registerStubTools,
} from '$modules/nova/services/stub-tools.js';
import {
	listTools,
	getTool,
	clearTools,
} from '$modules/nova/services/tool-registry.js';
import { dispatchTool } from '$modules/nova/services/tool-router.js';

const EXPECTED_IDS = [
	'worldbuilding.create-character',
	'worldbuilding.update-location',
	'continuity.scan-scene',
	'outline.suggest-beat',
] as const;

describe('stub-tools', () => {
	beforeEach(() => {
		clearTools();
	});

	it('STUB_TOOLS exports the four expected tool ids', () => {
		expect(STUB_TOOLS.map((d) => d.id).sort()).toEqual([...EXPECTED_IDS].sort());
	});

	it('registerStubTools populates the registry with all four ids', () => {
		registerStubTools();
		const ids = listTools().map((d) => d.id).sort();
		expect(ids).toEqual([...EXPECTED_IDS].sort());
	});

	it.each(EXPECTED_IDS)(
		'each stub handler returns not-yet-supported with output=null and a message containing the tool id: %s',
		async (toolId) => {
			registerStubTools();
			const entry = getTool(toolId);
			expect(entry).toBeDefined();
			const result = await entry!.handler({
				invocationId: 'inv-1',
				toolId,
				input: {},
				requestedAt: new Date().toISOString(),
			});
			expect(result.status).toBe('not-yet-supported');
			expect(result.output).toBeNull();
			expect(result.error).toContain(toolId);
			expect(result.error).toContain('not yet implemented');
		},
	);

	it('dispatchTool surfaces not-yet-supported through the router for stub tools', async () => {
		registerStubTools();
		const result = await dispatchTool({
			invocationId: 'inv-2',
			toolId: 'continuity.scan-scene',
			input: { sceneId: 's-1' },
			requestedAt: new Date().toISOString(),
		});
		expect(result.status).toBe('not-yet-supported');
		expect(result.output).toBeNull();
		expect(result.error).toContain('continuity.scan-scene');
	});

	it('every stub definition declares a JSONSchema-shaped inputSchema', () => {
		for (const def of STUB_TOOLS) {
			expect(def.inputSchema).toBeTypeOf('object');
			expect((def.inputSchema as { type?: string }).type).toBe('object');
			expect(typeof def.description).toBe('string');
			expect(def.description.length).toBeGreaterThan(0);
		}
	});
});
