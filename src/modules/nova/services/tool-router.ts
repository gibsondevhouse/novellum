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
	runtime?: {
		runId: string;
		stepId?: string;
	};
}

export async function dispatchTool(
	invocation: ToolInvocation,
	options: DispatchToolOptions = {},
): Promise<ToolResult> {
	let tracer: any = null;
	if (options.runtime) {
		try {
			tracer = await import('../../../lib/server/agent-runtime/trace.js');
		} catch {
			/* client-safe fallback */
		}
	}

	if (tracer) {
		tracer.captureTrace(
			tracer.TRACE_EVENT_TYPES.TOOL_CALL,
			`Tool call: ${invocation.toolId}`,
			tracer.TraceMetadata.toolCall(invocation.toolId, invocation.invocationId, invocation.args),
			options.runtime!,
		);
	}

	const tool = getTool(invocation.toolId);
	if (!tool) {
		const result: ToolResult = {
			invocationId: invocation.invocationId,
			toolId: invocation.toolId,
			status: 'unimplemented',
			error: `Tool ${invocation.toolId} is not registered.`,
			completedAt: new Date().toISOString(),
		};
		if (tracer) {
			tracer.captureTrace(
				tracer.TRACE_EVENT_TYPES.ERROR,
				`Tool ${invocation.toolId} not found`,
				{ result },
				options.runtime!,
			);
		}
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
		if (tracer) {
			tracer.captureTrace(
				tracer.TRACE_EVENT_TYPES.ERROR,
				`Tool ${invocation.toolId} blocked (mutation boundary)`,
				{ result },
				options.runtime!,
			);
		}
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
		if (tracer) {
			tracer.captureTrace(
				tracer.TRACE_EVENT_TYPES.TOOL_CALL,
				`Tool result: ${result.status}`,
				tracer.TraceMetadata.toolResult(invocation.toolId, invocation.invocationId, result),
				options.runtime!,
			);
		}
		return result;
	} catch (err) {
		const result: ToolResult = {
			invocationId: invocation.invocationId,
			toolId: invocation.toolId,
			status: 'error',
			error: err instanceof Error ? err.message : 'Unknown handler error.',
			completedAt: new Date().toISOString(),
		};
		if (tracer) {
			tracer.captureTrace(
				tracer.TRACE_EVENT_TYPES.ERROR,
				`Tool handler error: ${result.error}`,
				{ result },
				options.runtime!,
			);
		}
		return result;
	}
}
