export const WORD_COUNT_PRESETS: { label: string; value: number }[] = [
	{ label: 'Short Story', value: 5000 },
	{ label: 'Novella', value: 20000 },
	{ label: 'Novel', value: 80000 },
];

export const GENRE_SUGGESTIONS = [
	'Fantasy',
	'Sci-Fi',
	'Romance',
	'Thriller',
	'Literary',
	'Horror',
	'Mystery',
] as const;

export const COVER_PALETTES = [
	{ a: '#1f2937', b: '#4f46e5' },
	{ a: '#3f2a1d', b: '#b45309' },
	{ a: '#102a43', b: '#0ea5e9' },
	{ a: '#2b1a3a', b: '#9333ea' },
	{ a: '#1f3a2e', b: '#10b981' },
	{ a: '#3a1f2a', b: '#fb7185' },
] as const;

export const PROJECT_STATUSES = ['planning', 'drafting', 'revising', 'completed', 'archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
