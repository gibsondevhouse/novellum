import { describe, it, expect } from 'vitest';
import { buildMarkdown } from '../../src/modules/export/services/markdown-driver.js';
import type { AssembledProject, ExportOptions } from '../../src/modules/export/types.js';

const defaultOptions: ExportOptions = {
	format: 'markdown',
	titlePage: true,
	chapterStyle: 'heading',
	fontFamily: 'Georgia',
	fontSize: 12,
	lineSpacing: 1.5,
};

const assembled: AssembledProject = {
	id: 'p1',
	title: 'My Novel',
	genre: 'Fantasy',
	chapters: [
		{ title: 'The Beginning', order: 0, scenes: ['Scene one text.', 'Scene two text.'] },
		{ title: 'The Middle', order: 1, scenes: ['Scene three text.'] },
	],
};

describe('buildMarkdown', () => {
	it('includes YAML front matter', () => {
		const result = buildMarkdown(assembled, defaultOptions);
		expect(result).toContain('---');
		expect(result).toContain('title: My Novel');
		expect(result).toContain('genre: Fantasy');
		expect(result).toContain('author: Unknown');
	});

	it('chapters appear in order with headings', () => {
		const result = buildMarkdown(assembled, defaultOptions);
		const pos1 = result.indexOf('# The Beginning');
		const pos2 = result.indexOf('# The Middle');
		expect(pos1).toBeGreaterThan(-1);
		expect(pos2).toBeGreaterThan(pos1);
	});

	it('scenes within chapter separated by ---', () => {
		const result = buildMarkdown(assembled, defaultOptions);
		const chIdx = result.indexOf('# The Beginning');
		const chEnd = result.indexOf('# The Middle');
		const chBlock = result.slice(chIdx, chEnd);
		expect(chBlock).toContain('---');
		expect(chBlock).toContain('Scene one text.');
		expect(chBlock).toContain('Scene two text.');
	});

	it('empty project returns only front matter', () => {
		const empty: AssembledProject = { id: 'p2', title: 'Empty', genre: '', chapters: [] };
		const result = buildMarkdown(empty, defaultOptions);
		expect(result).toContain('title: Empty');
		// Should not throw and should only contain front matter
		expect(result.replace(/^---[\s\S]*?---\n/, '').trim()).toBe('');
	});

	it('chapterStyle chapter_number uses Chapter N format', () => {
		const opts = { ...defaultOptions, chapterStyle: 'chapter_number' as const };
		const result = buildMarkdown(assembled, opts);
		expect(result).toContain('# Chapter 1');
		expect(result).toContain('# Chapter 2');
		expect(result).not.toContain('# The Beginning');
	});

	it('chapterStyle both includes number and title', () => {
		const opts = { ...defaultOptions, chapterStyle: 'both' as const };
		const result = buildMarkdown(assembled, opts);
		expect(result).toContain('# Chapter 1: The Beginning');
	});
});
