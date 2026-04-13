import { describe, it, expect } from 'vitest';
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
		title: 'Test Scene',
		summary: '',
		povCharacterId: null,
		locationId: null,
		timelineEventId: null,
		order: 0,
		content: 'The hero crossed the bridge.',
		wordCount: 5,
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

describe('SummaryAgent — task resolution', () => {
	it('resolveTask("summarize_scene") returns correct shape', () => {
		const task = resolveTask('summarize_scene', mockUiCtx);
		expect(task.taskType).toBe('summarize');
		expect(task.contextPolicy).toBe('scene_only');
		expect(task.outputFormat).toBe('plain_text');
	});

	it('resolveTask("summarize_chapter") returns correct shape', () => {
		const task = resolveTask('summarize_chapter', mockUiCtx);
		expect(task.taskType).toBe('summarize');
		expect(task.contextPolicy).toBe('chapter_scope');
		expect(task.outputFormat).toBe('plain_text');
	});
});

describe('SummaryAgent — prompt construction', () => {
	it('buildPrompt for summarize_scene contains 5 sections', () => {
		const task = resolveTask('summarize_scene', mockUiCtx);
		const prompt = buildPrompt(task, mockSceneCtx);
		expect(prompt).toContain('## ROLE');
		expect(prompt).toContain('## TASK');
		expect(prompt).toContain('## CONTEXT');
		expect(prompt).toContain('## CONSTRAINTS');
		expect(prompt).toContain('## OUTPUT FORMAT');
	});

	it('buildPrompt result is a trimmed string', () => {
		const task = resolveTask('summarize_scene', mockUiCtx);
		const prompt = buildPrompt(task, mockSceneCtx);
		expect(typeof prompt).toBe('string');
		expect(prompt).toBe(prompt.trim());
	});
});
