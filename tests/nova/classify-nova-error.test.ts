/**
 * plan-018 stage-005 phase-005 — classifyNovaError tests.
 */
import { describe, it, expect } from 'vitest';
import { classifyNovaError } from '../../src/modules/nova/utils/classify-nova-error.js';

describe('classifyNovaError', () => {
	it('returns rate_limit for 429 status message', () => {
		expect(classifyNovaError(new Error('HTTP 429 Too Many Requests'))).toBe('rate_limit');
	});

	it('returns rate_limit for "rate limit" message', () => {
		expect(classifyNovaError(new Error('rate limit exceeded'))).toBe('rate_limit');
	});

	it('returns rate_limit for "rate-limit" message', () => {
		expect(classifyNovaError(new Error('Rate-Limit reached'))).toBe('rate_limit');
	});

	it('returns invalid_key for 401 message', () => {
		expect(classifyNovaError(new Error('HTTP 401 Unauthorized'))).toBe('invalid_key');
	});

	it('returns invalid_key for invalid key message', () => {
		expect(classifyNovaError(new Error('invalid_key provided'))).toBe('invalid_key');
	});

	it('returns invalid_key for MissingCredentials message', () => {
		expect(classifyNovaError(new Error('MissingCredentials: no openrouter key'))).toBe(
			'invalid_key',
		);
	});

	it('returns context_too_large for 413 message', () => {
		expect(classifyNovaError(new Error('HTTP 413 Payload Too Large'))).toBe('context_too_large');
	});

	it('returns context_too_large for "context too large" message', () => {
		expect(classifyNovaError(new Error('context too large for model'))).toBe('context_too_large');
	});

	it('returns context_too_large for token limit message', () => {
		expect(classifyNovaError(new Error('token_limit exceeded'))).toBe('context_too_large');
	});

	it('returns network_error for "Failed to fetch" message', () => {
		expect(classifyNovaError(new Error('Failed to fetch'))).toBe('network_error');
	});

	it('returns network_error for ECONNREFUSED', () => {
		expect(classifyNovaError(new Error('connect ECONNREFUSED 127.0.0.1:3000'))).toBe(
			'network_error',
		);
	});

	it('returns network_error for "network" message', () => {
		expect(classifyNovaError(new Error('network timeout'))).toBe('network_error');
	});

	it('returns unknown for unrecognised errors', () => {
		expect(classifyNovaError(new Error('some completely unexpected error'))).toBe('unknown');
	});

	it('handles non-Error values via string coercion', () => {
		expect(classifyNovaError('429 rate limit')).toBe('rate_limit');
		expect(classifyNovaError({ toString: () => 'invalid_key problem' })).toBe('invalid_key');
	});
});
