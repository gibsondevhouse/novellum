import { describe, it, expect } from 'vitest';
import { buildDocx } from '../../src/modules/export/services/docx-driver.js';
import type { AssembledManuscript } from '../../src/modules/export/types.js';

function makeManuscript(overrides: Partial<AssembledManuscript> = {}): AssembledManuscript {
	return {
		projectId: 'p1',
		profileId: 'standard_manuscript',
		metadata: { title: 'Docx Novel', author: 'Test Author', copyright: '© 2026' },
		chapters: [
			{
				id: 'c1',
				title: 'Chapter One',
				order: 0,
				scenes: [
					{ id: 's1', title: 'Intro', content: 'Scene content here.', wordCount: 3, order: 0 },
				],
			},
		],
		totalWordCount: 3,
		compiledAt: new Date().toISOString(),
		...overrides,
	};
}

describe('buildDocx', () => {
	it('returns a Blob', async () => {
		const result = await buildDocx(makeManuscript());
		expect(result).toBeInstanceOf(Blob);
	});

	it('returns a Blob with docx mime type', async () => {
		const result = await buildDocx(makeManuscript());
		expect(result.type).toBe(
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		);
	});

	it('produces non-empty Blob content', async () => {
		const result = await buildDocx(makeManuscript());
		expect(result.size).toBeGreaterThan(0);
	});

	it('produces a Blob when includeFrontMatter is true (standard_manuscript)', async () => {
		const result = await buildDocx(makeManuscript({ profileId: 'standard_manuscript' }));
		expect(result).toBeInstanceOf(Blob);
		expect(result.size).toBeGreaterThan(0);
	});

	it('produces a Blob when profile omits front matter (plain_text_archive)', async () => {
		const result = await buildDocx(makeManuscript({ profileId: 'plain_text_archive' }));
		expect(result).toBeInstanceOf(Blob);
		expect(result.size).toBeGreaterThan(0);
	});

	it('handles chapters with no scenes without throwing', async () => {
		const manuscript = makeManuscript();
		manuscript.chapters[0].scenes = [];
		const result = await buildDocx(manuscript);
		expect(result).toBeInstanceOf(Blob);
	});
});
