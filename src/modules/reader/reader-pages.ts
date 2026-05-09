export type ReaderPageType =
	| 'cover'
	| 'title'
	| 'toc'
	| 'chapter-title'
	| 'scene'
	| 'empty-scene'
	| 'empty-chapter'
	| 'end';

export interface ReaderPage {
	id: string;
	type: ReaderPageType;
	title?: string;
	subtitle?: string;
	chapterId?: string;
	sceneId?: string;
	chapterTitle?: string;
	sceneTitle?: string;
	content?: string;
	imageUrl?: string;
	pageNumber?: number;
}

export interface ReaderInputScene {
	id: string;
	title: string;
	order: number;
	content: string;
}

export interface ReaderInputChapter {
	id: string;
	title: string;
	order: number;
	scenes: ReaderInputScene[];
}

export interface ReaderInputProject {
	id: string;
	title: string;
	logline?: string;
	genre?: string;
	coverUrl?: string;
}

export interface ReaderPageBox {
	/**
	 * Visible text lines that fit within a single reader page. Derived from the
	 * rendered page-box height divided by line-height (see strategy-spike.md).
	 */
	linesPerPage: number;
	/**
	 * Approximate characters that fit on a single visual line at the chosen
	 * typography. Derived from `--reader-measure-max` (68ch) at the reader
	 * prose font.
	 */
	charsPerLine: number;
	/**
	 * Anti-orphan rule: if a flush would leave the next page with fewer than
	 * this many lines of a paragraph, push the paragraph forward instead.
	 * Defaults to 2 (one-line widows are forbidden).
	 */
	minTrailingLines?: number;
}

export interface BuildReaderPagesOptions {
	/**
	 * Preferred: explicit page-box geometry. When provided this takes
	 * precedence over the legacy character-budget options below.
	 */
	pageBox?: ReaderPageBox;
	/** Approximate target characters per page for scene chunking. Default 2100. */
	targetCharsPerPage?: number;
	/** Min characters per page before forcing a chunk break. Default 1500. */
	minCharsPerPage?: number;
}

const DEFAULT_TARGET = 2100;
const DEFAULT_MIN = 1500;

/**
 * Default page box matching stage-002 reader typography:
 *   - --reader-prose-size: 18px
 *   - --reader-prose-leading: 1.75 → ~31.5px line height
 *   - --reader-measure-max: 68ch (~64 chars at the chosen serif)
 *   - page-box height ≈ 880px content area → ~28 lines.
 *
 * Re-derive at the call site if the reader tokens change so the engine stays
 * deterministic but tracks visual reality.
 */
export const DEFAULT_READER_PAGE_BOX: Readonly<Required<ReaderPageBox>> = Object.freeze({
	linesPerPage: 28,
	charsPerLine: 64,
	minTrailingLines: 2,
});

const SCENE_NOT_WRITTEN = 'Scene not written yet.';
const CHAPTER_NOT_WRITTEN = 'No scenes in this chapter yet.';

/** Minimum visual lines a paragraph occupies (a single-word paragraph still costs one line). */
function estimateParagraphLines(text: string, charsPerLine: number): number {
	if (charsPerLine <= 0) return 1;
	const length = text.length;
	if (length === 0) return 1;
	return Math.max(1, Math.ceil(length / charsPerLine));
}

export function extractReadableText(html: string): string {
	if (!html.trim()) return '';
	if (typeof DOMParser === 'undefined') {
		// Fallback: very light HTML strip for non-DOM environments.
		return html
			.replace(/<\/(p|div|h[1-6]|li|blockquote|br)>/gi, '\n\n')
			.replace(/<br\s*\/?\s*>/gi, '\n')
			.replace(/<[^>]+>/g, '')
			.replace(/\u00a0/g, ' ')
			.replace(/\n{3,}/g, '\n\n')
			.trim();
	}
	const doc = new DOMParser().parseFromString(html, 'text/html');
	const blocks = Array.from(
		doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote'),
	);
	if (blocks.length > 0) {
		const chunks = blocks.map((node) => node.textContent?.trim() ?? '').filter(Boolean);
		return chunks.join('\n\n');
	}
	return (doc.body.textContent ?? '').trim();
}

function splitParagraphs(text: string): string[] {
	return text
		.split(/\n\s*\n/g)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
}

/**
 * Group paragraphs into deterministic chunks that respect a page-box budget.
 *
 * When `options.pageBox` is supplied the engine uses line-aware accounting
 * (paragraph lines + inter-paragraph gap) and an anti-orphan rule that pushes
 * a paragraph to the next page rather than leaving a sub-`minTrailingLines`
 * widow at the top.
 *
 * When `options.pageBox` is omitted the engine falls back to the legacy
 * character-budget heuristic. Both modes preserve paragraph boundaries and
 * keep oversize paragraphs intact (rather than splitting mid-word).
 */
export function chunkSceneContent(text: string, options: BuildReaderPagesOptions = {}): string[] {
	const paragraphs = splitParagraphs(text);
	if (paragraphs.length === 0) return [];

	if (options.pageBox) {
		return chunkByPageBox(paragraphs, options.pageBox);
	}

	const target = options.targetCharsPerPage ?? DEFAULT_TARGET;
	const min = Math.min(options.minCharsPerPage ?? DEFAULT_MIN, target);
	return chunkByCharBudget(paragraphs, target, min);
}

function chunkByCharBudget(paragraphs: string[], target: number, min: number): string[] {
	const pages: string[] = [];
	let current: string[] = [];
	let currentLength = 0;

	for (const paragraph of paragraphs) {
		const paragraphLength = paragraph.length;
		if (current.length === 0) {
			current.push(paragraph);
			currentLength = paragraphLength;
			continue;
		}
		const projected = currentLength + 2 + paragraphLength;
		if (projected <= target) {
			current.push(paragraph);
			currentLength = projected;
			continue;
		}
		if (currentLength >= min || paragraphLength > target) {
			pages.push(current.join('\n\n'));
			current = [paragraph];
			currentLength = paragraphLength;
		} else {
			current.push(paragraph);
			currentLength = projected;
		}
	}

	if (current.length > 0) {
		pages.push(current.join('\n\n'));
	}

	return pages;
}

function chunkByPageBox(paragraphs: string[], pageBox: ReaderPageBox): string[] {
	const linesPerPage = Math.max(1, Math.floor(pageBox.linesPerPage));
	const charsPerLine = Math.max(1, Math.floor(pageBox.charsPerLine));
	const minTrailing = Math.max(1, Math.floor(pageBox.minTrailingLines ?? 2));

	const pages: string[] = [];
	let current: string[] = [];
	let currentLines = 0;

	for (const paragraph of paragraphs) {
		const lines = estimateParagraphLines(paragraph, charsPerLine);
		const gap = current.length === 0 ? 0 : 1;
		const projected = currentLines + gap + lines;

		if (projected <= linesPerPage) {
			current.push(paragraph);
			currentLines = projected;
			continue;
		}

		// Would overflow. Decide how to split.
		const remainingOnCurrent = linesPerPage - currentLines - gap;
		if (current.length === 0) {
			// Oversize single paragraph: keep it on its own page rather than
			// splitting mid-word. Reading layer applies overflow-wrap: anywhere.
			pages.push(paragraph);
			current = [];
			currentLines = 0;
			continue;
		}

		// Anti-widow guard: if the carry-over to the next page would leave the
		// paragraph with fewer than `minTrailing` lines on either side, prefer
		// flushing the current page and giving the next one the whole paragraph.
		const wouldOverflowBy = projected - linesPerPage;
		const carryLines = lines - Math.max(0, remainingOnCurrent);
		const wouldOrphan =
			remainingOnCurrent > 0 && remainingOnCurrent < minTrailing && lines > remainingOnCurrent;
		const wouldWidow = carryLines > 0 && carryLines < minTrailing && lines > carryLines;

		void wouldOverflowBy; // reserved for future tuning

		if (wouldOrphan || wouldWidow) {
			pages.push(current.join('\n\n'));
			current = [paragraph];
			currentLines = lines;
			continue;
		}

		// Default: flush the current page and start the next with this paragraph.
		pages.push(current.join('\n\n'));
		current = [paragraph];
		currentLines = lines;
	}

	if (current.length > 0) {
		pages.push(current.join('\n\n'));
	}

	return pages;
}

export function buildReaderPages(
	project: ReaderInputProject,
	chapters: ReaderInputChapter[],
	options: BuildReaderPagesOptions = {},
): ReaderPage[] {
	const pages: ReaderPage[] = [];
	const coverUrl = project.coverUrl?.trim() ?? '';

	pages.push({
		id: 'page:cover',
		type: 'cover',
		title: project.title,
		imageUrl: coverUrl ? coverUrl : undefined,
	});

	pages.push({
		id: 'page:title',
		type: 'title',
		title: project.title,
		subtitle: project.logline?.trim() || undefined,
		content: project.genre?.trim() || undefined,
	});

	if (chapters.length > 0) {
		pages.push({
			id: 'page:toc',
			type: 'toc',
			title: 'Contents',
			content: chapters.map((chapter, index) => `${index + 1}. ${chapter.title || `Chapter ${index + 1}`}`).join('\n'),
		});
	}

	chapters.forEach((chapter, chapterIndex) => {
		const chapterTitle = chapter.title || `Chapter ${chapterIndex + 1}`;
		pages.push({
			id: `chapter:${chapter.id}:title`,
			type: 'chapter-title',
			chapterId: chapter.id,
			chapterTitle,
			title: chapterTitle,
			subtitle: `Chapter ${chapterIndex + 1}`,
		});

		if (chapter.scenes.length === 0) {
			pages.push({
				id: `chapter:${chapter.id}:empty`,
				type: 'empty-chapter',
				chapterId: chapter.id,
				chapterTitle,
				content: CHAPTER_NOT_WRITTEN,
			});
			return;
		}

		chapter.scenes.forEach((scene, sceneIndex) => {
			const sceneTitle = scene.title || `Scene ${sceneIndex + 1}`;
			const text = extractReadableText(scene.content);
			if (!text) {
				pages.push({
					id: `scene:${scene.id}:empty`,
					type: 'empty-scene',
					chapterId: chapter.id,
					sceneId: scene.id,
					chapterTitle,
					sceneTitle,
					content: SCENE_NOT_WRITTEN,
				});
				return;
			}
			const chunks = chunkSceneContent(text, options);
			if (chunks.length === 0) {
				pages.push({
					id: `scene:${scene.id}:empty`,
					type: 'empty-scene',
					chapterId: chapter.id,
					sceneId: scene.id,
					chapterTitle,
					sceneTitle,
					content: SCENE_NOT_WRITTEN,
				});
				return;
			}
			chunks.forEach((chunk, chunkIndex) => {
				pages.push({
					id: `scene:${scene.id}:p${chunkIndex}`,
					type: 'scene',
					chapterId: chapter.id,
					sceneId: scene.id,
					chapterTitle,
					sceneTitle,
					content: chunk,
				});
			});
		});
	});

	pages.push({
		id: 'page:end',
		type: 'end',
		title: 'End',
		subtitle: project.title,
	});

	return pages.map((page, index) => ({ ...page, pageNumber: index + 1 }));
}

/**
 * plan-023 stage-003: map an authoring `sceneId` to the first
 * `ReaderPage.id` whose page renders that scene. Returns `null` when no
 * page references the scene (unknown id, scene removed, etc.) so callers
 * can fall back to saved/initial position without throwing.
 *
 * Pure & deterministic — re-derives `buildReaderPages` from the same
 * inputs. Not memoized; if a hot path needs it, memoize at the call site.
 */
export function mapSceneIdToReaderPageId(
	sceneId: string,
	project: ReaderInputProject,
	chapters: ReaderInputChapter[],
): string | null {
	if (!sceneId) return null;
	const pages = buildReaderPages(project, chapters);
	const match = pages.find((page) => page.sceneId === sceneId);
	return match ? match.id : null;
}
