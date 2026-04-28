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

const {
	createAct,
	getActById,
	getActsByProjectId,
	getActsByArcId,
	updateAct,
	removeAct,
	reorderActs,
} = await import('../../src/modules/project/services/act-repository.js');

const projectId = 'proj-1';
const baseAct = {
	projectId,
	arcId: 'arc-1',
	title: 'Act One',
	order: 0,
	planningNotes: '',
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('act-repository', () => {
	it('creates an act', async () => {
		const returned = { id: 'act-1', ...baseAct, createdAt: 't', updatedAt: 't' };
		mockApiPost.mockResolvedValueOnce(returned);

		const act = await createAct(baseAct);
		expect(act.id).toBe('act-1');
		expect(mockApiPost).toHaveBeenCalledWith('/api/db/acts', baseAct);
	});

	it('retrieves an act by id', async () => {
		const act = { id: 'act-1', ...baseAct, createdAt: 't', updatedAt: 't' };
		mockApiGet.mockResolvedValueOnce(act);

		const found = await getActById('act-1');
		expect(found?.id).toBe('act-1');
		expect(mockApiGet).toHaveBeenCalledWith('/api/db/acts/act-1');
	});

	it('returns undefined on 404', async () => {
		mockApiGet.mockRejectedValueOnce(new MockApiError('Not found', 404));

		const found = await getActById('missing');
		expect(found).toBeUndefined();
	});

	it('returns acts by projectId', async () => {
		mockApiGet.mockResolvedValueOnce([{ id: 'act-1', ...baseAct }]);

		const result = await getActsByProjectId(projectId);
		expect(result.length).toBe(1);
		expect(mockApiGet).toHaveBeenCalledWith('/api/db/acts', { projectId });
	});

	it('returns acts by arcId', async () => {
		mockApiGet.mockResolvedValueOnce([{ id: 'act-1', ...baseAct }]);

		const result = await getActsByArcId('arc-1');
		expect(result.length).toBe(1);
		expect(mockApiGet).toHaveBeenCalledWith('/api/db/acts', { arcId: 'arc-1' });
	});

	it('updates an act', async () => {
		mockApiPut.mockResolvedValueOnce({});

		await updateAct('act-1', { title: 'Renamed' });
		expect(mockApiPut).toHaveBeenCalledWith('/api/db/acts/act-1', { title: 'Renamed' });
	});

	it('removes an act', async () => {
		mockApiDel.mockResolvedValueOnce(undefined);

		await removeAct('act-1');
		expect(mockApiDel).toHaveBeenCalledWith('/api/db/acts/act-1');
	});

	it('reorders acts', async () => {
		mockApiPut.mockResolvedValueOnce({});

		await reorderActs(projectId, ['act-2', 'act-1']);
		expect(mockApiPut).toHaveBeenCalledWith('/api/db/acts/reorder', {
			orderedIds: ['act-2', 'act-1'],
		});
	});

	it('reorderActs handles empty array', async () => {
		mockApiPut.mockResolvedValueOnce({});
		await expect(reorderActs(projectId, [])).resolves.toBeUndefined();
	});

	it('returns empty array for project with no acts', async () => {
		mockApiGet.mockResolvedValueOnce([]);
		const acts = await getActsByProjectId('empty');
		expect(acts).toEqual([]);
	});
});
