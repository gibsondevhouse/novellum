/**
 * plan-023 stage-006 phase-001 — tool router (registry-driven) tests.
 *
 * Replaces the stage-004 stub assertions: dispatch now consults the
 * registry. We import the router and registry directly to bypass the
 * module-load `registerStubTools()` side effect.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { dispatchTool } from '$modules/nova/services/tool-router.js';
import {
	registerTool,
	clearTools,
} from '$modules/nova/services/tool-registry.js';
import type { ToolHandler, ToolInvocation } from '$modules/nova/types.js';

const baseInvocation = (overrides: Partial<ToolInvocation> = {}): ToolInvocation => ({
	invocationId: 'inv-1',
	toolId: 'sample.tool',
	input: { foo: 'bar' },
	requestedAt: new Date().toISOString(),
	...overrides,
});

describe('dispatchTool (registry-driven)', () => {
	beforeEach(() => {
		clearTools();
	});

	it('returns unimplemented when the tool id is not registered', async () => {
		const result = await dispatchTool(baseInvocation({ toolId: 'unknown.tool' }));
		expect(result.status).toBe('unimplemented');
		expect(result.invocationId).toBe('inv-1');
		expect(result.toolId).toBe('unknown.tool');
		expect(result.error).toContain('unknown.tool');
		expect(result.error).toContain('not registered');
	});

	it('runs the registered handler and wraps the partial result', async () => {
		const handler: ToolHandler = async () => ({
			status: 'success',
			output: { ok: true },
		});
		registerTool(
			{ id: 'sample.tool', description: 'x', inputSchema: {} },
			handler,
		);
		const result = await dispatchTool(baseInvocation());
		expect(result.status).toBe('success');
		expect(result.output).toEqual({ ok: true });
		expect(result.error).toBeUndefined();
		expect(result.invocationId).toBe('inv-1');
		expect(result.toolId).toBe('sample.tool');
	});

	it('preserves handler-returned not-yet-supported status', async () => {
		const handler: ToolHandler = async () => ({
			status: 'not-yet-supported',
			output: null,
			error: 'planned for plan-XXX',
		});
		registerTool(
			{ id: 'sample.tool', description: 'x', inputSchema: {} },
			handler,
		);
		const result = await dispatchTool(baseInvocation());
		expect(result.status).toBe('not-yet-supported');
		expect(result.output).toBeNull();
		expect(result.error).toContain('plan-XXX');
	});

	it('catches throwing handlers and returns status=error', async () => {
		const handler: ToolHandler = async () => {
			throw new Error('handler exploded');
		};
		registerTool(
			{ id: 'sample.tool', description: 'x', inputSchema: {} },
			handler,
		);
		const result = await dispatchTool(baseInvocation());
		expect(result.status).toBe('error');
		expect(result.error).toBe('handler exploded');
		expect(result.invocationId).toBe('inv-1');
	});

	it('reports a generic message when a handler throws a non-Error value', async () => {
		const handler: ToolHandler = async () => {
			throw 'string-thrown';
		};
		registerTool(
			{ id: 'sample.tool', description: 'x', inputSchema: {} },
			handler,
		);
		const result = await dispatchTool(baseInvocation());
		expect(result.status).toBe('error');
		expect(result.error).toBe('Unknown handler error.');
	});

	it('sets a valid ISO completedAt regardless of branch', async () => {
		const result = await dispatchTool(baseInvocation({ toolId: 'unknown.tool' }));
		expect(new Date(result.completedAt).toISOString()).toBe(result.completedAt);
	});
});
