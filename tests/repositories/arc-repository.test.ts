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

const { createArc, getArcById, getArcsByProjectId, updateArc, removeArc, reorderArcs } =
	await import('../../src/modules/outliner/services/arc-repository.js');

const projectId = 'proj-1';

const baseArc = {
	projectId,
	title: 'Redemption',
	description: 'A journey from darkness to light',
	purpose: 'Drive emotional stakes',
	order: 0,
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('arc-repository', () => {
	it('creates an arc with auto-generated id and timestamps', async () => {
		const returned = { id: 'a1', ...baseArc, createdAt: '2026-01-01', updatedAt: '2026-01-01' };
		mockApiPost.mockResolvedValueOnce(returned);

		const arc = await createArc(baseArc);
		expect(arc.id).toBe('a1');
		expect(arc.title).toBe('Redemption');
		expect(mockApiPost).toHaveBeenCalledWith('/api/db/arcs', baseArc);
	});

	it('retrieves an arc by id', async () => {
		const arc = { id: 'a1', ...baseArc, createdAt: '2026-01-01', updatedAt: '2026-01-01' };
		mockApiGet.mockResolvedValueOnce(arc);

		const found = await getArcById('a1');
		expect(found).toBeDefined();
		expect(found!.id).toBe('a1');
	});

	it('returns undefined for a nonexistent id', async () => {
		mockApiGet.mockRejectedValueOnce(new MockApiError('Not found', 404));

		const found = await getArcById('nonexistent-arc-id');
		expect(found).toBeUndefined();
	});

	it('returns arcs by projectId sorted by order', async () => {
		const arcs = [
			{ id: 'a1', ...baseArc, title: 'Arc A', order: 0 },
			{ id: 'a2', ...baseArc, title: 'Arc B', order: 1 },
		];
		mockApiGet.mockResolvedValueOnce(arcs);

		const result = await getArcsByProjectId(projectId);
		expect(result.length).toBe(2);
		expect(result[0].title).toBe('Arc A');
		expect(mockApiGet).toHaveBeenCalledWith('/api/db/arcs', { projectId });
	});

	it('updates an arc', async () => {
		mockApiPut.mockResolvedValueOnce({});

		await updateArc('a1', { title: 'Downfall' });
		expect(mockApiPut).toHaveBeenCalledWith('/api/db/arcs/a1', { title: 'Downfall' });
	});

	it('removes an arc', async () => {
		mockApiDel.mockResolvedValueOnce(undefined);

		await removeArc('a1');
		expect(mockApiDel).toHaveBeenCalledWith('/api/db/arcs/a1');
	});

	it('removeArc on nonexistent id does not throw', async () => {
		mockApiDel.mockResolvedValueOnce(undefined);

		await expect(removeArc('nonexistent')).resolves.toBeUndefined();
	});

	it('reorders arcs', async () => {
		mockApiPut.mockResolvedValueOnce({});

		await reorderArcs(projectId, ['a2', 'a1']);
		expect(mockApiPut).toHaveBeenCalledWith('/api/db/arcs/reorder', { orderedIds: ['a2', 'a1'] });
	});

	it('reorderArcs handles empty array', async () => {
		mockApiPut.mockResolvedValueOnce({});

		await expect(reorderArcs(projectId, [])).resolves.toBeUndefined();
	});

	it('returns empty array when project has no arcs', async () => {
		mockApiGet.mockResolvedValueOnce([]);

		const arcs = await getArcsByProjectId('empty-project');
		expect(arcs).toEqual([]);
	});
});
