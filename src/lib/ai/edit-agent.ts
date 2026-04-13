import type { EditMode, EditSuggestion } from './types.js';

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
