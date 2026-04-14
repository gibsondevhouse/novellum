import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();
const mockApiPut = vi.fn();
const mockApiDel = vi.fn();

class MockApiError extends Error {
	status: number;
	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

vi.mock('$lib/api-client.js', () => ({
	apiGet: (...args: unknown[]) => mockApiGet(...args),
	apiPost: (...args: unknown[]) => mockApiPost(...args),
	apiPut: (...args: unknown[]) => mockApiPut(...args),
	apiDel: (...args: unknown[]) => mockApiDel(...args),
	ApiError: MockApiError,
}));

const { createScene, getSceneById, getScenesByProjectId, updateScene, removeScene } =
	await import('../../src/modules/editor/services/scene-repository.js');

const projectId = 'proj-1';
const chapterId = 'ch-1';

const baseScene = {
	chapterId,
	projectId,
	title: 'Opening',
	summary: 'The start',
	content: 'It began in darkness.',
	wordCount: 4,
	order: 1,
	povCharacterId: null,
	locationId: null,
	timelineEventId: null,
	characterIds: [] as string[],
	locationIds: [] as string[],
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('scene-repository', () => {
	it('creates a scene with auto-generated id and timestamps', async () => {
		const returned = { id: 's1', ...baseScene, createdAt: '2026-01-01', updatedAt: '2026-01-01' };
		mockApiPost.mockResolvedValueOnce(returned);

		const s = await createScene(baseScene);
		expect(s.id).toBe('s1');
		expect(s.title).toBe('Opening');
		expect(mockApiPost).toHaveBeenCalledWith('/api/db/scenes', baseScene);
	});

	it('retrieves a scene by id', async () => {
		const scene = { id: 's1', ...baseScene, createdAt: '2026-01-01', updatedAt: '2026-01-01' };
		mockApiGet.mockResolvedValueOnce(scene);

		const found = await getSceneById('s1');
		expect(found).toBeDefined();
		expect(found!.id).toBe('s1');
	});

	it('returns undefined for a nonexistent id', async () => {
		mockApiGet.mockRejectedValueOnce(new MockApiError('Not found', 404));

		const found = await getSceneById('nonexistent-scene-id');
		expect(found).toBeUndefined();
	});

	it('returns scenes by projectId', async () => {
		const scenes = [
			{ id: 's1', projectId, title: 'Scene 1' },
			{ id: 's2', projectId, title: 'Scene 2' },
		];
		mockApiGet.mockResolvedValueOnce(scenes);

		const result = await getScenesByProjectId(projectId);
		expect(result.length).toBe(2);
		expect(mockApiGet).toHaveBeenCalledWith('/api/db/scenes', { projectId });
	});

	it('does not return scenes from a different project', async () => {
		mockApiGet.mockResolvedValueOnce([]);

		const scenes = await getScenesByProjectId(projectId);
		expect(scenes).toEqual([]);
	});

	it('updates a scene field', async () => {
		mockApiPut.mockResolvedValueOnce({});

		await updateScene('s1', { title: 'Updated Title' });
		expect(mockApiPut).toHaveBeenCalledWith('/api/db/scenes/s1', { title: 'Updated Title' });
	});

	it('removes a scene', async () => {
		mockApiDel.mockResolvedValueOnce(undefined);

		await removeScene('s1');
		expect(mockApiDel).toHaveBeenCalledWith('/api/db/scenes/s1');
	});
});
