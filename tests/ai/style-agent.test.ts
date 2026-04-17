import { describe, it, expect } from 'vitest';
import { parseStyleDeviations } from '../../src/lib/ai/style-agent.js';
import { resolveTask } from '../../src/lib/ai/task-resolver.js';
import { buildPrompt } from '../../src/lib/ai/prompt-builder.js';
import { STYLE_PRESETS, getPreset } from '../../src/lib/ai/style-presets.js';

const mockUiCtx = {
	activeProjectId: 'p1',
	activeSceneId: 's1',
	activeBeatId: null,
	activeChapterId: 'c1',
};
const mockSceneCtx = {
	policy: 'scene_only' as const,
	scene: {
		id: 's1',
		chapterId: 'c1',
		projectId: 'p1',
		title: 'T',
		summary: '',
		povCharacterId: null,
		locationId: null,
		timelineEventId: null,
		order: 0,
		content: 'She was very tired.',
		wordCount: 4,
		notes: '',
		characterIds: [],
		locationIds: [],
		createdAt: '',
		updatedAt: '',
	},
	adjacentScenes: [],
	chapter: null,
	beats: [],
	characters: [],
	locations: [],
	loreEntries: [],
	plotThreads: [],
};

describe('STYLE_PRESETS', () => {
	it('has exactly 4 built-in presets', () => {
		expect(STYLE_PRESETS).toHaveLength(4);
	});

	it('getPreset returns correct preset', () => {
		const p = getPreset('thriller');
		expect(p?.name).toBe('Thriller');
	});

	it('getPreset returns undefined for unknown id', () => {
		expect(getPreset('nonexistent')).toBeUndefined();
	});
});

describe('parseStyleDeviations', () => {
	it('parses valid deviations', () => {
		const raw = JSON.stringify([
			{
				spanStart: 9,
				spanEnd: 18,
				original: 'very tired',
				suggestion: 'exhausted',
				reason: 'Avoid adverbs (literary_fiction)',
			},
		]);
		const result = parseStyleDeviations(raw, 'literary_fiction');
		expect(result).toHaveLength(1);
		expect(result[0].presetId).toBe('literary_fiction');
		expect(result[0].suggestion).toBe('exhausted');
	});

	it('returns [] for empty array', () => {
		expect(parseStyleDeviations('[]', 'thriller')).toEqual([]);
	});

	it('returns [] for malformed JSON', () => {
		expect(parseStyleDeviations('not json', 'romance')).toEqual([]);
	});

	it('handles JSON in surrounding prose', () => {
		const raw =
			'Analysis:\n[{"spanStart":0,"spanEnd":3,"original":"She","suggestion":"She\'d","reason":"test"}]\nDone.';
		const result = parseStyleDeviations(raw, 'young_adult');
		expect(result).toHaveLength(1);
	});
});

describe('StyleAgent — task resolution', () => {
	it('resolveTask("style_check") has scene_only policy', () => {
		const task = resolveTask('style_check', mockUiCtx);
		expect(task.taskType).toBe('style_check');
		expect(task.contextPolicy).toBe('scene_only');
		expect(task.outputFormat).toBe('json_style_deviations');
	});
});

describe('StyleAgent — prompt construction', () => {
	it('buildPrompt for style_check contains 5 sections', () => {
		const task = resolveTask('style_check', mockUiCtx);
		const prompt = buildPrompt(task, mockSceneCtx);
		['## ROLE', '## TASK', '## CONTEXT', '## CONSTRAINTS', '## OUTPUT FORMAT'].forEach((s) => {
			expect(prompt).toContain(s);
		});
	});
});
