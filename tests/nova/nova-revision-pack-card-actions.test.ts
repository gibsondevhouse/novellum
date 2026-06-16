import { describe, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import type { AuthorRevisionPack } from '$lib/ai/pipeline/author-schemas.js';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import NovaRevisionPackCard from '$modules/nova/components/NovaRevisionPackCard.svelte';

function envelope(): PipelineArtifactEnvelope<AuthorRevisionPack> {
	return {
		id: 'artifact-1',
		taskKey: 'vibe-author.revision-pack',
		pipeline: 'vibe-author',
		stage: 'revision-pack',
		model: 'test-model',
		lifecycle: 'draft',
		parserVersion: '1.0.0',
		producedAt: '2026-06-15T12:00:00.000Z',
		hierarchy: {
			order: ['arcs', 'acts', 'milestones', 'chapters', 'scenes', 'beats', 'stages'],
			references: {
				arcs: [],
				acts: [],
				milestones: [],
				chapters: [],
				scenes: [],
				beats: [],
				stages: [],
			},
			stageStatusById: {},
		},
		payload: {
			summary: 'Two issues.',
			issues: [
				{
					id: 'issue-1',
					severity: 'high',
					kind: 'continuity',
					location: 'Scene 1',
					description: 'Timeline mismatch.',
					recommendation: 'Adjust the date.',
				},
				{
					id: 'issue-2',
					severity: 'low',
					kind: 'style',
					location: 'Scene 2',
					description: 'Loose verb.',
					recommendation: 'Tighten it.',
				},
			],
			continuityFixes: [],
			stylisticSuggestions: [],
		},
		notes: [],
	};
}

describe('NovaRevisionPackCard acknowledgement persistence states', () => {
	it('renders persisted acknowledged issue ids as disabled', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaRevisionPackCard, {
			target,
			props: {
				envelope: envelope(),
				acknowledgedIssueIds: ['issue-1'],
				onAcknowledge: vi.fn(),
			},
		});
		flushSync();

		const buttons = Array.from(
			target.querySelectorAll('[data-testid="nova-revision-acknowledge"]'),
		) as HTMLButtonElement[];
		expect(buttons[0]?.textContent?.trim()).toBe('Acknowledged');
		expect(buttons[0]?.disabled).toBe(true);
		expect(buttons[1]?.textContent?.trim()).toBe('Acknowledge');
		expect(buttons[1]?.disabled).toBe(false);
		unmount(cmp);
	});

	it('updates acknowledgement state only after persistence succeeds', async () => {
		let resolveAction: (value: { artifactKey: string; acknowledgedIssueIds: string[]; updatedAt: string }) => void;
		const pending = new Promise<{ artifactKey: string; acknowledgedIssueIds: string[]; updatedAt: string }>(
			(resolve) => {
				resolveAction = resolve;
			},
		);
		const onAcknowledge = vi.fn(() => pending);
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaRevisionPackCard, {
			target,
			props: { envelope: envelope(), onAcknowledge },
		});
		flushSync();

		const button = target.querySelector('[data-testid="nova-revision-acknowledge"]') as HTMLButtonElement;
		button.click();
		flushSync();
		expect(button.textContent?.trim()).toBe('Saving...');
		expect(button.disabled).toBe(true);

		resolveAction!({
			artifactKey: 'revision-pack:artifact-1',
			acknowledgedIssueIds: ['issue-1'],
			updatedAt: '2026-06-15T12:00:00.000Z',
		});
		await tick();
		await tick();
		flushSync();

		expect(button.textContent?.trim()).toBe('Acknowledged');
		expect(button.disabled).toBe(true);
		unmount(cmp);
	});

	it('surfaces acknowledgement failures and leaves the button retryable', async () => {
		const onAcknowledge = vi.fn(async () => {
			throw new Error('Could not save acknowledgement.');
		});
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaRevisionPackCard, {
			target,
			props: { envelope: envelope(), onAcknowledge },
		});
		flushSync();

		const button = target.querySelector('[data-testid="nova-revision-acknowledge"]') as HTMLButtonElement;
		button.click();
		await tick();
		await tick();
		flushSync();

		expect(target.textContent).toContain('Could not save acknowledgement.');
		expect(button.textContent?.trim()).toBe('Acknowledge');
		expect(button.disabled).toBe(false);
		unmount(cmp);
	});
});
