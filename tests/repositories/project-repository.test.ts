import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../../src/lib/db/index.js';
import {
	createProject,
	getProjectById,
	getAllProjects,
	updateProject,
	removeProject,
} from '../../src/modules/project/services/project-repository.js';

beforeEach(async () => {
	await db.projects.clear();
});

describe('project-repository', () => {
	it('creates a project with auto-generated id and timestamps', async () => {
		const p = await createProject({
			title: 'Test Novel',
			genre: 'Fantasy',
			status: 'draft',
			logline: '',
			synopsis: '',
			targetWordCount: 80000,
		});
		expect(p.id).toBeDefined();
		expect(p.title).toBe('Test Novel');
		expect(p.createdAt).toBeDefined();
		expect(p.updatedAt).toBeDefined();
	});

	it('retrieves a project by id', async () => {
		const created = await createProject({
			title: 'Found',
			genre: 'Sci-Fi',
			status: 'draft',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
		});
		const found = await getProjectById(created.id);
		expect(found).toBeDefined();
		expect(found!.title).toBe('Found');
	});

	it('returns undefined for a nonexistent id', async () => {
		const found = await getProjectById('nonexistent-id');
		expect(found).toBeUndefined();
	});

	it('returns all projects', async () => {
		await createProject({
			title: 'A',
			genre: 'Horror',
			status: 'draft',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
		});
		await createProject({
			title: 'B',
			genre: 'Romance',
			status: 'draft',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
		});
		const all = await getAllProjects();
		expect(all.length).toBeGreaterThanOrEqual(2);
	});

	it('updates a project field', async () => {
		const p = await createProject({
			title: 'Old Title',
			genre: 'Thriller',
			status: 'draft',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
		});
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(Date.now() + 1000));
		await updateProject(p.id, { title: 'New Title' });
		vi.useRealTimers();
		const updated = await getProjectById(p.id);
		expect(updated!.title).toBe('New Title');
		expect(updated!.updatedAt).not.toBe(p.updatedAt);
	});

	it('removes a project', async () => {
		const p = await createProject({
			title: 'To Delete',
			genre: 'Mystery',
			status: 'draft',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
		});
		await removeProject(p.id);
		const found = await getProjectById(p.id);
		expect(found).toBeUndefined();
	});
});
