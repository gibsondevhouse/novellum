import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../../src/lib/ai/prompt-builder.js';
import type { AiTask, AiContext } from '../../src/lib/ai/types.js';

const task: AiTask = {
	taskType: 'draft',
	role: 'You are a literary fiction drafter.',
	targetEntityId: 'scene-1',
	contextPolicy: 'scene_only',
	outputFormat: 'prose',
};

const emptyCtx: AiContext = {
	policy: 'scene_only',
	scene: null,
	adjacentScenes: [],
	chapter: null,
	beats: [],
	characters: [],
	locations: [],
	loreEntries: [],
	plotThreads: [],
};

const richCtx: AiContext = {
	policy: 'scene_only',
	scene: {
		id: 'scene-1',
		chapterId: 'ch-1',
		projectId: 'proj-1',
		title: 'Opening Scene',
		summary: 'The protagonist arrives.',
		content: 'She stepped off the train into the fog.',
		wordCount: 10,
		order: 1,
		povCharacterId: 'char-1',
		locationId: 'loc-1',
		timelineEventId: null,
		characterIds: ['char-1'],
		locationIds: ['loc-1'],
		createdAt: '2026-01-01T00:00:00Z',
		updatedAt: '2026-01-01T00:00:00Z',
	},
	adjacentScenes: [],
	chapter: null,
	beats: [],
	characters: [
		{
			id: 'char-1',
			projectId: 'proj-1',
			name: 'Mira',
			role: 'Protagonist',
			traits: ['determined'],
			goals: [],
			flaws: [],
			arcs: [],
			notes: '',
			tags: [],
			createdAt: '2026-01-01T00:00:00Z',
			updatedAt: '2026-01-01T00:00:00Z',
		},
	],
	locations: [],
	loreEntries: [],
	plotThreads: [],
};

describe('prompt-builder', () => {
	it('produces a prompt with all 5 sections', () => {
		const prompt = buildPrompt(task, emptyCtx);
		expect(prompt).toContain('## ROLE');
		expect(prompt).toContain('## TASK');
		expect(prompt).toContain('## CONTEXT');
		expect(prompt).toContain('## CONSTRAINTS');
		expect(prompt).toContain('## OUTPUT FORMAT');
	});

	it('includes task role in ROLE section', () => {
		const prompt = buildPrompt(task, emptyCtx);
		expect(prompt).toContain('You are a literary fiction drafter.');
	});

	it('includes character names when present', () => {
		const prompt = buildPrompt(task, richCtx);
		expect(prompt).toContain('Mira');
	});

	it('includes scene title when present', () => {
		const prompt = buildPrompt(task, richCtx);
		expect(prompt).toContain('Opening Scene');
	});

	it('does not exceed MAX_PROMPT_CHARS with very large context', () => {
		const largeCtx: AiContext = {
			...richCtx,
			scene: richCtx.scene ? { ...richCtx.scene, content: 'x'.repeat(10000) } : null,
		};
		const prompt = buildPrompt(task, largeCtx);
		expect(prompt.length).toBeLessThanOrEqual(8000);
	});
});
