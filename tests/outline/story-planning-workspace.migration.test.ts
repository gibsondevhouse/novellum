import { describe, it, expect, vi, beforeEach } from 'vitest';

const storyFrameStub = vi.fn().mockResolvedValue({ id: 'sf-1', projectId: 'p1' });
const createActStub = vi.fn().mockResolvedValue({ id: 'act-1', projectId: 'p1', title: 'Act I' });

vi.mock('../../src/modules/outliner/services/story-structure-service.js', () => ({
	getOrCreateStoryFrame: storyFrameStub,
	createAct: createActStub,
}));

const actsCount = vi.fn().mockResolvedValue(0);
const chaptersToArray = vi
	.fn()
	.mockResolvedValue([{ id: 'ch-1', projectId: 'p1', actId: undefined, title: 'Chapter 1' }]);
const chaptersUpdate = vi.fn().mockResolvedValue(undefined);

vi.mock('../../src/lib/legacy/dexie/db', () => ({
	db: {
		acts: {
			where: vi.fn(() => ({ equals: vi.fn(() => ({ count: actsCount })) })),
		},
		chapters: {
			where: vi.fn(() => ({ equals: vi.fn(() => ({ toArray: chaptersToArray })) })),
			update: chaptersUpdate,
		},
	},
}));

describe('outline-to-story-workspace migration', async () => {
	const { migrateOutlineToStoryWorkspace } = await import(
		'../../src/modules/outliner/services/migrations/outline-to-story-workspace.js'
	);

	beforeEach(() => {
		storyFrameStub.mockClear();
		createActStub.mockClear();
		chaptersUpdate.mockClear();
		actsCount.mockResolvedValue(0);
	});

	it('creates a story frame for a project with none', async () => {
		await migrateOutlineToStoryWorkspace('p1');
		expect(storyFrameStub).toHaveBeenCalledWith('p1');
	});

	it('creates a default Act I and assigns chapters when no acts exist', async () => {
		await migrateOutlineToStoryWorkspace('p1');
		expect(createActStub).toHaveBeenCalledWith('p1', 'Act I', 0);
		expect(chaptersUpdate).toHaveBeenCalledWith(
			'ch-1',
			expect.objectContaining({ actId: expect.any(String) }),
		);
	});

	it('is idempotent: does not create duplicate acts', async () => {
		actsCount.mockResolvedValueOnce(1);
		await migrateOutlineToStoryWorkspace('p1');
		expect(createActStub).not.toHaveBeenCalled();
	});
});
