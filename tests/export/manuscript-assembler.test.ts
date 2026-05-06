import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$modules/project/services/project-repository.js', () => ({
	getProjectById: vi.fn(),
}));
vi.mock('$modules/project/services/chapter-repository.js', () => ({
	getChaptersByProjectId: vi.fn(),
}));
vi.mock('$modules/editor/services/scene-repository.js', () => ({
	getScenesByChapterId: vi.fn(),
}));

import { assembleManuscript } from '../../src/modules/export/services/manuscript-assembler.js';
import type { ManuscriptCompileOptions } from '../../src/modules/export/types.js';
import { getProjectById } from '$modules/project/services/project-repository.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
import { getScenesByChapterId } from '$modules/editor/services/scene-repository.js';

const mockGetProjectById = vi.mocked(getProjectById);
const mockGetChaptersByProjectId = vi.mocked(getChaptersByProjectId);
const mockGetScenesByChapterId = vi.mocked(getScenesByChapterId);

const baseOptions: ManuscriptCompileOptions = {
	profileId: 'standard_manuscript',
	metadata: { title: 'Test Novel', author: 'Test Author' },
	includeFrontMatter: true,
	includeBackMatter: false,
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('assembleManuscript', () => {
	it('throws when project not found', async () => {
		mockGetProjectById.mockResolvedValue(null as never);
		await expect(assembleManuscript('missing', baseOptions)).rejects.toThrow(
			'Project not found: missing',
		);
	});

	it('returns chapters in order', async () => {
		mockGetProjectById.mockResolvedValue({ id: 'p1', title: 'Test Novel' } as never);
		mockGetChaptersByProjectId.mockResolvedValue([
			{ id: 'c1', title: 'Chapter 1', order: 0 },
			{ id: 'c2', title: 'Chapter 2', order: 1 },
		] as never);
		mockGetScenesByChapterId.mockResolvedValue([] as never);

		const result = await assembleManuscript('p1', baseOptions);
		expect(result.chapters).toHaveLength(2);
		expect(result.chapters[0].title).toBe('Chapter 1');
		expect(result.chapters[1].title).toBe('Chapter 2');
	});

	it('filters by selectedChapterIds', async () => {
		mockGetProjectById.mockResolvedValue({ id: 'p1', title: 'Test Novel' } as never);
		mockGetChaptersByProjectId.mockResolvedValue([
			{ id: 'c1', title: 'Chapter 1', order: 0 },
			{ id: 'c2', title: 'Chapter 2', order: 1 },
			{ id: 'c3', title: 'Chapter 3', order: 2 },
		] as never);
		mockGetScenesByChapterId.mockResolvedValue([] as never);

		const result = await assembleManuscript('p1', {
			...baseOptions,
			selectedChapterIds: ['c1', 'c3'],
		});
		expect(result.chapters).toHaveLength(2);
		expect(result.chapters[0].id).toBe('c1');
		expect(result.chapters[1].id).toBe('c3');
	});

	it('returns totalWordCount of 0 for empty chapters', async () => {
		mockGetProjectById.mockResolvedValue({ id: 'p1', title: 'Test Novel' } as never);
		mockGetChaptersByProjectId.mockResolvedValue([
			{ id: 'c1', title: 'Chapter 1', order: 0 },
		] as never);
		mockGetScenesByChapterId.mockResolvedValue([] as never);

		const result = await assembleManuscript('p1', baseOptions);
		expect(result.totalWordCount).toBe(0);
	});

	it('sums word counts correctly', async () => {
		mockGetProjectById.mockResolvedValue({ id: 'p1', title: 'Test Novel' } as never);
		mockGetChaptersByProjectId.mockResolvedValue([
			{ id: 'c1', title: 'Chapter 1', order: 0 },
		] as never);
		mockGetScenesByChapterId.mockImplementation(async (chapterId) => {
			if (chapterId === 'c1') {
				return [
					{ id: 's1', title: 'Scene 1', content: 'One two three', order: 0, wordCount: 3 },
					{ id: 's2', title: 'Scene 2', content: 'Four five', order: 1, wordCount: 2 },
				] as never;
			}
			return [] as never;
		});

		const result = await assembleManuscript('p1', baseOptions);
		expect(result.totalWordCount).toBe(5);
	});

	it('compiledAt is a valid ISO string', async () => {
		mockGetProjectById.mockResolvedValue({ id: 'p1', title: 'Test Novel' } as never);
		mockGetChaptersByProjectId.mockResolvedValue([] as never);

		const result = await assembleManuscript('p1', baseOptions);
		expect(() => new Date(result.compiledAt)).not.toThrow();
		expect(result.compiledAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});
});
