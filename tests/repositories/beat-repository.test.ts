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

const { createBeat, getBeatById, getBeatsBySceneId, updateBeat, removeBeat } =
	await import('../../src/modules/editor/services/beat-repository.js');

const projectId = 'proj-1';
const sceneId = 'sc-1';

const baseBeat = {
	sceneId,
	projectId,
	title: 'Inciting Incident',
	type: 'action',
	order: 1,
	notes: 'Hero discovers the letter.',
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('beat-repository', () => {
	it('creates a beat with auto-generated id and timestamps', async () => {
		const returned = { id: 'b1', ...baseBeat, createdAt: '2026-01-01', updatedAt: '2026-01-01' };
		mockApiPost.mockResolvedValueOnce(returned);

		const b = await createBeat(baseBeat);
		expect(b.id).toBe('b1');
		expect(b.title).toBe('Inciting Incident');
		expect(mockApiPost).toHaveBeenCalledWith('/api/db/beats', baseBeat);
	});

	it('retrieves a beat by id', async () => {
		const beat = { id: 'b1', ...baseBeat, createdAt: '2026-01-01', updatedAt: '2026-01-01' };
		mockApiGet.mockResolvedValueOnce(beat);

		const found = await getBeatById('b1');
		expect(found).toBeDefined();
		expect(found!.id).toBe('b1');
	});

	it('returns undefined for a nonexistent id', async () => {
		mockApiGet.mockRejectedValueOnce(new MockApiError('Not found', 404));

		const found = await getBeatById('nonexistent-beat-id');
		expect(found).toBeUndefined();
	});

	it('returns beats by sceneId', async () => {
		const beats = [
			{ id: 'b1', sceneId, title: 'Beat 1' },
			{ id: 'b2', sceneId, title: 'Beat 2' },
		];
		mockApiGet.mockResolvedValueOnce(beats);

		const result = await getBeatsBySceneId(sceneId);
		expect(result.length).toBe(2);
		expect(mockApiGet).toHaveBeenCalledWith('/api/db/beats', { sceneId });
	});

	it('does not return beats from a different scene', async () => {
		mockApiGet.mockResolvedValueOnce([]);

		const beats = await getBeatsBySceneId(sceneId);
		expect(beats).toEqual([]);
	});

	it('updates a beat field', async () => {
		mockApiPut.mockResolvedValueOnce({});

		await updateBeat('b1', { title: 'Updated Beat' });
		expect(mockApiPut).toHaveBeenCalledWith('/api/db/beats/b1', { title: 'Updated Beat' });
	});

	it('removes a beat', async () => {
		mockApiDel.mockResolvedValueOnce(undefined);

		await removeBeat('b1');
		expect(mockApiDel).toHaveBeenCalledWith('/api/db/beats/b1');
	});
});
