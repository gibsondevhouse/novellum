import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/lib/db/index.js', () => ({
	db: {
		story_frames: {
			where: vi.fn(() => ({ equals: vi.fn(() => ({ first: vi.fn().mockResolvedValue(null) })) })),
			add: vi.fn().mockResolvedValue(undefined),
		},
		acts: {
			where: vi.fn(() => ({
				equals: vi.fn(() => ({ count: vi.fn().mockResolvedValue(0) })),
			})),
			add: vi.fn().mockResolvedValue(undefined),
		},
		chapters: {
			where: vi.fn(() => ({
				equals: vi.fn(() => ({
					toArray: vi
						.fn()
						.mockResolvedValue([
							{ id: 'ch-1', projectId: 'p1', actId: undefined, title: 'Chapter 1' },
						]),
				})),
			})),
			update: vi.fn().mockResolvedValue(undefined),
		},
	},
}));

describe('outline-to-story-workspace migration', async () => {
	const { migrateOutlineToStoryWorkspace } =
		await import('../../src/modules/outliner/services/migrations/outline-to-story-workspace.js');

	it('creates a story frame for a project with none', async () => {
		await migrateOutlineToStoryWorkspace('p1');
		const { db } = await import('../../src/lib/db/index.js');
		expect(db.story_frames.add).toHaveBeenCalled();
	});

	it('creates a default Act I and assigns chapters when no acts exist', async () => {
		await migrateOutlineToStoryWorkspace('p1');
		const { db } = await import('../../src/lib/db/index.js');
		expect(db.acts.add).toHaveBeenCalled();
		expect(db.chapters.update).toHaveBeenCalledWith(
			'ch-1',
			expect.objectContaining({ actId: expect.any(String) }),
		);
	});

	it('is idempotent: does not create duplicate acts', async () => {
		const { db } = await import('../../src/lib/db/index.js');
		// Override to return 1 existing act
		(db.acts.where as ReturnType<typeof vi.fn>).mockReturnValue({
			equals: vi.fn(() => ({ count: vi.fn().mockResolvedValue(1) })),
		});
		vi.clearAllMocks();
		(db.story_frames.where as ReturnType<typeof vi.fn>).mockReturnValue({
			equals: vi.fn(() => ({ first: vi.fn().mockResolvedValue({ id: 'sf-1', projectId: 'p1' }) })),
		});
		await migrateOutlineToStoryWorkspace('p1');
		expect(db.acts.add).not.toHaveBeenCalled();
	});
});
