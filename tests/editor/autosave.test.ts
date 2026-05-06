import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Dexie and repositories before importing the service
vi.mock('../../src/modules/editor/services/scene-repository.js', () => ({
	updateScene: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../src/modules/editor/services/snapshot-repository.js', () => ({
	createSnapshot: vi.fn().mockResolvedValue(undefined),
	listByScene: vi.fn().mockResolvedValue([]),
}));

describe('autosave-service (debounce behavior)', async () => {
	const service = await import('../../src/modules/editor/services/autosave-service.js');
	const { updateScene } = await import('../../src/modules/editor/services/scene-repository.js');
	const { createSnapshot } =
		await import('../../src/modules/editor/services/snapshot-repository.js');

	beforeEach(() => {
		vi.useFakeTimers();
		service.mount('scene-1', 'project-1');
		vi.clearAllMocks();
	});

	afterEach(() => {
		service.unmount();
		vi.useRealTimers();
	});

	it('does not save immediately on schedule()', () => {
		service.schedule('hello');
		expect(updateScene).not.toHaveBeenCalled();
	});

	it('saves after 2 seconds debounce', async () => {
		service.schedule('hello');
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();
		expect(updateScene).toHaveBeenCalledWith(
			'scene-1',
			expect.objectContaining({ content: 'hello' }),
		);
	});

        it('passes wordCount derived from text content to updateScene', async () => {
                service.schedule('<p>Hello world, this is five</p>');
                vi.advanceTimersByTime(2000);
                await vi.runAllTimersAsync();
                expect(updateScene).toHaveBeenCalledWith(
                        'scene-1',
                        expect.objectContaining({ wordCount: 5 }),
                );
        });

        it('passes wordCount of 0 for empty or whitespace-only content', async () => {
                service.schedule('   ');
                vi.advanceTimersByTime(2000);
                await vi.runAllTimersAsync();
                expect(updateScene).toHaveBeenCalledWith(
                        'scene-1',
                        expect.objectContaining({ wordCount: 0 }),
                );
        });

	it('flushNow() saves immediately', async () => {
		service.schedule('quick');
		await service.flushNow();
		expect(updateScene).toHaveBeenCalledWith(
			'scene-1',
			expect.objectContaining({ content: 'quick' }),
		);
	});

	it('creates a snapshot on save', async () => {
		service.schedule('snap this');
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();
		expect(createSnapshot).toHaveBeenCalledWith('scene-1', 'project-1', 'snap this');
	});
});
