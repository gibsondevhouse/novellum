import { createRunLedgerRepository, type RunLedgerRepository } from './run-ledger.js';
import type { AgentTraceEventRecord, AgentTraceRedactionRecord } from './types.js';

export const TRACE_EVENT_TYPES = {
	PROMPT_ASSEMBLY: 'prompt_assembly',
	MODEL_SELECTION: 'model_selection',
	PROVIDER_CALL: 'provider_call',
	STREAM_CHUNK: 'stream_chunk',
	TOOL_CALL: 'tool_call',
	PARSER_RESULT: 'parser_result',
	ARTIFACT_CREATION: 'artifact_creation',
	REVIEW_TRANSITION: 'review_transition',
	USAGE_RECONCILIATION: 'usage_reconciliation',
	ERROR: 'error',
} as const;

export type TraceEventType = (typeof TRACE_EVENT_TYPES)[keyof typeof TRACE_EVENT_TYPES];

export interface TraceOptions {
	runId: string;
	stepId?: string | null;
	ledger?: RunLedgerRepository;
}

/**
 * Captures a redacted trace event for the given run and step.
 */
export function captureTrace(
	eventType: TraceEventType,
	message: string,
	metadata: unknown,
	options: TraceOptions,
): {
	event: AgentTraceEventRecord;
	redactions: AgentTraceRedactionRecord[];
} {
	const ledger = options.ledger ?? createRunLedgerRepository();
	return ledger.appendTraceEvent({
		runId: options.runId,
		stepId: options.stepId,
		eventType,
		message,
		metadata,
	});
}

/**
 * Standardized metadata for common trace events.
 */
export const TraceMetadata = {
	prompt(prompt: string, taskType: string, modelId: string) {
		return { prompt, taskType, modelId };
	},
	providerCall(providerId: string, modelId: string, request: unknown) {
		return { providerId, modelId, request };
	},
	providerResponse(providerId: string, modelId: string, response: unknown) {
		return { providerId, modelId, response };
	},
	toolCall(toolId: string, invocationId: string, input: unknown) {
		return { toolId, invocationId, input };
	},
	toolResult(toolId: string, invocationId: string, result: unknown) {
		return { toolId, invocationId, result };
	},
	parserResult(parserId: string, output: unknown, error?: string) {
		return { parserId, output, error };
	},
	usage(providerId: string, modelId: string, usage: unknown) {
		return { providerId, modelId, usage };
	},
};
