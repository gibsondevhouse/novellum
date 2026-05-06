import { beforeEach, describe, expect, it, vi } from 'vitest';

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
	createRelationship,
	getRelationshipsByProjectId,
	updateRelationship,
	removeRelationship,
} = await import('../../src/modules/world-building/services/character-repository.js');

beforeEach(() => {
	vi.clearAllMocks();
});

describe('character-repository relationships', () => {
	it('creates relationship with status payload', async () => {
		const payload = {
			projectId: 'proj-1',
			characterAId: 'char-a',
			characterBId: 'char-b',
			type: 'Ally',
			status: 'Tense',
			description: 'Trust is breaking down',
		};

		mockApiPost.mockResolvedValueOnce({ id: 'rel-1', ...payload, createdAt: '', updatedAt: '' });

		await createRelationship(payload);

		expect(mockApiPost).toHaveBeenCalledWith('/api/db/character_relationships', payload);
	});

	it('updates relationship type/status/description', async () => {
		mockApiPut.mockResolvedValueOnce({
			id: 'rel-1',
			type: 'Rival',
			status: 'Volatile',
			description: 'Open conflict',
		});

		await updateRelationship('rel-1', {
			type: 'Rival',
			status: 'Volatile',
			description: 'Open conflict',
		});

		expect(mockApiPut).toHaveBeenCalledWith('/api/db/character_relationships/rel-1', {
			type: 'Rival',
			status: 'Volatile',
			description: 'Open conflict',
		});
	});

	it('gets and deletes relationships by project id and id', async () => {
		mockApiGet.mockResolvedValueOnce([{ id: 'rel-1' }]);
		mockApiDel.mockResolvedValueOnce(undefined);

		await getRelationshipsByProjectId('proj-1');
		await removeRelationship('rel-1');

		expect(mockApiGet).toHaveBeenCalledWith('/api/db/character_relationships', {
			projectId: 'proj-1',
		});
		expect(mockApiDel).toHaveBeenCalledWith('/api/db/character_relationships/rel-1');
	});
});
