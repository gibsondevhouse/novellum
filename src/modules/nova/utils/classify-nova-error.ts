/**
 * plan-018 stage-005 phase-005 — Nova error classifier.
 *
 * Maps raw error messages from the OpenRouter / fetch pipeline into
 * typed `NovaErrorType` categories so `NovaErrorBoundary` can render
 * actionable, human-readable notices.
 */
import type { NovaErrorType } from '../types.js';

export type { NovaErrorType };

export function classifyNovaError(error: unknown): NovaErrorType {
	const msg =
		error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
	if (/429|rate.?limit/i.test(msg)) return 'rate_limit';
	if (/401|invalid.?key|missingcredentials/i.test(msg)) return 'invalid_key';
	if (/413|context.?too.?large|token.?limit/i.test(msg)) return 'context_too_large';
	if (/network|fetch|econnrefused|failed to fetch/i.test(msg)) return 'network_error';
	return 'unknown';
}
