import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
	AssembledManuscript,
	ManuscriptCompileOptions,
	ManuscriptExportRequest,
} from '../types.js';

vi.mock('$modules/project/services/project-repository.js', () => ({
	getProjectById: vi.fn(),
}));

vi.mock('./manuscript-assembler.js', () => ({
	assembleManuscript: vi.fn(),
}));

import { getProjectById } from '$modules/project/services/project-repository.js';
import { assembleManuscript } from './manuscript-assembler.js';
import { createExportFilename, ExportServiceError, exportProject } from './export-service.js';

const mockGetProjectById = vi.mocked(getProjectById);
const mockAssembleManuscript = vi.mocked(assembleManuscript);

function makeRequest(overrides: Partial<ManuscriptExportRequest> = {}): ManuscriptExportRequest {
	return {
		exportOptions: {
			format: 'markdown',
			titlePage: true,
			chapterStyle: 'heading',
			fontFamily: 'Georgia',
			fontSize: 12,
			lineSpacing: 1.5,
		},
		compileOptions: {
			profileId: 'standard_manuscript',
			metadata: { title: 'Requested Novel', author: 'Ada' },
			selectedChapterIds: ['c2'],
			includeFrontMatter: true,
			includeBackMatter: false,
		},
		deliveryPreference: 'browser_download',
		...overrides,
	};
}

function makeManuscript(options: ManuscriptCompileOptions): AssembledManuscript {
	return {
		projectId: 'p1',
		profileId: options.profileId,
		metadata: options.metadata,
		chapters: [
			{
				id: 'c2',
				title: 'Chapter Two',
				order: 1,
				scenes: [{ id: 's1', title: '', content: 'Scene content.', wordCount: 2, order: 0 }],
			},
		],
		totalWordCount: 2,
		compiledAt: '2026-06-01T00:00:00.000Z',
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	mockGetProjectById.mockResolvedValue({ id: 'p1', title: 'Project Novel' } as never);
	mockAssembleManuscript.mockImplementation(async (_projectId, options) => makeManuscript(options));
});

describe('exportProject', () => {
	it('passes requested metadata, profile, and selected chapters to the assembler', async () => {
		const request = makeRequest();

		const result = await exportProject('p1', request);

		expect(mockAssembleManuscript).toHaveBeenCalledWith(
			'p1',
			expect.objectContaining({
				profileId: 'standard_manuscript',
				metadata: { title: 'Requested Novel', author: 'Ada' },
				selectedChapterIds: ['c2'],
				includeFrontMatter: true,
				includeBackMatter: false,
			}),
		);
		expect(result.filename).toBe('requested_novel.md');
		expect(await result.blob.text()).toContain('author: Ada');
	});

	it('keeps legacy ExportOptions calls working', async () => {
		await exportProject('p1', {
			format: 'markdown',
			titlePage: false,
			chapterStyle: 'heading',
			fontFamily: 'Georgia',
			fontSize: 12,
			lineSpacing: 1.5,
		});

		expect(mockAssembleManuscript).toHaveBeenCalledWith(
			'p1',
			expect.objectContaining({
				profileId: 'reader_copy',
				metadata: { title: 'Project Novel' },
				includeFrontMatter: false,
				includeBackMatter: false,
			}),
		);
	});

	it('rejects an empty selected chapter list instead of exporting all chapters', async () => {
		await expect(
			exportProject(
				'p1',
				makeRequest({
					compileOptions: {
						...makeRequest().compileOptions,
						selectedChapterIds: [],
					},
				}),
			),
		).rejects.toMatchObject({ code: 'invalid_chapter_selection' });
		expect(mockAssembleManuscript).not.toHaveBeenCalled();
	});

	it('throws a normalized missing project error', async () => {
		mockGetProjectById.mockResolvedValue(null as never);

		await expect(exportProject('missing', makeRequest())).rejects.toBeInstanceOf(
			ExportServiceError,
		);
		await expect(exportProject('missing', makeRequest())).rejects.toMatchObject({
			code: 'missing_project',
		});
	});

	it('rejects unsupported formats', async () => {
		await expect(
			exportProject(
				'p1',
				makeRequest({
					exportOptions: {
						...makeRequest().exportOptions,
						format: 'pdf' as never,
					},
				}),
			),
		).rejects.toMatchObject({ code: 'unsupported_format' });
	});
});

describe('createExportFilename', () => {
	it('sanitizes filenames deterministically', () => {
		expect(createExportFilename('The "Great" Novel: Part 1', 'markdown')).toBe(
			'the_great_novel_part_1.md',
		);
	});

	it('falls back for empty titles', () => {
		expect(createExportFilename('', 'docx')).toBe('untitled_manuscript.docx');
	});
});
