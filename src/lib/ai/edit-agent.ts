import type { EditMode, EditSuggestion } from './types.js';
import { diffWords } from 'diff';

interface RawEditSuggestion {
	spanStart: unknown;
	spanEnd: unknown;
	original: unknown;
	suggestion: unknown;
	reason: unknown;
}

/**
 * Parses raw AI text response for an edit task into validated EditSuggestion[].
 * Returns [] on malformed JSON or invalid structure.
 */
export function parseEditSuggestions(rawText: string, mode: EditMode): EditSuggestion[] {
	try {
		const jsonStart = rawText.indexOf('[');
		const jsonEnd = rawText.lastIndexOf(']');
		if (jsonStart === -1 || jsonEnd === -1) return [];
		const parsed: unknown = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter(
				(item): item is RawEditSuggestion =>
					typeof item === 'object' &&
					item !== null &&
					typeof (item as RawEditSuggestion).spanStart === 'number' &&
					typeof (item as RawEditSuggestion).spanEnd === 'number' &&
					typeof (item as RawEditSuggestion).original === 'string' &&
					typeof (item as RawEditSuggestion).suggestion === 'string' &&
					typeof (item as RawEditSuggestion).reason === 'string',
			)
			.map((item) => ({
				spanStart: item.spanStart as number,
				spanEnd: item.spanEnd as number,
				original: item.original as string,
				suggestion: item.suggestion as string,
				reason: item.reason as string,
				mode,
			}));
	} catch {
		return [];
	}
}

/**
 * Compares an original text and a revised text, producing a list of EditSuggestions.
 * This is useful if the AI returns prose instead of structured spans.
 */
export function generateEditSuggestionsFromDiff(
	originalText: string,
	revisedText: string,
	mode: EditMode,
	defaultReason = 'AI suggested revision'
): EditSuggestion[] {
	const changes = diffWords(originalText, revisedText);
	const suggestions: EditSuggestion[] = [];

	let currentIndex = 0;
	let pendingOriginalContext = '';
	let pendingSuggestionContext = '';
	let inDiffContext = false;
	let startIdx = 0;

	// Loop through changes from diff package.
	// Since diff packages often break down changes into adjacent added/removed blocks,
	// we group adjacent changes together to form a coherent replacement.
	for (let i = 0; i < changes.length; i++) {
		const change = changes[i];

		if (change.added || change.removed) {
			if (!inDiffContext) {
				inDiffContext = true;
				startIdx = currentIndex;
				pendingOriginalContext = '';
				pendingSuggestionContext = '';
			}

			if (change.removed) {
				pendingOriginalContext += change.value;
			}
			if (change.added) {
				pendingSuggestionContext += change.value;
			}
		} else {
			// Unchanged
			if (inDiffContext) {
				// Flush pending difference
				suggestions.push({
					spanStart: startIdx,
					spanEnd: currentIndex,
					original: pendingOriginalContext,
					suggestion: pendingSuggestionContext,
					reason: defaultReason,
					mode
				});
				inDiffContext = false;
			}
		}

		if (!change.added) {
			currentIndex += change.value.length;
		}
	}

	// Flush remaining diff if file ended on a change
	if (inDiffContext) {
		suggestions.push({
			spanStart: startIdx,
			spanEnd: currentIndex,
			original: pendingOriginalContext,
			suggestion: pendingSuggestionContext,
			reason: defaultReason,
			mode
		});
	}

	return suggestions;
}
