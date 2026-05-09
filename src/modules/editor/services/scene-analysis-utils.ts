// Pure text-analysis helpers used by the editor signal system.
// All functions are stateless and safe to use in both browser and server contexts.

export function countWords(text: string): number {
	const normalized = text.replace(/<[^>]+>/g, ' ').trim();
	if (!normalized) return 0;
	return normalized.split(/\s+/).length;
}

export function normalizeText(text: string): string {
	return text
		.replace(/<[^>]+>/g, ' ')
		.toLowerCase()
		.replace(/[^a-z0-9\s\n']/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function keywordHits(text: string, keywords: string[]): number {
	if (!text) return 0;
	return keywords.reduce((total, keyword) => {
		const regex = new RegExp(`\\b${keyword}\\b`, 'g');
		return total + (text.match(regex)?.length ?? 0);
	}, 0);
}

export function findFirstKeywordIndex(text: string, keywords: string[]): number {
	if (!text) return -1;
	let first = -1;
	for (const keyword of keywords) {
		const index = text.indexOf(keyword);
		if (index >= 0 && (first < 0 || index < first)) first = index;
	}
	return first;
}

export function extractSignalTerms(text: string): string[] {
	return text
		.toLowerCase()
		.split(/\s+/)
		.map((token) => token.replace(/[^a-z0-9']/g, ''))
		.filter((token) => token.length >= 4)
		.slice(0, 5);
}
