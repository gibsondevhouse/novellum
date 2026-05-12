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

/**
 * Maps a warn-severity live signal to a targeted Nova prompt the writer
 * can send with one click. References the scene goal when present so
 * Nova gives concrete, scene-specific guidance rather than generic advice.
 */
export function signalToNovaPrompt(signal: string, sceneGoal: string): string {
	const goalCtx = sceneGoal.trim() ? ` The scene goal is: "${sceneGoal.trim()}".` : '';
	switch (signal) {
		case 'Low tension detected in recent paragraphs.':
			return `My recent paragraphs feel low on tension.${goalCtx} Suggest 2–3 specific ways to raise tension without discarding what's already on the page.`;
		case 'No clear conflict present yet.':
			return `I'm past the opening of my scene and there's no clear conflict yet.${goalCtx} How should I introduce it now in a way that feels natural rather than forced?`;
		case 'No turning point detected yet.':
			return `My scene is nearing its target length but I haven't written a turning point.${goalCtx} Suggest a concrete turning point that fits what's already on the page.`;
		case 'Scene may be drifting from its goal.':
			return `My scene seems to be drifting.${goalCtx} What's likely missing, and what's the smallest change that gets it back on track?`;
		default:
			return signal;
	}
}
