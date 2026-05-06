/**
 * plan-023 stage-004 phase-004 — stream controller unit tests.
 */
import { describe, it, expect, vi } from 'vitest';
import { createStreamController } from '$modules/nova';

describe('createStreamController', () => {
	it('exposes a non-aborted signal initially', () => {
		const c = createStreamController();
		expect(c.signal.aborted).toBe(false);
	});

	it('abort() aborts the signal and notifies listeners exactly once', () => {
		const c = createStreamController();
		const listener = vi.fn();
		c.signal.addEventListener('abort', listener);
		c.abort();
		expect(c.signal.aborted).toBe(true);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('repeated abort() is idempotent — listeners not re-fired', () => {
		const c = createStreamController();
		const listener = vi.fn();
		c.signal.addEventListener('abort', listener);
		c.abort();
		c.abort();
		c.abort();
		expect(listener).toHaveBeenCalledTimes(1);
		expect(c.signal.aborted).toBe(true);
	});
});
