import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();
const mockApiDel = vi.fn();

vi.mock('$lib/api-client.js', () => ({
	apiGet: (...args: unknown[]) => mockApiGet(...args),
	apiPost: (...args: unknown[]) => mockApiPost(...args),
	apiDel: (...args: unknown[]) => mockApiDel(...args),
	ApiError: class extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	},
}));

describe('snapshot pruning', async () => {
	const { createSnapshot } =
		await import('../../src/modules/editor/services/snapshot-repository.js');

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('prunes to max 20 snapshots when over limit', async () => {
		// createSnapshot does:
		// 1. apiPost to create
		// 2. apiGet to list all snapshots for scene (sorted newest first)
		// 3. if > 20, apiDel for each excess

		// Mock the POST (create snapshot)
		mockApiPost.mockResolvedValueOnce({});

		// Mock the GET (list snapshots) — return 21 snapshots (over limit)
		const snapshots = Array.from({ length: 21 }, (_, i) => ({
			id: `snap-${i}`,
			sceneId: 'sc1',
			projectId: 'p1',
			text: `v${i}`,
			createdAt: new Date((20 - i) * 1000).toISOString(), // newest first
		}));
		mockApiGet.mockResolvedValueOnce(snapshots);

		// Mock the DEL for the one excess snapshot (index 20)
		mockApiDel.mockResolvedValue(undefined);

		await createSnapshot('sc1', 'p1', 'new snapshot');

		expect(mockApiPost).toHaveBeenCalledWith('/api/db/scene_snapshots', {
			sceneId: 'sc1',
			projectId: 'p1',
			text: 'new snapshot',
			wordCount: 2,
			source: 'autosave',
			label: '',
			reason: '',
		});
		expect(mockApiGet).toHaveBeenCalledWith('/api/db/scene_snapshots', { sceneId: 'sc1' });
		// Should delete 1 excess snapshot (21 - 20 = 1)
		expect(mockApiDel).toHaveBeenCalledTimes(1);
		expect(mockApiDel).toHaveBeenCalledWith('/api/db/scene_snapshots/snap-20');
	});
});
