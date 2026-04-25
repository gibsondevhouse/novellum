import type {
	NovaContextMode,
	NovaContextPlan,
	NovaSessionContextItem,
} from '$modules/ai/types.js';

interface PlanInputMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

const FULL_PHRASES: string[] = [
	'whole project',
	'entire project',
	'full project',
	'all project context',
	'use all project context',
	'all of the project',
	'all the project context',
	'everything in the project',
	'read everything',
	'full continuity audit',
	'deep audit',
	'review the entire manuscript',
	'analyze the whole novel',
	'analyze the whole project',
	'analyze the entire project',
	'whole novel',
	'entire novel',
	'whole manuscript',
	'entire manuscript',
];

const SUMMARY_PHRASES: string[] = [
	'this project',
	'my project',
	'the project',
	'this story',
	'my story',
	'my novel',
	'the book',
	'this book',
	'tell me about the project',
	'tell me about this project',
	'what is this project',
	'what is this story',
	'what is the story',
	'what is the project',
	'what should i work on',
	'what do we have',
	'where am i',
	'summarize',
	'summary of',
	'project summary',
	'project status',
	'help me think through the premise',
];

interface ScopeRule {
	scope: string;
	patterns: RegExp[];
}

const SCOPE_RULES: ScopeRule[] = [
	{
		scope: 'characters',
		patterns: [/\bcharacter(s)?\b/i, /\bprotagonist(s)?\b/i, /\bantagonist(s)?\b/i, /\bcast\b/i, /\bpov\b/i],
	},
	{
		scope: 'arcs',
		patterns: [
			/\barc(s)?\b/i,
			/\bact(s)?\b/i,
			/\bplot\s*thread(s)?\b/i,
			/\bthread(s)?\b/i,
			/\bmilestone(s)?\b/i,
			/\bmajor\s*arc(s)?\b/i,
		],
	},
	{
		scope: 'chapters',
		patterns: [/\bchapter(s)?\b/i],
	},
	{
		scope: 'scenes',
		patterns: [/\bscene(s)?\b/i],
	},
	{
		scope: 'beats',
		patterns: [/\bbeat(s)?\b/i],
	},
	{
		scope: 'timeline',
		patterns: [
			/\btimeline\b/i,
			/\beras?\b/i,
			/\bkey\s*event(s)?\b/i,
			/\bpersonal\s*histor(y|ies)\b/i,
			/\bchronicl(e|es)\b/i,
		],
	},
	{
		scope: 'worldbuilding',
		patterns: [
			/\bworld[-\s]?build(ing)?\b/i,
			/\bfaction(s)?\b/i,
			/\brealm(s)?\b/i,
			/\blocation(s)?\b/i,
			/\bsetting(s)?\b/i,
		],
	},
	{
		scope: 'lore',
		patterns: [/\blore\b/i, /\bmyth(s|ology)?\b/i],
	},
	{
		scope: 'style',
		patterns: [/\bwriting\s*style(s)?\b/i, /\btone\b/i, /\bvoice\b/i, /\bstyle\s*preset(s)?\b/i],
	},
	{
		scope: 'continuity',
		patterns: [/\bcontinuity\b/i, /\binconsistenc(y|ies)\b/i, /\bcontradiction(s)?\b/i],
	},
	{
		scope: 'outline',
		patterns: [/\boutline\b/i, /\bstructure\b/i, /\bstory\s*structure\b/i],
	},
	{
		scope: 'manuscript',
		patterns: [/\bmanuscript\b/i, /\bdraft\b/i, /\bprose\b/i],
	},
];

const ENTITY_STOPWORDS = new Set([
	'I',
	'A',
	'An',
	'The',
	'My',
	'Our',
	'This',
	'That',
	'These',
	'Those',
	'Help',
	'Tell',
	'Show',
	'Give',
	'Find',
	'What',
	'Why',
	'How',
	'When',
	'Where',
	'Who',
	'Use',
	'Can',
	'Could',
	'Would',
	'Should',
	'Do',
	'Does',
	'Did',
	'Is',
	'Are',
	'Was',
	'Were',
	'Be',
	'Have',
	'Has',
	'Had',
	'It',
	'You',
	'We',
	'They',
	'Nova',
	'Project',
	'Story',
	'Novel',
	'Book',
	'Chapter',
	'Scene',
	'Arc',
	'Act',
	'Character',
	'Continuity',
	'Outline',
	'Manuscript',
	'Timeline',
	'Era',
	'Realm',
	'Faction',
	'Location',
	'Lore',
	'Style',
	'Beat',
]);

function normalize(text: string): string {
	return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function containsAny(haystack: string, phrases: string[]): string | null {
	for (const phrase of phrases) {
		if (haystack.includes(phrase)) return phrase;
	}
	return null;
}

function detectScopes(prompt: string): string[] {
	const matches = new Set<string>();
	for (const rule of SCOPE_RULES) {
		for (const pattern of rule.patterns) {
			if (pattern.test(prompt)) {
				matches.add(rule.scope);
				break;
			}
		}
	}
	return [...matches];
}

function extractEntityHints(prompt: string): string[] {
	const hints = new Set<string>();

	// Quoted phrases (single or double quotes, including curly variants).
	const quoted = prompt.matchAll(/["“'‘]([^"”'’]{2,80})["”'’]/g);
	for (const match of quoted) {
		const value = match[1].trim();
		if (value) hints.add(value);
	}

	// Title Case sequences of 1-4 words. Skip stopwords as the leading token.
	const titleCase = prompt.matchAll(/\b([A-Z][a-z][\w'-]*(?:\s+[A-Z][\w'-]*){0,3})\b/g);
	for (const match of titleCase) {
		const phrase = match[1].trim();
		if (!phrase) continue;
		const firstToken = phrase.split(/\s+/)[0];
		if (ENTITY_STOPWORDS.has(firstToken)) continue;
		// Skip phrases that are entirely stopwords.
		const tokens = phrase.split(/\s+/);
		if (tokens.every((token) => ENTITY_STOPWORDS.has(token))) continue;
		hints.add(phrase);
	}

	return [...hints].slice(0, 8);
}

function pickIncludeFiles(prompt: string, hasFiles: boolean): boolean {
	if (!hasFiles) return false;
	if (/\b(file|attachment|document|doc|pdf|notes?|upload(ed)?|attached|paste(d)?)\b/i.test(prompt)) {
		return true;
	}
	return false;
}

export function planNovaContext(
	prompt: string,
	attachments: NovaSessionContextItem[],
	_messages: PlanInputMessage[] = [],
): NovaContextPlan {
	const projectIds = attachments
		.filter((item): item is Extract<NovaSessionContextItem, { kind: 'project' }> => item.kind === 'project')
		.map((item) => item.projectId);
	const hasFiles = attachments.some((item) => item.kind === 'file');
	const hasProject = projectIds.length > 0;

	const trimmed = prompt.trim();
	if (!trimmed) {
		return {
			mode: 'off',
			reason: 'empty-prompt',
			projectIds: [],
			includeFiles: false,
			requestedScopes: [],
			entityHints: [],
		};
	}

	const lower = normalize(trimmed);
	const includeFiles = pickIncludeFiles(trimmed, hasFiles);

	if (!hasProject && !hasFiles) {
		return {
			mode: 'off',
			reason: 'no-attachments',
			projectIds: [],
			includeFiles: false,
			requestedScopes: [],
			entityHints: [],
		};
	}

	const fullMatch = containsAny(lower, FULL_PHRASES);
	const scopes = detectScopes(trimmed);
	const summaryMatch = containsAny(lower, SUMMARY_PHRASES);

	let mode: NovaContextMode;
	let reason: string;

	if (hasProject && fullMatch) {
		mode = 'full';
		reason = `full-phrase:${fullMatch}`;
	} else if (hasProject && scopes.length > 0) {
		mode = 'targeted';
		reason = `scopes:${scopes.join(',')}`;
	} else if (hasProject && summaryMatch) {
		mode = 'summary';
		reason = `summary-phrase:${summaryMatch}`;
	} else if (!hasProject && includeFiles) {
		mode = 'targeted';
		reason = 'files-referenced';
	} else {
		mode = 'off';
		reason = hasProject ? 'no-project-reference' : 'no-context-reference';
	}

	const entityHints = mode === 'targeted' ? extractEntityHints(trimmed) : [];

	return {
		mode,
		reason,
		projectIds: mode === 'off' ? [] : projectIds,
		includeFiles: mode === 'off' ? false : includeFiles,
		requestedScopes: mode === 'targeted' ? scopes : [],
		entityHints,
	};
}
