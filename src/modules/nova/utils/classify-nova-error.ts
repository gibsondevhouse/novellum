/**
 * plan-018 stage-005 phase-005 — Nova error classifier.
 *
 * Maps raw error messages from the OpenRouter / fetch pipeline into
 * typed `NovaErrorType` categories so `NovaErrorBoundary` can render
 * actionable, human-readable notices.
 *
 * For typed `AppError` instances we read `.code` directly so the
 * error-map's user-facing text is decoupled from the regex
 * vocabulary used for free-form error strings (the legacy fallback).
 */
import { AppError } from '$lib/errors.js';
import type { NovaErrorType } from '../types.js';

export type { NovaErrorType };

function classifyAppErrorCode(code: string): NovaErrorType | null {
	if (code === 'AI_RATE_LIMIT') return 'rate_limit';
	if (code === 'AI_INVALID_KEY' || code === 'AI_KEY_MISSING') return 'invalid_key';
	return null;
}

export function classifyNovaError(error: unknown): NovaErrorType {
	if (error instanceof AppError) {
		const fromCode = classifyAppErrorCode(error.code);
		if (fromCode) return fromCode;
	}

	const msg =
		error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
	if (/429|rate.?limit/i.test(msg)) return 'rate_limit';
	if (/401|invalid.?key|missingcredentials/i.test(msg)) return 'invalid_key';
	if (/413|context.?too.?large|token.?limit/i.test(msg)) return 'context_too_large';
	if (/network|fetch|econnrefused|failed to fetch/i.test(msg)) return 'network_error';
	return 'unknown';
}
