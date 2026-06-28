export type GenerationHintIntent = 'target' | 'avoid' | 'neutral';
export type GenerationHintSource = 'title' | 'synopsis' | 'manual' | 'legacy' | 'brainstorm';

export interface GenerationContextHint {
	name: string;
	intent: GenerationHintIntent;
	source: GenerationHintSource;
}

export interface GenerationContextPayload {
	note?: string;
	hints?: GenerationContextHint[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeName(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	return trimmed.slice(0, 120);
}

function normalizeNote(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	return trimmed.slice(0, 1200);
}

function toStringList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.filter((item): item is string => typeof item === 'string')
		.map((item) => item.trim())
		.filter((item) => item.length > 0)
		.map((item) => item.slice(0, 120));
}

function normalizeIntent(value: unknown): GenerationHintIntent {
	if (value === 'target' || value === 'avoid' || value === 'neutral') return value;
	return 'neutral';
}

function normalizeSource(value: unknown): GenerationHintSource {
	if (
		value === 'title' ||
		value === 'synopsis' ||
		value === 'manual' ||
		value === 'legacy' ||
		value === 'brainstorm'
	) {
		return value;
	}
	return 'manual';
}

function normalizeHint(value: unknown): GenerationContextHint | null {
	if (!isRecord(value)) return null;
	const name = normalizeName(value.name);
	if (!name) return null;
	return {
		name,
		intent: normalizeIntent(value.intent),
		source: normalizeSource(value.source),
	};
}

const MAX_HINTS = 50;

// Deduplicates by name only — first-seen intent wins, so conflicting target+avoid for the same
// name do not produce contradictory AI instructions.
function dedupeHints(hints: GenerationContextHint[]): GenerationContextHint[] {
	const byName = new Map<string, GenerationContextHint>();
	for (const hint of hints) {
		const key = hint.name.toLowerCase();
		if (!byName.has(key)) byName.set(key, hint);
	}
	return Array.from(byName.values());
}

export function normalizeGenerationContext(input: unknown): GenerationContextPayload | undefined {
	if (!isRecord(input)) return undefined;

	const hints: GenerationContextHint[] = [];

	if (Array.isArray(input.hints)) {
		for (const candidate of input.hints) {
			const hint = normalizeHint(candidate);
			if (hint) hints.push(hint);
		}
	}

	for (const name of toStringList(input.targets)) {
		hints.push({ name, intent: 'target', source: 'manual' });
	}
	for (const name of toStringList(input.avoids)) {
		hints.push({ name, intent: 'avoid', source: 'manual' });
	}

	const note = normalizeNote(input.note);
	const dedupedHints = dedupeHints(hints.slice(0, MAX_HINTS));

	if (!note && dedupedHints.length === 0) return undefined;

	return {
		...(note ? { note } : {}),
		...(dedupedHints.length > 0 ? { hints: dedupedHints } : {}),
	};
}

export function legacyStringToGenerationContext(
	input?: string,
): GenerationContextPayload | undefined {
	const note = normalizeName(input);
	if (!note) return undefined;
	return { note };
}

const NAME_CANDIDATE_STOPWORDS = new Set([
	'A',
	'An',
	'The',
	'In',
	'On',
	'At',
	'By',
	'For',
	'Of',
	'To',
	'And',
	'Or',
	'But',
	'With',
	'From',
	'Into',
	'Her',
	'His',
	'Its',
	'Their',
	'My',
	'Our',
	'Your',
	'Is',
	'Are',
	'Was',
	'Were',
	'Has',
	'Have',
	'Had',
	'That',
	'This',
	'When',
	'Where',
	'Which',
	'Who',
	'Whose',
	'What',
	'How',
	'Why',
	'As',
	'If',
	'Be',
	'Been',
	'Being',
	'Do',
	'Does',
	'Did',
	'Not',
	'No',
	'All',
	'Any',
	'Each',
	'Every',
	'Both',
	'One',
	'Two',
	'Three',
	'First',
	'Last',
	'New',
	'Old',
	'After',
	'Before',
	'Then',
	'Now',
	'So',
	'Up',
	'Down',
	'Out',
	'Over',
	'Under',
	'Through',
	'About',
	'Between',
	'During',
	'Without',
	'Within',
	'He',
	'She',
	'They',
	'We',
	'You',
	'It',
	'Will',
	'Would',
	'Could',
	'Should',
	'May',
	'Might',
	'Must',
	'Can',
]);

/**
 * Extracts candidate proper names from project title and synopsis.
 * Returns up to 12 unique capitalized words that are not sentence-initial and not stopwords.
 */
export function extractNameCandidates(title: string, synopsis: string): string[] {
	const combined = `${title}\n${synopsis}`;
	const sentences = combined.split(/[.!?\n]+/);
	const seen = new Set<string>();
	const results: string[] = [];

	for (const sentence of sentences) {
		const words = sentence.trim().split(/\s+/);
		for (let i = 1; i < words.length; i++) {
			const raw = (words[i] ?? '').replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');
			if (!raw || raw.length < 2) continue;
			if (!/^[A-Z]/.test(raw)) continue;
			if (NAME_CANDIDATE_STOPWORDS.has(raw)) continue;
			const key = raw.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			results.push(raw);
			if (results.length >= 12) return results;
		}
	}

	return results;
}

export function buildPromptContextNote(context?: GenerationContextPayload): string | undefined {
	if (!context) return undefined;

	const lines: string[] = [];
	if (context.note) {
		lines.push(context.note);
	}

	const hints = context.hints ?? [];
	const targets = hints.filter((hint) => hint.intent === 'target').map((hint) => hint.name);
	const avoids = hints.filter((hint) => hint.intent === 'avoid').map((hint) => hint.name);
	const related = hints.filter((hint) => hint.intent === 'neutral').map((hint) => hint.name);

	if (targets.length > 0) {
		lines.push(`Prioritize these entities if relevant: ${targets.join(', ')}`);
	}
	if (avoids.length > 0) {
		lines.push(`Avoid making these entities the primary generated outputs: ${avoids.join(', ')}`);
	}
	if (related.length > 0) {
		lines.push(`Related entities to stay context-consistent with: ${related.join(', ')}`);
	}

	const note = lines.join('\n').trim();
	return note || undefined;
}
