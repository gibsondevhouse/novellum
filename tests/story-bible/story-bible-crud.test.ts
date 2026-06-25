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

const crud = await import('$modules/story-bible/services/story-bible-crud.js');

beforeEach(() => {
	vi.clearAllMocks();
});

describe('story-bible CRUD service', () => {
	it('loads dossier tables by project id', async () => {
		mockApiGet.mockResolvedValue([]);

		await crud.getCharactersByProjectId('project-1');
		await crud.getLocationsByProjectId('project-1');
		await crud.getFactionsByProjectId('project-1');
		await crud.getGlossaryTermsByProjectId('project-1');
		await crud.getThemesByProjectId('project-1');
		await crud.getLoreEntriesByProjectId('project-1');

		expect(mockApiGet).toHaveBeenNthCalledWith(1, '/api/db/characters', { projectId: 'project-1' });
		expect(mockApiGet).toHaveBeenNthCalledWith(2, '/api/db/locations', { projectId: 'project-1' });
		expect(mockApiGet).toHaveBeenNthCalledWith(3, '/api/db/factions', { projectId: 'project-1' });
		expect(mockApiGet).toHaveBeenNthCalledWith(4, '/api/db/glossary_terms', {
			projectId: 'project-1',
		});
		expect(mockApiGet).toHaveBeenNthCalledWith(5, '/api/db/themes', { projectId: 'project-1' });
		expect(mockApiGet).toHaveBeenNthCalledWith(6, '/api/db/lore_entries', {
			projectId: 'project-1',
		});
	});

	it('creates, updates, and deletes a dossier through the table route', async () => {
		mockApiPost.mockResolvedValue({ id: 'theme-1' });
		mockApiPut.mockResolvedValue(undefined);
		mockApiDel.mockResolvedValue(undefined);

		await crud.createTheme({
			projectId: 'project-1',
			title: 'Truth',
			description: '',
			tensionPair: '',
			imagery: '',
		});
		await crud.updateTheme('theme-1', { title: 'Truth vs. Survival' });
		await crud.removeTheme('theme-1');

		expect(mockApiPost).toHaveBeenCalledWith('/api/db/themes', {
			projectId: 'project-1',
			title: 'Truth',
			description: '',
			tensionPair: '',
			imagery: '',
		});
		expect(mockApiPut).toHaveBeenCalledWith('/api/db/themes/theme-1', {
			title: 'Truth vs. Survival',
		});
		expect(mockApiDel).toHaveBeenCalledWith('/api/db/themes/theme-1');
	});
});
