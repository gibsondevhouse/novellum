import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry } from '../../src/lib/ai/utils';
import type { RetryConfig } from '../../src/lib/ai/types';

describe('withRetry', () => {
	const config: RetryConfig = {
		maxRetries: 3,
		baseDelayMs: 100,
	};

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns result on successful execution', async () => {
		const fn = vi.fn().mockResolvedValue('success');
		const result = await withRetry(fn, config);
		expect(result).toBe('success');
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('retries on retryable error (429) and succeeds', async () => {
		const error429 = new Error('Rate limited');
		Object.assign(error429, { status: 429 });

		const fn = vi.fn()
			.mockRejectedValueOnce(error429)
			.mockResolvedValue('success');

		const promise = withRetry(fn, config);
		await vi.advanceTimersByTimeAsync(100); // backoff: 100 * 2^0 = 100ms

		const result = await promise;
		expect(result).toBe('success');
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('retries on retryable error (500) and succeeds', async () => {
		const error500 = new Error('Server error');
		Object.assign(error500, { status: 500 });

		const fn = vi.fn()
			.mockRejectedValueOnce(error500)
			.mockResolvedValue('ok');

		const promise = withRetry(fn, config);
		await vi.advanceTimersByTimeAsync(100);

		const result = await promise;
		expect(result).toBe('ok');
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('throws after max retries exceeded', async () => {
		const error500 = new Error('Server error');
		Object.assign(error500, { status: 500 });

		const fn = vi.fn().mockRejectedValue(error500);

		const promise = withRetry(fn, config);
		promise.catch(() => {}); // prevent unhandled rejection

		await vi.advanceTimersByTimeAsync(100); // attempt 1 backoff
		await vi.advanceTimersByTimeAsync(200); // attempt 2 backoff
		// attempt 3 fails, no more retries

		await expect(promise).rejects.toThrow('All 3 retry attempts failed');
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('does not retry on non-retryable error (400)', async () => {
		const error400 = new Error('Bad request');
		Object.assign(error400, { status: 400 });

		const fn = vi.fn().mockRejectedValue(error400);

		await expect(withRetry(fn, config)).rejects.toThrow('Bad request');
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('does not retry on non-retryable error (403)', async () => {
		const error403 = new Error('Forbidden');
		Object.assign(error403, { status: 403 });

		const fn = vi.fn().mockRejectedValue(error403);

		await expect(withRetry(fn, config)).rejects.toThrow('Forbidden');
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('does not retry on non-retryable error (401)', async () => {
		const error401 = new Error('Unauthorized');
		Object.assign(error401, { status: 401 });

		const fn = vi.fn().mockRejectedValue(error401);

		await expect(withRetry(fn, config)).rejects.toThrow('Unauthorized');
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('uses exponential backoff timing', async () => {
		const error500 = new Error('Server error');
		Object.assign(error500, { status: 500 });

		const fn = vi.fn()
			.mockRejectedValueOnce(error500)
			.mockRejectedValueOnce(error500)
			.mockResolvedValue('success');

		const promise = withRetry(fn, config);

		// After 99ms, only 1 call (still waiting for 100ms backoff)
		await vi.advanceTimersByTimeAsync(99);
		expect(fn).toHaveBeenCalledTimes(1);

		// After 100ms total, 2nd call happens
		await vi.advanceTimersByTimeAsync(1);
		expect(fn).toHaveBeenCalledTimes(2);

		// After 200ms more (300ms total), 3rd call happens
		await vi.advanceTimersByTimeAsync(200);
		const result = await promise;
		expect(result).toBe('success');
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('retries network errors (no status code)', async () => {
		const networkError = new Error('fetch failed');

		const fn = vi.fn()
			.mockRejectedValueOnce(networkError)
			.mockResolvedValue('success');

		const promise = withRetry(fn, config);
		await vi.advanceTimersByTimeAsync(100);

		const result = await promise;
		expect(result).toBe('success');
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('preserves error cause when all retries fail', async () => {
		const error = new Error('Server error');
		Object.assign(error, { status: 500 });

		const fn = vi.fn().mockRejectedValue(error);
		const promise = withRetry(fn, config);
		promise.catch(() => {});

		await vi.runAllTimersAsync();

		try {
			await promise;
			expect.unreachable('should have thrown');
		} catch (err) {
			expect((err as Error).cause).toBe(error);
		}
	});

	it('preserves original error on non-retryable throw', async () => {
		const error = new Error('Not found');
		Object.assign(error, { status: 404 });

		const fn = vi.fn().mockRejectedValue(error);

		try {
			await withRetry(fn, config);
			expect.unreachable('should have thrown');
		} catch (err) {
			expect(err).toBe(error);
		}
	});

	it('works with maxRetries of 1 (no retries)', async () => {
		const error = new Error('Server error');
		Object.assign(error, { status: 500 });

		const fn = vi.fn().mockRejectedValue(error);

		await expect(withRetry(fn, { maxRetries: 1, baseDelayMs: 100 }))
			.rejects.toThrow('All 1 retry attempts failed');
		expect(fn).toHaveBeenCalledTimes(1);
	});
});
