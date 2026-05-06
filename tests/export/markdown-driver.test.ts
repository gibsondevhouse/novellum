import { describe, it, expect } from 'vitest';
import { buildMarkdown } from '../../src/modules/export/services/markdown-driver.js';
import type { AssembledManuscript } from '../../src/modules/export/types.js';

function makeManuscript(overrides: Partial<AssembledManuscript> = {}): AssembledManuscript {
	return {
		projectId: 'p1',
		profileId: 'standard_manuscript',
		metadata: { title: 'Test Novel', author: 'Ada Lovelace' },
		chapters: [
			{
				id: 'c1',
				title: 'Chapter One',
				order: 0,
				scenes: [
					{ id: 's1', title: 'Scene A', content: 'First scene content.', wordCount: 3, order: 0 },
					{ id: 's2', title: '', content: 'Second scene content.', wordCount: 3, order: 1 },
				],
			},
			{
				id: 'c2',
				title: 'Chapter Two',
				order: 1,
				scenes: [
					{ id: 's3', title: '', content: 'Third scene content.', wordCount: 3, order: 0 },
				],
			},
		],
		totalWordCount: 9,
		compiledAt: new Date().toISOString(),
		...overrides,
	};
}

describe('buildMarkdown', () => {
	it('uses author from metadata', () => {
		const result = buildMarkdown(makeManuscript());
		expect(result).toContain('author: Ada Lovelace');
	});

	it('falls back to Unknown when author is absent', () => {
		const result = buildMarkdown(makeManuscript({ metadata: { title: 'No Author' } }));
		expect(result).toContain('author: Unknown');
	});

	it('falls back to Unknown when author is empty string', () => {
		const result = buildMarkdown(makeManuscript({ metadata: { title: 'No Author', author: '' } }));
		expect(result).toContain('author: Unknown');
	});

	it('uses ## headings for chapters', () => {
		const result = buildMarkdown(makeManuscript());
		expect(result).toContain('## Chapter One');
		expect(result).toContain('## Chapter Two');
	});

	it('uses ### heading for named scenes, omits heading for unnamed scenes', () => {
		const result = buildMarkdown(makeManuscript());
		expect(result).toContain('### Scene A');
		// unnamed scene has no heading prefix
		const headings = result.match(/^###\s/gm);
		expect(headings).toHaveLength(1);
	});

	it('separates scenes within a chapter with ---', () => {
		const result = buildMarkdown(makeManuscript());
		const c1Start = result.indexOf('## Chapter One');
		const c2Start = result.indexOf('## Chapter Two');
		const c1Block = result.slice(c1Start, c2Start);
		expect(c1Block).toContain('---');
	});

	it('includes YAML front matter block', () => {
		const result = buildMarkdown(makeManuscript());
		expect(result).toMatch(/^---\n/);
		expect(result).toContain('title: Test Novel');
	});

	it('omits subtitle from front matter when absent', () => {
		const result = buildMarkdown(makeManuscript());
		expect(result).not.toContain('subtitle:');
	});

	it('includes subtitle in front matter when provided', () => {
		const result = buildMarkdown(
			makeManuscript({ metadata: { title: 'T', author: 'A', subtitle: 'A Subtitle' } }),
		);
		expect(result).toContain('subtitle: A Subtitle');
	});

	it('includes synopsis in front matter when provided', () => {
		const result = buildMarkdown(
			makeManuscript({ metadata: { title: 'T', author: 'A', synopsis: 'The synopsis.' } }),
		);
		expect(result).toContain('synopsis: The synopsis.');
	});

	it('plain_text_archive profile omits title block', () => {
		const result = buildMarkdown(makeManuscript({ profileId: 'plain_text_archive' }));
		// Should not have `# Title` block (only ## chapter headings)
		expect(result).not.toMatch(/^# Test Novel/m);
	});

	it('standard_manuscript profile adds title block', () => {
		const result = buildMarkdown(makeManuscript());
		expect(result).toContain('# Test Novel');
	});
});
