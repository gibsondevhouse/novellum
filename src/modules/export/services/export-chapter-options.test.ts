import { describe, expect, it } from 'vitest';
import {
	createChapterOptionLabel,
	ExportChapterOptionsError,
	getExportChapterOptions,
} from './export-chapter-options.js';

describe('createChapterOptionLabel', () => {
	it('builds a stable fallback label for unnamed chapters', () => {
		expect(createChapterOptionLabel('', 2, 2)).toBe('Chapter 3 - Untitled chapter 3');
	});
});

describe('getExportChapterOptions', () => {
	it('returns chapters in repository order', async () => {
		const result = await getExportChapterOptions('p1', {
			getProjectById: async () => ({ id: 'p1', title: 'Novel' }) as never,
			getChaptersByProjectId: async () =>
				[
					{ id: 'c2', title: 'Second', order: 1 },
					{ id: 'c1', title: 'First', order: 0 },
				] as never,
		});

		expect(result.map((chapter) => chapter.id)).toEqual(['c2', 'c1']);
	});

	it('handles empty chapter lists', async () => {
		const result = await getExportChapterOptions('p1', {
			getProjectById: async () => ({ id: 'p1', title: 'Novel' }) as never,
			getChaptersByProjectId: async () => [] as never,
		});

		expect(result).toEqual([]);
	});

	it('uses fallback titles for missing names', async () => {
		const result = await getExportChapterOptions('p1', {
			getProjectById: async () => ({ id: 'p1', title: 'Novel' }) as never,
			getChaptersByProjectId: async () => [{ id: 'c1', title: '', order: 0 }] as never,
		});

		expect(result[0]).toEqual({
			id: 'c1',
			title: 'Untitled chapter 1',
			order: 0,
			label: 'Chapter 1 - Untitled chapter 1',
		});
	});

	it('throws a controlled error when the project is missing', async () => {
		await expect(
			getExportChapterOptions('missing', {
				getProjectById: async () => null as never,
				getChaptersByProjectId: async () => [] as never,
			}),
		).rejects.toBeInstanceOf(ExportChapterOptionsError);
	});
});
