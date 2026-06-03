import { describe, expect, it } from 'vitest';
import type { ExportChapterOption } from '../services/export-chapter-options.js';
import {
	createDefaultChapterSelection,
	resolveChapterSelection,
	type ChapterSelectionState,
} from './chapter-selection.js';

const chapters: ExportChapterOption[] = [
	{ id: 'c1', title: 'One', order: 0, label: 'Chapter 1 - One' },
	{ id: 'c2', title: 'Two', order: 1, label: 'Chapter 2 - Two' },
	{ id: 'c3', title: 'Three', order: 2, label: 'Chapter 3 - Three' },
];

describe('createDefaultChapterSelection', () => {
	it('defaults to all chapters with full range and selected state', () => {
		expect(createDefaultChapterSelection(chapters)).toEqual({
			mode: 'all',
			rangeStartId: 'c1',
			rangeEndId: 'c3',
			selectedIds: ['c1', 'c2', 'c3'],
		});
	});
});

describe('resolveChapterSelection', () => {
	it('omits selected IDs for all-chapter exports', () => {
		const result = resolveChapterSelection(createDefaultChapterSelection(chapters), chapters);
		expect(result.selectedChapterIds).toBeUndefined();
		expect(result.count).toBe(3);
	});

	it('resolves inclusive ranges in manuscript order', () => {
		const state: ChapterSelectionState = {
			mode: 'range',
			rangeStartId: 'c1',
			rangeEndId: 'c2',
			selectedIds: [],
		};

		expect(resolveChapterSelection(state, chapters).selectedChapterIds).toEqual(['c1', 'c2']);
	});

	it('corrects reversed ranges and emits a warning', () => {
		const state: ChapterSelectionState = {
			mode: 'range',
			rangeStartId: 'c3',
			rangeEndId: 'c1',
			selectedIds: [],
		};

		const result = resolveChapterSelection(state, chapters);
		expect(result.selectedChapterIds).toEqual(['c1', 'c2', 'c3']);
		expect(result.warnings).toContain('Chapter range was reordered to match manuscript order.');
	});

	it('preserves manuscript order for selected chapters', () => {
		const state: ChapterSelectionState = {
			mode: 'selected',
			rangeStartId: null,
			rangeEndId: null,
			selectedIds: ['c3', 'c1'],
		};

		expect(resolveChapterSelection(state, chapters).selectedChapterIds).toEqual(['c1', 'c3']);
	});

	it('collapses duplicate IDs and drops stale IDs', () => {
		const state: ChapterSelectionState = {
			mode: 'selected',
			rangeStartId: null,
			rangeEndId: null,
			selectedIds: ['c2', 'c2', 'missing'],
		};

		const result = resolveChapterSelection(state, chapters);
		expect(result.selectedChapterIds).toEqual(['c2']);
		expect(result.warnings).toContain('Duplicate chapter selections were removed.');
		expect(result.warnings).toContain('Unavailable chapters were removed from the selection.');
	});

	it('blocks empty manuscripts', () => {
		const result = resolveChapterSelection(createDefaultChapterSelection([]), []);
		expect(result.error).toBe('Add at least one chapter before exporting a manuscript.');
	});

	it('blocks empty selected scope', () => {
		const result = resolveChapterSelection(
			{ mode: 'selected', rangeStartId: null, rangeEndId: null, selectedIds: [] },
			chapters,
		);
		expect(result.error).toBe('Choose at least one chapter.');
	});
});
