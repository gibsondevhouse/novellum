import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the pruning logic without Dexie by testing the repository with mocked db
const mockSnapshots: {
	id: string;
	sceneId: string;
	projectId: string;
	text: string;
	createdAt: string;
}[] = [];

vi.mock('../../src/lib/db/index.js', () => ({
	db: {
		scene_snapshots: {
			add: vi.fn(async (s) => {
				mockSnapshots.push(s);
			}),
			where: vi.fn(() => ({
				equals: vi.fn(() => ({
					sortBy: vi.fn(async () => [...mockSnapshots]),
				})),
			})),
			bulkDelete: vi.fn(async (ids: string[]) => {
				ids.forEach((id) => {
					const idx = mockSnapshots.findIndex((s) => s.id === id);
					if (idx !== -1) mockSnapshots.splice(idx, 1);
				});
			}),
		},
	},
}));

describe('snapshot pruning', async () => {
	const { createSnapshot } =
		await import('../../src/modules/editor/services/snapshot-repository.js');

	beforeEach(() => {
		mockSnapshots.length = 0;
		vi.clearAllMocks();
	});

	it('prunes to max 20 snapshots when over limit', async () => {
		// Pre-populate 20 snapshots
		for (let i = 0; i < 20; i++) {
			mockSnapshots.push({
				id: `id-${i}`,
				sceneId: 'sc1',
				projectId: 'p1',
				text: `v${i}`,
				createdAt: new Date(i * 1000).toISOString(),
			});
		}
		await createSnapshot('sc1', 'p1', 'new snapshot');
		expect(mockSnapshots.length).toBeLessThanOrEqual(20);
	});
});
