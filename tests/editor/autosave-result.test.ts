import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AutosaveResult } from '../../src/modules/editor/services/autosave-types.js';

vi.mock('../../src/modules/editor/services/scene-repository.js', () => ({
	updateScene: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../src/modules/editor/services/snapshot-repository.js', () => ({
	createSnapshot: vi.fn().mockResolvedValue(undefined),
	listByScene: vi.fn().mockResolvedValue([]),
}));

/**
 * Phase-001 part-001 — `AutosaveResult` shape.
 *
 * Locks the emitted-event sequence so the SaveStatus UI built in
 * phase-003 can rely on a stable `idle → saving → saved` transition
 * without inspecting service internals.
 */
describe('autosave-service result shape', async () => {
	const service = await import('../../src/modules/editor/services/autosave-service.js');

	let received: AutosaveResult[] = [];

	beforeEach(() => {
		vi.useFakeTimers();
		received = [];
		service.mount('scene-1', 'project-1', (r) => received.push(r));
	});

	afterEach(() => {
		service.unmount();
		vi.useRealTimers();
	});

	it('emits an initial idle result on mount', () => {
		expect(received[0]).toEqual({
			status: 'idle',
			savedAt: null,
			error: null,
			pendingDraft: null,
			attempt: 0,
		});
	});

	it('emits idle → saving → saved across a successful flush', async () => {
		received.length = 0;
		service.schedule('hello');
		// schedule() emits a synchronous "saving" notice for the UI.
		expect(received.at(-1)?.status).toBe('saving');

		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();

		const last = received.at(-1)!;
		expect(last.status).toBe('saved');
		expect(last.error).toBeNull();
		expect(last.pendingDraft).toBeNull();
		expect(last.savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
		expect(last.attempt).toBe(0);
	});

	it('exposes the latest result via getResult()', async () => {
		service.schedule('peek');
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();
		expect(service.getResult().status).toBe('saved');
	});
});
