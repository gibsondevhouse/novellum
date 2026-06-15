/**
 * plan-023 stage-006 phase-001 — Registry-driven tool dispatcher.
 *
 * Looks up the invoked tool in `tool-registry`. Registered → run the
 * handler and wrap the partial result; unregistered → return
 * `unimplemented`; handler throws → `error` with the throw message.
 */

import type { ToolInvocation, ToolResult } from '../types.js';
import { getTool } from './tool-registry.js';

interface DispatchToolOptions {
	allowMutationCommands?: boolean;
}

export async function dispatchTool(
	invocation: ToolInvocation,
	options: DispatchToolOptions = {},
): Promise<ToolResult> {
	const tool = getTool(invocation.toolId);
	if (!tool) {
		const result: ToolResult = {
			invocationId: invocation.invocationId,
			toolId: invocation.toolId,
			status: 'unimplemented',
			error: `Tool ${invocation.toolId} is not registered.`,
			completedAt: new Date().toISOString(),
		};
		return result;
	}
	if (tool.definition.capability === 'mutation_command' && options.allowMutationCommands !== true) {
		const result: ToolResult = {
			invocationId: invocation.invocationId,
			toolId: invocation.toolId,
			status: 'error',
			error: `Tool ${invocation.toolId} is a mutation command and cannot be dispatched from the model tool loop.`,
			completedAt: new Date().toISOString(),
		};
		return result;
	}
	try {
		const partial = await tool.handler(invocation);
		const result: ToolResult = {
			invocationId: invocation.invocationId,
			toolId: invocation.toolId,
			status: partial.status,
			output: partial.output,
			error: partial.error,
			completedAt: new Date().toISOString(),
		};
		return result;
	} catch (err) {
		const result: ToolResult = {
			invocationId: invocation.invocationId,
			toolId: invocation.toolId,
			status: 'error',
			error: err instanceof Error ? err.message : 'Unknown handler error.',
			completedAt: new Date().toISOString(),
		};
		return result;
	}
}
