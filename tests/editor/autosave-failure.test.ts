import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AutosaveResult } from '../../src/modules/editor/services/autosave-types.js';

const updateScene = vi.fn();
const createSnapshot = vi.fn();

vi.mock('../../src/modules/editor/services/scene-repository.js', () => ({
	updateScene: (...args: unknown[]) => updateScene(...args),
}));
vi.mock('../../src/modules/editor/services/snapshot-repository.js', () => ({
	createSnapshot: (...args: unknown[]) => createSnapshot(...args),
	listByScene: vi.fn().mockResolvedValue([]),
}));

/**
 * Phase-001 part-002 — bounded retry policy.
 *
 * The autosave service must retain the user's text across a failed
 * save, retry on the documented backoff schedule, and stop scheduling
 * further retries once the budget is exhausted. A new keystroke must
 * re-arm the loop.
 */
describe('autosave-service retry behaviour', async () => {
	const service = await import('../../src/modules/editor/services/autosave-service.js');

	let received: AutosaveResult[] = [];

	beforeEach(() => {
		vi.useFakeTimers();
		received = [];
		updateScene.mockReset();
		createSnapshot.mockReset();
		createSnapshot.mockResolvedValue(undefined);
		service.mount('scene-1', 'project-1', (r) => received.push(r));
	});

	afterEach(() => {
		service.unmount();
		vi.useRealTimers();
	});

	it('retains the pending draft when a save fails', async () => {
		updateScene.mockRejectedValueOnce(new Error('disk full'));
		service.schedule('important text');
		await vi.advanceTimersByTimeAsync(2000);

		const failed = received.find((r) => r.status === 'failed');
		expect(failed).toBeDefined();
		expect(failed?.pendingDraft).toBe('important text');
		expect(failed?.attempt).toBe(1);
		expect(failed?.error).toBe('disk full');
	});

	it('recovers on the next retry attempt and clears the pending draft', async () => {
		updateScene.mockRejectedValueOnce(new Error('transient'));
		updateScene.mockResolvedValueOnce(undefined);
		service.schedule('keep-me');

		await vi.advanceTimersByTimeAsync(2000);
		expect(received.at(-1)?.status).toBe('failed');

		// First retry fires after 500ms.
		await vi.advanceTimersByTimeAsync(500);

		const last = received.at(-1)!;
		expect(last.status).toBe('saved');
		expect(last.pendingDraft).toBeNull();
		expect(updateScene).toHaveBeenCalledTimes(2);
	});

	it('stops retrying after the budget is exhausted', async () => {
		updateScene.mockRejectedValue(new Error('still down'));
		service.schedule('held text');

		// Initial attempt + three scheduled retries (500ms, 1500ms, 4500ms).
		await vi.advanceTimersByTimeAsync(2000);
		await vi.advanceTimersByTimeAsync(500);
		await vi.advanceTimersByTimeAsync(1500);
		await vi.advanceTimersByTimeAsync(4500);

		expect(updateScene).toHaveBeenCalledTimes(4);

		// Further time passing must not trigger another attempt.
		await vi.advanceTimersByTimeAsync(60_000);
		expect(updateScene).toHaveBeenCalledTimes(4);

		const final = received.at(-1)!;
		expect(final.status).toBe('failed');
		expect(final.pendingDraft).toBe('held text');
	});

	it('a new keystroke after a failure resets the retry budget', async () => {
		updateScene.mockRejectedValueOnce(new Error('down'));
		service.schedule('first');
		await vi.advanceTimersByTimeAsync(2000);
		expect(received.at(-1)?.status).toBe('failed');
		expect(received.at(-1)?.attempt).toBe(1);

		updateScene.mockResolvedValue(undefined);
		service.schedule('first-and-second');
		// schedule() should reset attempt back to 0 immediately.
		expect(received.at(-1)?.status).toBe('saving');
		expect(received.at(-1)?.attempt).toBe(0);

		await vi.advanceTimersByTimeAsync(2000);
		expect(received.at(-1)?.status).toBe('saved');
	});

	it('sanitises errors — multi-line stack traces become a single line', async () => {
		const noisy = new Error('top-line\nat module:1:1\nat secret-key: sk-or-v1-LEAK');
		updateScene.mockRejectedValueOnce(noisy);
		service.schedule('text');
		await vi.advanceTimersByTimeAsync(2000);

		const failed = received.find((r) => r.status === 'failed');
		expect(failed?.error).toBe('top-line');
	});
});
