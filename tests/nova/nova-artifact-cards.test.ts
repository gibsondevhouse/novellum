import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, unmount, flushSync, tick } from 'svelte';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import { OUTLINE_HIERARCHY } from '$lib/ai/pipeline/contracts.js';
import type { AuthorOutline, AuthorRevisionPack } from '$lib/ai/pipeline/author-schemas.js';
import type { AuthorSceneDraftPayload } from '$lib/ai/pipeline/author-agent.js';
import NovaOutlineCard from '$modules/nova/components/NovaOutlineCard.svelte';
import NovaSceneDraftCard from '$modules/nova/components/NovaSceneDraftCard.svelte';
import NovaRevisionPackCard from '$modules/nova/components/NovaRevisionPackCard.svelte';

function makeEnvelope<TPayload>(
	taskKey: string,
	stage: string,
	payload: TPayload,
): PipelineArtifactEnvelope<TPayload> {
	return {
		id: `${taskKey}:1`,
		taskKey,
		pipeline: 'vibe-author',
		stage,
		model: 'mock/model',
		lifecycle: 'draft',
		parserVersion: '1.0.0',
		producedAt: '2026-05-27T22:00:00.000Z',
		hierarchy: {
			order: OUTLINE_HIERARCHY,
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
		payload,
		notes: [],
	};
}

const outlineEnvelope = makeEnvelope<AuthorOutline>(
	'vibe-author.outline',
	'outline',
	{
		arcs: [{ id: 'arc-1', title: 'Arc 1' }],
		acts: [],
		milestones: [],
		chapters: [{ id: 'chapter-1', title: 'Chapter 1' }],
		scenes: [],
		beats: [],
	} as unknown as AuthorOutline,
);

const sceneDraftEnvelope = makeEnvelope<AuthorSceneDraftPayload>(
	'vibe-author.scene-draft',
	'scene-draft',
	{
		prose: 'Iri crossed the skymarket as rain hit the copper roofs.',
		sidecar: {
			sceneId: 'scene-1',
			chapterId: 'chapter-1',
			povCharacterId: 'iri',
			wordCount: 12,
			usedCanonRefs: {
				characterIds: ['iri'],
				locationIds: [],
				factionIds: [],
				loreEntryIds: [],
			},
			uncertainties: [],
			continuityRisks: [],
		},
	},
);

const revisionPackEnvelope = makeEnvelope<AuthorRevisionPack>(
	'vibe-author.revision-pack',
	'revision-pack',
	{
		summary: 'Two critical issues found.',
		issues: [
			{
				id: 'issue-1',
				severity: 'critical',
				kind: 'continuity',
				location: 'scene-1 paragraph 2',
				description: 'POV slips to another character.',
				recommendation: 'Re-anchor in Iri perspective.',
			},
		],
	} as unknown as AuthorRevisionPack,
);

function installClipboard(writeText: ReturnType<typeof vi.fn>) {
	Object.defineProperty(window.navigator, 'clipboard', {
		value: { writeText },
		configurable: true,
		writable: true,
	});
}

describe('Nova artifact cards', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('outline card keeps review semantics explicit as draft-only + copy-only', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaOutlineCard, {
			target,
			props: { envelope: outlineEnvelope },
		});
		flushSync();

		expect(target.querySelector('[data-testid="nova-outline-card"]')).not.toBeNull();
		expect(target.textContent).toContain('Draft artifact');
		expect(target.textContent).toContain('Draft only. Nothing is applied to the outline');
		expect(target.querySelector('.outline-card__btn')?.textContent).toContain('Copy');
		unmount(cmp);
	});

	it('scene draft card exposes explicit review actions and emits accept without direct mutation', () => {
		const onAccept = vi.fn();
		const onReject = vi.fn();
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaSceneDraftCard, {
			target,
			props: { envelope: sceneDraftEnvelope, onAccept, onReject },
		});
		flushSync();

		const accept = target.querySelector('[data-testid="nova-scene-draft-accept"]') as HTMLButtonElement;
		const reject = target.querySelector('[data-testid="nova-scene-draft-reject"]') as HTMLButtonElement;
		const copy = target.querySelector('[data-testid="nova-scene-draft-copy"]') as HTMLButtonElement;
		expect(accept).not.toBeNull();
		expect(reject).not.toBeNull();
		expect(copy).not.toBeNull();

		accept.click();
		flushSync();
		expect(onAccept).toHaveBeenCalledTimes(1);
		expect(onAccept).toHaveBeenCalledWith(sceneDraftEnvelope);
		expect(onReject).not.toHaveBeenCalled();
		expect(accept.disabled).toBe(true);
		expect(reject.disabled).toBe(true);
		expect(target.textContent).toContain('Marked as accepted');
		unmount(cmp);
	});

	it('scene draft card surfaces provenance and handles clipboard failure gracefully', async () => {
		const writeText = vi.fn().mockRejectedValue(new Error('blocked'));
		installClipboard(writeText);
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaSceneDraftCard, {
			target,
			props: { envelope: sceneDraftEnvelope },
		});
		flushSync();

		expect(target.textContent).toContain('Task');
		expect(target.textContent).toContain('vibe-author.scene-draft');
		expect(target.textContent).toContain('Model');
		expect(target.textContent).toContain('mock/model');
		expect(target.textContent).toContain('Generated');

		const copy = target.querySelector('[data-testid="nova-scene-draft-copy"]') as HTMLButtonElement;
		copy.click();
		await tick();
		expect(writeText).toHaveBeenCalledWith(sceneDraftEnvelope.payload.prose);
		expect(copy.textContent?.trim()).toBe('Copy');
		unmount(cmp);
	});

	it('revision pack card preserves review-gate actions, provenance, and clipboard fallback path', async () => {
		const onAcknowledge = vi.fn();
		const writeText = vi.fn().mockRejectedValue(new Error('blocked'));
		installClipboard(writeText);
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaRevisionPackCard, {
			target,
			props: { envelope: revisionPackEnvelope, onAcknowledge },
		});
		flushSync();

		expect(target.textContent).toContain('Task');
		expect(target.textContent).toContain('vibe-author.revision-pack');
		expect(target.textContent).toContain('Model');
		expect(target.textContent).toContain('mock/model');
		expect(target.textContent).toContain('Generated');

		const acknowledge = target.querySelector(
			'[data-testid="nova-revision-acknowledge"]',
		) as HTMLButtonElement;
		acknowledge.click();
		flushSync();
		expect(onAcknowledge).toHaveBeenCalledWith('issue-1', revisionPackEnvelope);
		expect(acknowledge.disabled).toBe(true);
		expect(acknowledge.textContent?.trim()).toBe('Acknowledged');

		const copy = target.querySelector('[data-testid="nova-revision-pack-copy"]') as HTMLButtonElement;
		copy.click();
		await tick();
		expect(writeText).toHaveBeenCalledWith(
			JSON.stringify(revisionPackEnvelope.payload, null, 2),
		);
		expect(copy.textContent?.trim()).toBe('Copy JSON');
		unmount(cmp);
	});
});

describe('Nova artifact source contracts', () => {
	const sceneCardSource = readFileSync(
		resolve(process.cwd(), 'src/modules/nova/components/NovaSceneDraftCard.svelte'),
		'utf-8',
	);
	const revisionCardSource = readFileSync(
		resolve(process.cwd(), 'src/modules/nova/components/NovaRevisionPackCard.svelte'),
		'utf-8',
	);
	const outlineCardSource = readFileSync(
		resolve(process.cwd(), 'src/modules/nova/components/NovaOutlineCard.svelte'),
		'utf-8',
	);
	const runnerSource = readFileSync(
		resolve(process.cwd(), 'src/modules/nova/services/author-pipeline-runner.ts'),
		'utf-8',
	);

	it('artifact cards do not import editor mutation modules', () => {
		for (const source of [sceneCardSource, revisionCardSource, outlineCardSource]) {
			expect(source).not.toContain('$modules/editor');
			expect(source).not.toContain('scene-repository');
			expect(source).not.toContain('updateScene(');
			expect(source).not.toContain('setProjectMetadata(');
		}
	});

	it('author runner only produces artifacts and does not import manuscript mutation paths', () => {
		expect(runnerSource).toContain('novaSession.attachArtifact');
		expect(runnerSource).not.toContain('$modules/editor');
		expect(runnerSource).not.toContain('scene-repository');
		expect(runnerSource).not.toContain('updateScene(');
		expect(runnerSource).not.toContain('/api/db/scenes');
	});
});
