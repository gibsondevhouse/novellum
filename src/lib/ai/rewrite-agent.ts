import type { RewriteOption } from './types.js';

interface RawOption {
	index: unknown;
	text: unknown;
}

/**
 * Parses raw AI text response for a rewrite task.
 * Returns { options, error } — error is non-null if count !== 3.
 */
export function parseRewriteOptions(rawText: string): {
	options: RewriteOption[];
	error: string | null;
} {
	try {
		const jsonStart = rawText.indexOf('[');
		const jsonEnd = rawText.lastIndexOf(']');
		if (jsonStart === -1 || jsonEnd === -1) {
			return { options: [], error: 'No JSON array found in response' };
		}
		const parsed: unknown = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));
		if (!Array.isArray(parsed)) {
			return { options: [], error: 'Response is not a JSON array' };
		}
		const options: RewriteOption[] = parsed
			.filter(
				(item): item is RawOption =>
					typeof item === 'object' &&
					item !== null &&
					typeof (item as RawOption).index === 'number' &&
					typeof (item as RawOption).text === 'string',
			)
			.map((item) => ({
				index: item.index as number as 1 | 2 | 3,
				text: item.text as string,
			}));
		if (options.length !== 3) {
			return { options, error: `Could not generate 3 options — try again (got ${options.length})` };
		}
		return { options, error: null };
	} catch {
		return { options: [], error: 'Malformed JSON response' };
	}
}
