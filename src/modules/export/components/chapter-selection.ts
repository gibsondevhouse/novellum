import type { ExportChapterOption } from '../services/export-chapter-options.js';

export type ChapterSelectionMode = 'all' | 'range' | 'selected';

export interface ChapterSelectionState {
	mode: ChapterSelectionMode;
	rangeStartId: string | null;
	rangeEndId: string | null;
	selectedIds: string[];
}

export interface ResolvedChapterSelection {
	selectedChapterIds?: string[];
	count: number;
	warnings: string[];
	error: string | null;
}

export function createDefaultChapterSelection(
	chapters: readonly ExportChapterOption[],
): ChapterSelectionState {
	const firstId = chapters[0]?.id ?? null;
	const lastId = chapters[chapters.length - 1]?.id ?? null;
	return {
		mode: 'all',
		rangeStartId: firstId,
		rangeEndId: lastId,
		selectedIds: chapters.map((chapter) => chapter.id),
	};
}

function uniqueIds(ids: readonly string[]): string[] {
	return Array.from(new Set(ids.filter(Boolean)));
}

export function resolveChapterSelection(
	state: ChapterSelectionState,
	chapters: readonly ExportChapterOption[],
): ResolvedChapterSelection {
	const warnings: string[] = [];

	if (chapters.length === 0) {
		return {
			count: 0,
			warnings,
			error: 'Add at least one chapter before exporting a manuscript.',
		};
	}

	if (state.mode === 'all') {
		return {
			selectedChapterIds: undefined,
			count: chapters.length,
			warnings,
			error: null,
		};
	}

	if (state.mode === 'range') {
		const startIndex = chapters.findIndex((chapter) => chapter.id === state.rangeStartId);
		const endIndex = chapters.findIndex((chapter) => chapter.id === state.rangeEndId);
		if (startIndex < 0 || endIndex < 0) {
			return {
				count: 0,
				warnings,
				error: 'Choose a valid chapter range.',
			};
		}
		const from = Math.min(startIndex, endIndex);
		const to = Math.max(startIndex, endIndex);
		if (startIndex > endIndex) {
			warnings.push('Chapter range was reordered to match manuscript order.');
		}
		const selectedChapterIds = chapters.slice(from, to + 1).map((chapter) => chapter.id);
		return {
			selectedChapterIds,
			count: selectedChapterIds.length,
			warnings,
			error: selectedChapterIds.length > 0 ? null : 'Choose at least one chapter.',
		};
	}

	const requestedIds = uniqueIds(state.selectedIds);
	if (requestedIds.length !== state.selectedIds.length) {
		warnings.push('Duplicate chapter selections were removed.');
	}
	const requested = new Set(requestedIds);
	const selectedChapterIds = chapters
		.filter((chapter) => requested.has(chapter.id))
		.map((chapter) => chapter.id);
	if (selectedChapterIds.length !== requestedIds.length) {
		warnings.push('Unavailable chapters were removed from the selection.');
	}

	return {
		selectedChapterIds,
		count: selectedChapterIds.length,
		warnings,
		error: selectedChapterIds.length > 0 ? null : 'Choose at least one chapter.',
	};
}
