import type { StyleDeviation } from './types.js';

interface RawDeviation {
	spanStart: unknown;
	spanEnd: unknown;
	original: unknown;
	suggestion: unknown;
	reason: unknown;
}

/**
 * Parses raw AI text response for a style_check task.
 * Returns [] on malformed JSON or invalid structure.
 */
export function parseStyleDeviations(rawText: string, presetId: string): StyleDeviation[] {
	try {
		const jsonStart = rawText.indexOf('[');
		const jsonEnd = rawText.lastIndexOf(']');
		if (jsonStart === -1 || jsonEnd === -1) return [];
		const parsed: unknown = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter(
				(item): item is RawDeviation =>
					typeof item === 'object' &&
					item !== null &&
					typeof (item as RawDeviation).spanStart === 'number' &&
					typeof (item as RawDeviation).spanEnd === 'number' &&
					typeof (item as RawDeviation).original === 'string' &&
					typeof (item as RawDeviation).suggestion === 'string' &&
					typeof (item as RawDeviation).reason === 'string',
			)
			.map((item) => ({
				spanStart: item.spanStart as number,
				spanEnd: item.spanEnd as number,
				original: item.original as string,
				suggestion: item.suggestion as string,
				reason: item.reason as string,
				presetId,
			}));
	} catch {
		return [];
	}
}
