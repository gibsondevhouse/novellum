/**
 * plan-023 stage-006 phase-001 — tool registry unit tests.
 *
 * Imports the registry directly (not through the module barrel) to
 * avoid auto-registering the stub tools at load time; we want full
 * control over what's in the registry per test.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
	registerTool,
	getTool,
	listTools,
	clearTools,
} from '$modules/nova/services/tool-registry.js';
import type { ToolDefinition, ToolHandler } from '$modules/nova/types.js';

const sampleDef: ToolDefinition = {
	id: 'sample.tool',
	description: 'A sample tool.',
	inputSchema: { type: 'object' },
};

const noopHandler: ToolHandler = async () => ({
	status: 'success',
	output: null,
});

describe('tool-registry', () => {
	beforeEach(() => {
		clearTools();
	});

	it('registerTool + getTool round-trip', () => {
		registerTool(sampleDef, noopHandler);
		const entry = getTool('sample.tool');
		expect(entry).toBeDefined();
		expect(entry?.definition).toEqual(sampleDef);
		expect(entry?.handler).toBe(noopHandler);
	});

	it('getTool returns undefined for unknown ids', () => {
		expect(getTool('does.not.exist')).toBeUndefined();
	});

	it('listTools returns the definitions of all registered tools', () => {
		registerTool(sampleDef, noopHandler);
		registerTool({ ...sampleDef, id: 'sample.other' }, noopHandler);
		const ids = listTools().map((d) => d.id).sort();
		expect(ids).toEqual(['sample.other', 'sample.tool']);
	});

	it('double-register replaces the previous definition + handler', () => {
		registerTool(sampleDef, noopHandler);
		const newHandler: ToolHandler = async () => ({ status: 'error', error: 'boom' });
		const newDef = { ...sampleDef, description: 'Updated.' };
		registerTool(newDef, newHandler);
		const entry = getTool('sample.tool');
		expect(entry?.definition.description).toBe('Updated.');
		expect(entry?.handler).toBe(newHandler);
		expect(listTools()).toHaveLength(1);
	});

	it('clearTools empties the registry', () => {
		registerTool(sampleDef, noopHandler);
		expect(listTools()).toHaveLength(1);
		clearTools();
		expect(listTools()).toHaveLength(0);
		expect(getTool('sample.tool')).toBeUndefined();
	});
});
