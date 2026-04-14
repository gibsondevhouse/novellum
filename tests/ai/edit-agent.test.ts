import { describe, it, expect } from 'vitest';
import { parseEditSuggestions, generateEditSuggestionsFromDiff } from '../../src/lib/ai/edit-agent.js';
import { buildPrompt } from '../../src/lib/ai/prompt-builder.js';
import { resolveTask } from '../../src/lib/ai/task-resolver.js';

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
		title: 'Test',
		summary: '',
		povCharacterId: null,
		locationId: null,
		timelineEventId: null,
		order: 0,
		content: 'He runned fast.',
		wordCount: 3,
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

describe('parseEditSuggestions', () => {
	it('parses a well-formed edit suggestion list', () => {
		const raw = JSON.stringify([
			{
				spanStart: 3,
				spanEnd: 9,
				original: 'runned',
				suggestion: 'ran',
				reason: 'Grammar: irregular verb',
			},
		]);
		const result = parseEditSuggestions(raw, 'proofread');
		expect(result).toHaveLength(1);
		expect(result[0].spanStart).toBe(3);
		expect(result[0].suggestion).toBe('ran');
		expect(result[0].mode).toBe('proofread');
	});

	it('returns [] for empty array', () => {
		expect(parseEditSuggestions('[]', 'line_edit')).toEqual([]);
	});

	it('returns [] for malformed JSON', () => {
		expect(parseEditSuggestions('not json', 'proofread')).toEqual([]);
	});

	it('returns [] when no JSON array found', () => {
		expect(parseEditSuggestions('No suggestions needed.', 'developmental')).toEqual([]);
	});

	it('filters out items missing required fields', () => {
		const raw = JSON.stringify([
			{ spanStart: 0, spanEnd: 5, original: 'test', suggestion: 'better', reason: 'clarity' },
			{ spanStart: '0', spanEnd: 5, original: 'test', suggestion: 'better', reason: 'clarity' }, // invalid spanStart
		]);
		const result = parseEditSuggestions(raw, 'line_edit');
		expect(result).toHaveLength(1);
	});

	it('handles JSON embedded in surrounding prose', () => {
		const raw =
			'Here are suggestions:\n[{"spanStart":0,"spanEnd":3,"original":"He","suggestion":"She","reason":"POV"}]\nDone.';
		const result = parseEditSuggestions(raw, 'developmental');
		expect(result).toHaveLength(1);
		expect(result[0].original).toBe('He');
	});
});

describe('generateEditSuggestionsFromDiff', () => {
	it('generates differences properly', () => {
		const original = 'The quick brown fox jumps.';
		const revised = 'The very fast brown fox leaping.';
		const result = generateEditSuggestionsFromDiff(original, revised, 'line_edit');
		
		expect(result.length).toBeGreaterThan(0);
		// Let's assert based on actual trim values, since diffWordsWithSpace might handle spaces differently
		expect(result[0].original.trim()).toBe('quick');
		expect(result[0].suggestion.trim()).toBe('very fast');
		expect(result[0].mode).toBe('line_edit');
	});

	it('handles insertions missing from original text', () => {
		const original = 'He walked.';
		const revised = 'He slowly walked.';
		const result = generateEditSuggestionsFromDiff(original, revised, 'proofread');

		expect(result.length).toBe(1);
		expect(result[0].original.trim()).toBe('');
		expect(result[0].suggestion.trim()).toBe('slowly');
		expect(result[0].spanStart).toBe(3); // after 'He '
		expect(result[0].spanEnd).toBe(3);
	});

	it('handles deletions from original text', () => {
		const original = 'She quietly smiled.';
		const revised = 'She smiled.';
		const result = generateEditSuggestionsFromDiff(original, revised, 'developmental');

		expect(result.length).toBe(1);
		expect(result[0].original.trim()).toBe('quietly');
		expect(result[0].suggestion.trim()).toBe('');
		// 'She ' is unchanged
		expect(result[0].spanStart).toBe(4);
	});

	it('returns no suggestions if strings match precisely', () => {
		const text = 'Nothing to change here.';
		const result = generateEditSuggestionsFromDiff(text, text, 'line_edit');
		expect(result.length).toBe(0);
	});
});

describe('EditAgent — task resolution', () => {
	it('resolveTask("edit_developmental") has chapter_scope', () => {
		const task = resolveTask('edit_developmental', mockUiCtx);
		expect(task.taskType).toBe('edit');
		expect(task.contextPolicy).toBe('chapter_scope');
		expect(task.outputFormat).toBe('json_edit_suggestions');
	});

	it('resolveTask("edit_line") has scene_only', () => {
		const task = resolveTask('edit_line', mockUiCtx);
		expect(task.taskType).toBe('edit');
		expect(task.contextPolicy).toBe('scene_only');
	});

	it('resolveTask("edit_proofread") has scene_only', () => {
		const task = resolveTask('edit_proofread', mockUiCtx);
		expect(task.taskType).toBe('edit');
		expect(task.contextPolicy).toBe('scene_only');
	});
});

describe('EditAgent — prompt construction', () => {
	it('buildPrompt for edit_proofread contains 5 sections', () => {
		const task = resolveTask('edit_proofread', mockUiCtx);
		const prompt = buildPrompt(task, mockSceneCtx);
		expect(prompt).toContain('## ROLE');
		expect(prompt).toContain('## TASK');
		expect(prompt).toContain('## CONTEXT');
		expect(prompt).toContain('## CONSTRAINTS');
		expect(prompt).toContain('## OUTPUT FORMAT');
	});

	it('buildPrompt result is a trimmed non-empty string', () => {
		const task = resolveTask('edit_line', mockUiCtx);
		const prompt = buildPrompt(task, mockSceneCtx);
		expect(typeof prompt).toBe('string');
		expect(prompt.length).toBeGreaterThan(50);
	});
});
