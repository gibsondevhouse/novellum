import { describe, expect, it } from 'vitest';
import { planNovaContext } from '../../src/modules/ai/services/nova-context-planner.js';
import type { NovaSessionContextItem } from '../../src/modules/ai/types.js';

function projectAttachment(id = 'proj-1', label = 'My Novel'): NovaSessionContextItem {
	return { kind: 'project', id: `project:${id}`, projectId: id, label };
}

function fileAttachment(id = 'file-1'): NovaSessionContextItem {
	return {
		kind: 'file',
		id,
		name: 'notes.txt',
		mimeType: 'text/plain',
		sizeBytes: 100,
		text: 'hello',
	};
}

describe('planNovaContext', () => {
	it('returns off when no attachments', () => {
		const plan = planNovaContext('Tell me about the project', [], []);
		expect(plan.mode).toBe('off');
		expect(plan.projectIds).toEqual([]);
	});

	it('returns off for empty prompt', () => {
		const plan = planNovaContext('', [projectAttachment()], []);
		expect(plan.mode).toBe('off');
	});

	it('returns off for generic prompt with project attached', () => {
		const plan = planNovaContext('Hello there', [projectAttachment()], []);
		expect(plan.mode).toBe('off');
		expect(plan.projectIds).toEqual([]);
	});

	it('returns summary for general project references', () => {
		const plan = planNovaContext('Tell me about this project', [projectAttachment()], []);
		expect(plan.mode).toBe('summary');
		expect(plan.projectIds).toEqual(['proj-1']);
		expect(plan.requestedScopes).toEqual([]);
	});

	it('returns targeted for character-related prompt', () => {
		const plan = planNovaContext(
			'Help me with the character arc for Aria',
			[projectAttachment()],
			[],
		);
		expect(plan.mode).toBe('targeted');
		expect(plan.requestedScopes).toContain('characters');
		expect(plan.requestedScopes).toContain('arcs');
		expect(plan.entityHints).toContain('Aria');
	});

	it('returns targeted for timeline-related prompt', () => {
		const plan = planNovaContext('Show me the timeline', [projectAttachment()], []);
		expect(plan.mode).toBe('targeted');
		expect(plan.requestedScopes).toContain('timeline');
	});

	it('returns full only for explicit phrases', () => {
		const plan = planNovaContext(
			'Do a full continuity audit of the whole project',
			[projectAttachment()],
			[],
		);
		expect(plan.mode).toBe('full');
	});

	it('returns full for "entire project"', () => {
		const plan = planNovaContext(
			'Analyze the entire project for me',
			[projectAttachment()],
			[],
		);
		expect(plan.mode).toBe('full');
	});

	it('does not return full just for the word project', () => {
		const plan = planNovaContext('Help me with this project plot', [projectAttachment()], []);
		expect(plan.mode).not.toBe('full');
	});

	it('extracts quoted entity hints', () => {
		const plan = planNovaContext(
			'Tell me about the character "Eli the Brave"',
			[projectAttachment()],
			[],
		);
		expect(plan.mode).toBe('targeted');
		expect(plan.entityHints).toContain('Eli the Brave');
	});

	it('zeroes projectIds when off', () => {
		const plan = planNovaContext('hello', [projectAttachment()], []);
		expect(plan.mode).toBe('off');
		expect(plan.projectIds).toEqual([]);
	});

	it('does not include files unless explicitly referenced', () => {
		const plan = planNovaContext(
			'Tell me about the timeline',
			[projectAttachment(), fileAttachment()],
			[],
		);
		expect(plan.includeFiles).toBe(false);
	});

	it('includes files when prompt references attachments', () => {
		const plan = planNovaContext(
			'Use the attached file to write a chapter',
			[projectAttachment(), fileAttachment()],
			[],
		);
		expect(plan.includeFiles).toBe(true);
	});
});
