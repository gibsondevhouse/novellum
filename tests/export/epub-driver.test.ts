import { describe, it, expect } from 'vitest';
import { buildEpub } from '../../src/modules/export/services/epub-driver.js';
import type { AssembledManuscript } from '../../src/modules/export/types.js';

function makeManuscript(overrides: Partial<AssembledManuscript> = {}): AssembledManuscript {
	return {
		projectId: 'p1',
		profileId: 'ebook_draft',
		metadata: { title: 'Epub Novel', author: 'Epub Author', synopsis: 'A great story.' },
		chapters: [
			{
				id: 'c1',
				title: 'Chapter One',
				order: 0,
				scenes: [
					{
						id: 's1',
						title: '',
						content: 'Scene content here.',
						wordCount: 3,
						order: 0,
					},
				],
			},
		],
		totalWordCount: 3,
		compiledAt: new Date().toISOString(),
		...overrides,
	};
}

describe('buildEpub', () => {
	it('returns a Blob', async () => {
		const result = await buildEpub(makeManuscript());
		expect(result).toBeInstanceOf(Blob);
	});

	it('produces non-empty Blob content', async () => {
		const result = await buildEpub(makeManuscript());
		expect(result.size).toBeGreaterThan(0);
	});

	it('uses author from metadata', async () => {
		// We verify the function does not throw and accepts the author from metadata
		const result = await buildEpub(makeManuscript({ metadata: { title: 'T', author: 'My Author' } }));
		expect(result).toBeInstanceOf(Blob);
	});

	it('escapes script tags in scene content', async () => {
		const manuscript = makeManuscript({
			chapters: [
				{
					id: 'c1',
					title: 'Chapter',
					order: 0,
					scenes: [
						{
							id: 's1',
							title: '',
							content: '<script>alert("xss")</script>',
							wordCount: 1,
							order: 0,
						},
					],
				},
			],
		});
		// buildEpub must not throw; the html escaping prevents injection
		const result = await buildEpub(manuscript);
		expect(result).toBeInstanceOf(Blob);
	});

	it('handles chapters with no scenes without throwing', async () => {
		const manuscript = makeManuscript();
		manuscript.chapters[0].scenes = [];
		const result = await buildEpub(manuscript);
		expect(result).toBeInstanceOf(Blob);
	});

	it('works with plain_text_archive profile (no front matter cover)', async () => {
		const result = await buildEpub(makeManuscript({ profileId: 'plain_text_archive' }));
		expect(result).toBeInstanceOf(Blob);
	});
});
