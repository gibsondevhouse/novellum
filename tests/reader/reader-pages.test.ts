import { describe, it, expect } from 'vitest';
import {
	buildReaderPages,
	chunkSceneContent,
	DEFAULT_READER_PAGE_BOX,
	type ReaderInputChapter,
	type ReaderInputProject,
	type ReaderPageBox,
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

describe('chunkSceneContent — page-box mode', () => {
	const tightBox: ReaderPageBox = { linesPerPage: 6, charsPerLine: 20, minTrailingLines: 2 };

	it('keeps short paragraphs together when they fit', () => {
		const text = ['One.', 'Two.', 'Three.'].join('\n\n');
		const chunks = chunkSceneContent(text, { pageBox: tightBox });
		expect(chunks).toHaveLength(1);
		expect(chunks[0]).toContain('One.');
		expect(chunks[0]).toContain('Three.');
	});

	it('flushes when the next paragraph would overflow the page box', () => {
		const filler = 'x'.repeat(20); // 1 line at charsPerLine: 20
		// 5 single-line paragraphs + 4 inter-paragraph gaps = 9 lines → must split.
		const text = Array.from({ length: 5 }, () => filler).join('\n\n');
		const chunks = chunkSceneContent(text, { pageBox: tightBox });
		expect(chunks.length).toBeGreaterThan(1);
		// No chunk may exceed the line budget for its visible paragraphs.
		for (const chunk of chunks) {
			const paragraphs = chunk.split(/\n\s*\n/g);
			const visualLines = paragraphs.reduce(
				(total, paragraph, index) =>
					total + Math.ceil(paragraph.length / tightBox.charsPerLine) + (index === 0 ? 0 : 1),
				0,
			);
			expect(visualLines).toBeLessThanOrEqual(tightBox.linesPerPage);
		}
	});

	it('keeps an oversize paragraph on its own page rather than splitting mid-word', () => {
		const giant = 'a'.repeat(tightBox.linesPerPage * tightBox.charsPerLine * 3);
		const text = `Lead paragraph.\n\n${giant}\n\nTrailing paragraph.`;
		const chunks = chunkSceneContent(text, { pageBox: tightBox });
		const giantChunk = chunks.find((chunk) => chunk.includes(giant));
		expect(giantChunk).toBeDefined();
		expect(giantChunk).toBe(giant);
	});

	it('respects the anti-widow rule: never strands a 1-line tail at the top of a page', () => {
		// 5-line paragraph entered when the current page already has 5 lines used → would
		// leave only 1 line of headroom on the current page, creating a 4-line widow start
		// on the next. Engine must push the whole paragraph forward.
		const fiveLineParagraph = 'y'.repeat(tightBox.charsPerLine * 5);
		const lead = 'z'.repeat(tightBox.charsPerLine * 4); // exactly 4 lines on page 1
		const text = `${lead}\n\n${fiveLineParagraph}`;
		const chunks = chunkSceneContent(text, {
			pageBox: { ...tightBox, minTrailingLines: 2 },
		});
		// The 5-line paragraph must start at the beginning of a chunk, not be split.
		const tailChunk = chunks.find((chunk) => chunk.includes(fiveLineParagraph));
		expect(tailChunk).toBeDefined();
		expect(tailChunk).toBe(fiveLineParagraph);
	});

	it('returns no chunks for empty text in page-box mode', () => {
		expect(chunkSceneContent('', { pageBox: tightBox })).toEqual([]);
	});

	it('exports a default page box that matches stage-002 typography assumptions', () => {
		expect(DEFAULT_READER_PAGE_BOX.linesPerPage).toBeGreaterThanOrEqual(20);
		expect(DEFAULT_READER_PAGE_BOX.charsPerLine).toBeGreaterThanOrEqual(50);
		expect(DEFAULT_READER_PAGE_BOX.minTrailingLines).toBeGreaterThanOrEqual(1);
	});

	it('honors page-box mode when threaded through buildReaderPages', () => {
		const project: ReaderInputProject = { id: 'p', title: 'Test' };
		const longParagraph = 'q'.repeat(200);
		const content = Array.from({ length: 4 }, () => `<p>${longParagraph}</p>`).join('');
		const chapters: ReaderInputChapter[] = [
			{
				id: 'c1',
				title: 'Tight',
				order: 1,
				scenes: [{ id: 's1', title: 'Cap', order: 1, content }],
			},
		];
		const pages = buildReaderPages(project, chapters, { pageBox: tightBox });
		const scenePages = pages.filter((page) => page.type === 'scene');
		// 4 paragraphs of 200 chars at 20 chars/line = 10 lines each → cannot share a 6-line page.
		expect(scenePages.length).toBe(4);
	});
});
