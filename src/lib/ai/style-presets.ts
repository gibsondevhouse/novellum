import type { StylePreset } from './types.js';

export const STYLE_PRESETS: StylePreset[] = [
	{
		id: 'literary_fiction',
		name: 'Literary Fiction',
		description: 'Lyrical prose with emphasis on interiority and subtext.',
		rules: [
			'Prefer active voice over passive',
			'Avoid adverbs — show emotion through action and dialogue',
			"Show, don't tell: render emotion and state through concrete sensory detail",
			'Vary sentence length for rhythm; avoid monotonous structures',
		],
	},
	{
		id: 'thriller',
		name: 'Thriller',
		description: 'Tight, propulsive prose that sustains tension.',
		rules: [
			'Use active voice at all times',
			'Keep sentences short under moments of tension',
			'Minimise descriptive passages — keep action foregrounded',
			'Every paragraph should advance plot or raise stakes',
		],
	},
	{
		id: 'young_adult',
		name: 'Young Adult',
		description: 'Accessible, emotionally direct prose with strong interiority.',
		rules: [
			'Use accessible vocabulary — avoid obscure literary terms',
			"Foreground the protagonist's emotional state clearly",
			'Present-tense interiority is acceptable and often preferred',
			'Dialogue should sound natural to a teenage register',
		],
	},
	{
		id: 'romance',
		name: 'Romance',
		description: 'Sensory, emotionally charged prose that centres relationships.',
		rules: [
			'Foreground sensory details especially in character interactions',
			'Interpersonal tension should be present in every scene involving both leads',
			"Internal monologue should reflect character's emotional conflict",
			'Emotional beats should be clearly rendered, not implied',
		],
	},
];

export function getPreset(id: string): StylePreset | undefined {
	return STYLE_PRESETS.find((p) => p.id === id);
}
