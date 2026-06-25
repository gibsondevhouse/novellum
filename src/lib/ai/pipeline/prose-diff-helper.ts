import { diffChars } from 'diff';

export type ProseDiffOperation = 'equal' | 'insert' | 'delete';

export interface ProseDiffSegment {
	operation: ProseDiffOperation;
	text: string;
}

export interface ProseDiffResult {
	currentText: string;
	generatedText: string;
	segments: ProseDiffSegment[];
	hasChanges: boolean;
	insertedText: string;
	deletedText: string;
}

const HTML_ESCAPE_MAP: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

function normalizeProseText(value: string | null | undefined): string {
	return typeof value === 'string' ? value : '';
}

function escapeMarkupText(value: string): string {
	return value.replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character] ?? character);
}

function operationForChange(change: { added?: boolean; removed?: boolean }): ProseDiffOperation {
	if (change.added) return 'insert';
	if (change.removed) return 'delete';
	return 'equal';
}

function mergeAdjacentSegments(segments: ProseDiffSegment[]): ProseDiffSegment[] {
	const merged: ProseDiffSegment[] = [];

	for (const segment of segments) {
		if (segment.text.length === 0) continue;

		const previous = merged.at(-1);
		if (previous?.operation === segment.operation) {
			previous.text += segment.text;
		} else {
			merged.push({ ...segment });
		}
	}

	return merged;
}

function isProseDiffSegmentArray(
	diff: ProseDiffResult | readonly ProseDiffSegment[],
): diff is readonly ProseDiffSegment[] {
	return Array.isArray(diff);
}

export function createProseDiff(
	currentTextValue: string | null | undefined,
	generatedTextValue: string | null | undefined,
): ProseDiffResult {
	const currentText = normalizeProseText(currentTextValue);
	const generatedText = normalizeProseText(generatedTextValue);
	const segments = mergeAdjacentSegments(
		diffChars(currentText, generatedText).map((change) => ({
			operation: operationForChange(change),
			text: change.value,
		})),
	);

	return {
		currentText,
		generatedText,
		segments,
		hasChanges: currentText !== generatedText,
		insertedText: segments
			.filter((segment) => segment.operation === 'insert')
			.map((segment) => segment.text)
			.join(''),
		deletedText: segments
			.filter((segment) => segment.operation === 'delete')
			.map((segment) => segment.text)
			.join(''),
	};
}

export function renderProseDiffMarkup(
	diff: ProseDiffResult | readonly ProseDiffSegment[],
): string {
	const segments = isProseDiffSegmentArray(diff) ? diff : diff.segments;

	return segments
		.map((segment) => {
			const escapedText = escapeMarkupText(segment.text);
			if (segment.operation === 'insert') return `<ins>${escapedText}</ins>`;
			if (segment.operation === 'delete') return `<del>${escapedText}</del>`;
			return escapedText;
		})
		.join('');
}

export function createProseDiffMarkup(
	currentText: string | null | undefined,
	generatedText: string | null | undefined,
): string {
	return renderProseDiffMarkup(createProseDiff(currentText, generatedText));
}
