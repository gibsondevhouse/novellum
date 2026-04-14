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

const { createProject, getProjectById, getAllProjects, updateProject, removeProject } =
	await import('../../src/modules/project/services/project-repository.js');

beforeEach(() => {
	vi.clearAllMocks();
});

describe('project-repository', () => {
	it('creates a project with auto-generated id and timestamps', async () => {
		const data = {
			title: 'Test Novel',
			genre: 'Fantasy',
			status: 'draft',
			logline: '',
			synopsis: '',
			targetWordCount: 80000,
		};
		const returned = { id: 'p1', ...data, createdAt: '2026-01-01', updatedAt: '2026-01-01' };
		mockApiPost.mockResolvedValueOnce(returned);

		const p = await createProject(data);
		expect(p.id).toBe('p1');
		expect(p.title).toBe('Test Novel');
		expect(mockApiPost).toHaveBeenCalledWith('/api/db/projects', data);
	});

	it('retrieves a project by id', async () => {
		const project = {
			id: 'p1',
			title: 'Found',
			genre: 'Sci-Fi',
			status: 'draft',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			createdAt: '2026-01-01',
			updatedAt: '2026-01-01',
		};
		mockApiGet.mockResolvedValueOnce(project);

		const found = await getProjectById('p1');
		expect(found).toBeDefined();
		expect(found!.title).toBe('Found');
		expect(mockApiGet).toHaveBeenCalledWith('/api/db/projects/p1');
	});

	it('returns undefined for a nonexistent id', async () => {
		mockApiGet.mockRejectedValueOnce(new MockApiError('Not found', 404));

		const found = await getProjectById('nonexistent-id');
		expect(found).toBeUndefined();
	});

	it('returns all projects', async () => {
		const projects = [
			{ id: 'p1', title: 'A' },
			{ id: 'p2', title: 'B' },
		];
		mockApiGet.mockResolvedValueOnce(projects);

		const all = await getAllProjects();
		expect(all.length).toBe(2);
		expect(mockApiGet).toHaveBeenCalledWith('/api/db/projects');
	});

	it('updates a project field', async () => {
		mockApiPut.mockResolvedValueOnce({});

		await updateProject('p1', { title: 'New Title' });
		expect(mockApiPut).toHaveBeenCalledWith('/api/db/projects/p1', { title: 'New Title' });
	});

	it('removes a project', async () => {
		mockApiDel.mockResolvedValueOnce(undefined);

		await removeProject('p1');
		expect(mockApiDel).toHaveBeenCalledWith('/api/db/projects/p1');
	});
});
