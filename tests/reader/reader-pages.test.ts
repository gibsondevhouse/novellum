import { describe, it, expect } from 'vitest';
import {
	buildReaderPages,
	chunkSceneContent,
	type ReaderInputChapter,
	type ReaderInputProject,
} from '$modules/reader/reader-pages.js';

const baseProject: ReaderInputProject = {
	id: 'p1',
	title: 'The Lantern',
	logline: 'A lone keeper guards a fading flame.',
	genre: 'Fantasy',
	coverUrl: 'https://example.com/cover.jpg',
};

function chapter(
	id: string,
	title: string,
	order: number,
	scenes: ReaderInputChapter['scenes'],
): ReaderInputChapter {
	return { id, title, order, scenes };
}

describe('reader-pages', () => {
	it('creates cover, title, and toc pages when chapters exist', () => {
		const pages = buildReaderPages(baseProject, [
			chapter('c1', 'Beginnings', 1, [
				{ id: 's1', title: 'Open', order: 1, content: '<p>Hello world.</p>' },
			]),
		]);
		expect(pages[0].type).toBe('cover');
		expect(pages[0].imageUrl).toBe('https://example.com/cover.jpg');
		expect(pages[1].type).toBe('title');
		expect(pages[1].subtitle).toBe('A lone keeper guards a fading flame.');
		expect(pages[2].type).toBe('toc');
		expect(pages[2].content).toContain('1. Beginnings');
	});

	it('omits the toc when there are no chapters and emits cover + title + end', () => {
		const pages = buildReaderPages(baseProject, []);
		const types = pages.map((page) => page.type);
		expect(types).toEqual(['cover', 'title', 'end']);
	});

	it('creates a chapter-title page with chapter index subtitle', () => {
		const pages = buildReaderPages(baseProject, [
			chapter('c1', 'Beginnings', 1, [
				{ id: 's1', title: 'Open', order: 1, content: '<p>Hello.</p>' },
			]),
		]);
		const chapterTitle = pages.find((page) => page.type === 'chapter-title');
		expect(chapterTitle).toBeDefined();
		expect(chapterTitle?.subtitle).toBe('Chapter 1');
		expect(chapterTitle?.title).toBe('Beginnings');
		expect(chapterTitle?.chapterId).toBe('c1');
	});

	it('creates empty-scene pages for scenes without content', () => {
		const pages = buildReaderPages(baseProject, [
			chapter('c1', 'Empty Chapter', 1, [
				{ id: 's1', title: 'Blank Scene', order: 1, content: '' },
			]),
		]);
		const empty = pages.find((page) => page.type === 'empty-scene');
		expect(empty).toBeDefined();
		expect(empty?.content).toMatch(/Scene not written/i);
		expect(empty?.sceneId).toBe('s1');
		expect(empty?.chapterId).toBe('c1');
	});

	it('creates empty-chapter page when a chapter has no scenes', () => {
		const pages = buildReaderPages(baseProject, [chapter('c1', 'Skeleton', 1, [])]);
		const empty = pages.find((page) => page.type === 'empty-chapter');
		expect(empty).toBeDefined();
		expect(empty?.content).toMatch(/No scenes/i);
		expect(empty?.chapterId).toBe('c1');
	});

	it('chunks long scene content into multiple scene pages', () => {
		const paragraph = 'a'.repeat(1800);
		const longContent = `<p>${paragraph}</p><p>${paragraph}</p><p>${paragraph}</p>`;
		const pages = buildReaderPages(baseProject, [
			chapter('c1', 'Long', 1, [
				{ id: 's1', title: 'Marathon', order: 1, content: longContent },
			]),
		]);
		const scenePages = pages.filter((page) => page.type === 'scene' && page.sceneId === 's1');
		expect(scenePages.length).toBeGreaterThan(1);
		for (const page of scenePages) {
			expect(page.chapterId).toBe('c1');
			expect(page.sceneId).toBe('s1');
		}
	});

	it('assigns sequential 1-based pageNumbers', () => {
		const pages = buildReaderPages(baseProject, [
			chapter('c1', 'A', 1, [{ id: 's1', title: 'S', order: 1, content: '<p>Hi.</p>' }]),
		]);
		pages.forEach((page, index) => {
			expect(page.pageNumber).toBe(index + 1);
		});
	});

	it('handles missing coverUrl by leaving imageUrl undefined', () => {
		const pages = buildReaderPages({ ...baseProject, coverUrl: undefined }, []);
		expect(pages[0].type).toBe('cover');
		expect(pages[0].imageUrl).toBeUndefined();
	});

	it('produces an end page as the final entry', () => {
		const pages = buildReaderPages(baseProject, [
			chapter('c1', 'A', 1, [{ id: 's1', title: 'S', order: 1, content: '<p>Hi.</p>' }]),
		]);
		expect(pages[pages.length - 1].type).toBe('end');
	});
});

describe('chunkSceneContent', () => {
	it('returns a single chunk for short text', () => {
		const chunks = chunkSceneContent('Short paragraph.\n\nAnother short.');
		expect(chunks).toHaveLength(1);
	});

	it('returns no chunks for empty text', () => {
		expect(chunkSceneContent('')).toEqual([]);
	});

	it('keeps oversize single paragraph as its own chunk', () => {
		const big = 'x'.repeat(5000);
		const chunks = chunkSceneContent(big);
		expect(chunks).toHaveLength(1);
		expect(chunks[0].length).toBe(5000);
	});
});
