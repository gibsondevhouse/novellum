/**
 * POST /api/worldbuilding/scan
 *
 * Agentic worldbuild scan endpoint (plan-037).
 *
 * Accepts a scan request, validates the context envelope, and returns
 * non-canonical proposal suggestions for author review.
 *
 * Scan results are NEVER auto-applied to canon. Every proposal requires
 * explicit author accept before any canon write occurs.
 *
 * NOTE: Scan execution is wired in Stage 003. This endpoint currently
 * defines the full validation and error contract and returns 501 for the
 * scan execution path.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	checkScanContextSufficiency,
	type WorldbuildScanRequest,
} from '$modules/world-building/services/worldbuild-scan-contract.js';

// ---------------------------------------------------------------------------
// Error codes — stable, typed, never change once published
// ---------------------------------------------------------------------------

export type ScanErrorCode =
	| 'invalid_request'
	| 'no_credentials'
	| 'invalid_key'
	| 'rate_limit'
	| 'context_insufficient'
	| 'schema_validation_failed'
	| 'provider_error'
	| 'scan_not_implemented';

/**
 * User-safe copy for each error code.
 *
 * These strings are safe to surface directly in the UI. They must never
 * contain provider keys, internal stack traces, or raw model output.
 */
export const SCAN_ERROR_USER_COPY: Record<ScanErrorCode, string> = {
	invalid_request: 'Invalid scan request.',
	no_credentials: 'No AI provider credentials configured.',
	invalid_key: 'Invalid API key. Check your provider settings.',
	rate_limit: 'AI provider rate limit reached. Try again shortly.',
	context_insufficient:
		'Project context is incomplete. Add a title, logline, and synopsis before scanning.',
	schema_validation_failed:
		'The scan response was not in the expected format. Try again.',
	provider_error: 'AI provider error. Try again or check your provider settings.',
	scan_not_implemented:
		'Scan execution is not yet available. Check back in a future update.',
};

// ---------------------------------------------------------------------------
// Typed error response shape
// ---------------------------------------------------------------------------

export interface ScanErrorResponse {
	error: {
		/** Stable error code — safe for client branching logic. */
		code: ScanErrorCode;
		/** User-safe message — safe to display in UI. */
		message: string;
		/**
		 * Developer diagnostics — structured details for debugging.
		 * Must never be shown raw in production UI.
		 */
		details?: Record<string, unknown>;
	};
}

export interface ScanSuccessResponse {
	ok: true;
	proposals: unknown[];
}

function scanError(
	code: ScanErrorCode,
	status: number,
	details?: Record<string, unknown>,
): Response {
	const body: ScanErrorResponse = {
		error: {
			code,
			message: SCAN_ERROR_USER_COPY[code],
			...(details ? { details } : {}),
		},
	};
	return json(body, { status });
}

// ---------------------------------------------------------------------------
// HTTP status mapping for scan error codes
// ---------------------------------------------------------------------------

export function statusForScanCode(code: ScanErrorCode): number {
	switch (code) {
		case 'invalid_request': return 400;
		case 'no_credentials': return 401;
		case 'invalid_key': return 401;
		case 'rate_limit': return 429;
		case 'context_insufficient': return 422;
		case 'schema_validation_failed': return 422;
		case 'provider_error': return 502;
		case 'scan_not_implemented': return 501;
	}
}

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const VALID_DOMAIN_SCOPES = new Set(['personae', 'atlas', 'archive', 'threads', 'chronicles']);

function parseScanRequest(body: unknown): WorldbuildScanRequest | null {
	if (typeof body !== 'object' || body === null) return null;
	const b = body as Record<string, unknown>;
	if (typeof b.projectId !== 'string') return null;
	if (typeof b.domainScope !== 'string' || !VALID_DOMAIN_SCOPES.has(b.domainScope)) return null;
	if (typeof b.context !== 'object' || b.context === null) return null;
	return b as unknown as WorldbuildScanRequest;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const scanRequest = parseScanRequest(body);

	if (!scanRequest) {
		return scanError('invalid_request', statusForScanCode('invalid_request'), {
			hint: 'Request must include projectId, domainScope, and context envelope.',
		});
	}

	const sufficiency = checkScanContextSufficiency(scanRequest.context.project);
	if (!sufficiency.sufficient) {
		return scanError('context_insufficient', statusForScanCode('context_insufficient'), {
			missing: sufficiency.missing,
		});
	}

	// Scan execution is wired in Stage 003. Return 501 until then.
	return scanError('scan_not_implemented', statusForScanCode('scan_not_implemented'));
};
