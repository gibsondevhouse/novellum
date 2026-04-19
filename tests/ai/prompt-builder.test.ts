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
		notes: '',
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
			pronunciation: 'MEER-uh',
			aliases: ['M'],
			diasporaOrigin: 'Harbor Reach',
			photoUrl: '',
			bio: 'A determined young woman arriving at the threshold of change.',
			faction: 'Independent',
			anomalies: ['Keeps a weather map in her pulse'],
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
	locations: [
		{
			id: 'loc-1',
			projectId: 'proj-1',
			name: 'Train Station',
			description: 'Foggy and damp.',
			tags: [],
			createdAt: '2026-01-01T00:00:00Z',
			updatedAt: '2026-01-01T00:00:00Z',
		}
	],
	loreEntries: [
		{
			id: 'lore-1',
			projectId: 'proj-1',
			title: 'The Fog',
			category: 'Environment',
			content: 'A magical fog.',
			tags: [],
			createdAt: '2026-01-01T00:00:00Z',
			updatedAt: '2026-01-01T00:00:00Z',
		}
	],
	plotThreads: [
		{
			id: 'pt-1',
			projectId: 'proj-1',
			title: 'Find the truth',
			description: 'She must find it.',
			status: 'active',
			relatedSceneIds: [],
			relatedCharacterIds: [],
			createdAt: '2026-01-01T00:00:00Z',
			updatedAt: '2026-01-01T00:00:00Z',
		}
	],
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

	it('includes SPECIFIC COMMAND when instruction is provided', () => {
		const instructionTask: AiTask = { ...task, instruction: 'Make the dialogue snappier.' };
		const prompt = buildPrompt(instructionTask, richCtx);
		expect(prompt).toContain('## SPECIFIC COMMAND');
		expect(prompt).toContain('Make the dialogue snappier.');
	});

	it('includes custom writing styles when provided', () => {
		const styleCtx: AiContext = {
			...emptyCtx,
			writingStyles: [
				{
					id: 'ws-1',
					projectId: 'proj-1',
					title: 'Hemingway',
					description: 'Short and punchy',
					exampleText: 'The man was old.',
					createdAt: '',
					updatedAt: '',
				}
			]
		};
		const prompt = buildPrompt(task, styleCtx);
		expect(prompt).toContain('CUSTOM WRITING STYLES:');
		expect(prompt).toContain('Hemingway: Short and punchy');
		expect(prompt).toContain('Example: The man was old.');
	});

	it('includes default system prompt when provided', () => {
		const sysPromptCtx: AiContext = {
			...emptyCtx,
			systemPrompts: [
				{ id: 'sp-1', projectId: 'p-1', name: 'SP1', content: 'Not default', isDefault: 0, createdAt: '', updatedAt: '' },
				{ id: 'sp-2', projectId: 'p-1', name: 'SP2', content: 'You are custom bot', isDefault: 1, createdAt: '', updatedAt: '' },
			]
		};
		const prompt = buildPrompt(task, sysPromptCtx);
		expect(prompt).toContain('SYSTEM PROMPT:');
		expect(prompt).toContain('You are custom bot');
		expect(prompt).not.toContain('Not default');
	});

	it('includes custom chat instructions when provided', () => {
		const chatCtx: AiContext = {
			...emptyCtx,
			chatInstructions: [
				{ id: 'ci-1', projectId: 'p-1', name: 'CI1', content: 'Be terse', isDefault: 1, createdAt: '', updatedAt: '' },
			]
		};
		const prompt = buildPrompt(task, chatCtx);
		expect(prompt).toContain('CUSTOM INSTRUCTIONS:');
		expect(prompt).toContain('Be terse');
	});
});
