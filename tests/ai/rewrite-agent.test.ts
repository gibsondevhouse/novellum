import { describe, it, expect } from 'vitest';
import { parseRewriteOptions } from '../../src/lib/ai/rewrite-agent.js';
import { resolveTask } from '../../src/lib/ai/task-resolver.js';
import { buildPrompt } from '../../src/lib/ai/prompt-builder.js';

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
		content: 'He ran.',
		wordCount: 2,
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

describe('parseRewriteOptions', () => {
	it('parses 3 valid options', () => {
		const raw = JSON.stringify([
			{ index: 1, text: 'He sprinted.' },
			{ index: 2, text: 'He bolted forward.' },
			{ index: 3, text: 'He moved at speed.' },
		]);
		const { options, error } = parseRewriteOptions(raw);
		expect(error).toBeNull();
		expect(options).toHaveLength(3);
		expect(options[0].text).toBe('He sprinted.');
	});

	it('returns error when fewer than 3 options', () => {
		const raw = JSON.stringify([
			{ index: 1, text: 'He sprinted.' },
			{ index: 2, text: 'He bolted.' },
		]);
		const { error } = parseRewriteOptions(raw);
		expect(error).not.toBeNull();
		expect(error).toContain('3');
	});

	it('returns error for malformed JSON', () => {
		const { error } = parseRewriteOptions('not json');
		expect(error).not.toBeNull();
	});

	it('returns error when no JSON array found', () => {
		const { error } = parseRewriteOptions('Here are the rewrites:');
		expect(error).not.toBeNull();
	});
});

describe('RewriteAgent — task resolution', () => {
	it('resolveTask("rewrite_options") has scene_only policy', () => {
		const task = resolveTask('rewrite_options', mockUiCtx);
		expect(task.taskType).toBe('rewrite');
		expect(task.contextPolicy).toBe('scene_only');
		expect(task.outputFormat).toBe('json_rewrite_options');
	});
});

describe('RewriteAgent — prompt construction', () => {
	it('buildPrompt for rewrite_options contains 5 sections', () => {
		const task = resolveTask('rewrite_options', mockUiCtx);
		const prompt = buildPrompt(task, mockSceneCtx);
		['## ROLE', '## TASK', '## CONTEXT', '## CONSTRAINTS', '## OUTPUT FORMAT'].forEach((s) => {
			expect(prompt).toContain(s);
		});
	});
});
