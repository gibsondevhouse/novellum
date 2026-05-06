import { describe, it, expect } from 'vitest';
import { buildMarkdown } from '../../src/modules/export/services/markdown-driver.js';
import type { AssembledManuscript } from '../../src/modules/export/types.js';

const assembled: AssembledManuscript = {
	projectId: 'p1',
	profileId: 'standard_manuscript',
	metadata: { title: 'My Novel', author: 'Jane Author' },
	chapters: [
		{
			id: 'c1',
			title: 'The Beginning',
			order: 0,
			scenes: [
				{ id: 's1', title: 'Opening', content: 'Scene one text.', wordCount: 3, order: 0 },
				{ id: 's2', title: '', content: 'Scene two text.', wordCount: 3, order: 1 },
			],
		},
		{
			id: 'c2',
			title: 'The Middle',
			order: 1,
			scenes: [
				{ id: 's3', title: '', content: 'Scene three text.', wordCount: 3, order: 0 },
			],
		},
	],
	totalWordCount: 9,
	compiledAt: new Date().toISOString(),
};

describe('buildMarkdown', () => {
	it('includes YAML front matter', () => {
		const result = buildMarkdown(assembled);
		expect(result).toContain('---');
		expect(result).toContain('title: My Novel');
		expect(result).toContain('author: Jane Author');
	});

	it('chapters appear in order with ## headings', () => {
		const result = buildMarkdown(assembled);
		const pos1 = result.indexOf('## The Beginning');
		const pos2 = result.indexOf('## The Middle');
		expect(pos1).toBeGreaterThan(-1);
		expect(pos2).toBeGreaterThan(pos1);
	});

	it('scenes within chapter separated by ---', () => {
		const result = buildMarkdown(assembled);
		const chIdx = result.indexOf('## The Beginning');
		const chEnd = result.indexOf('## The Middle');
		const chBlock = result.slice(chIdx, chEnd);
		expect(chBlock).toContain('---');
		expect(chBlock).toContain('Scene one text.');
		expect(chBlock).toContain('Scene two text.');
	});

	it('empty project returns only front matter', () => {
		const empty: AssembledManuscript = {
			projectId: 'p2',
			profileId: 'plain_text_archive',
			metadata: { title: 'Empty' },
			chapters: [],
			totalWordCount: 0,
			compiledAt: new Date().toISOString(),
		};
		const result = buildMarkdown(empty);
		expect(result).toContain('title: Empty');
		expect(result.replace(/^---[\s\S]*?---\n/, '').trim()).toBe('');
	});

	it('falls back to Unknown when author is absent', () => {
		const noAuthor: AssembledManuscript = {
			...assembled,
			metadata: { title: 'My Novel' },
		};
		const result = buildMarkdown(noAuthor);
		expect(result).toContain('author: Unknown');
	});
});

