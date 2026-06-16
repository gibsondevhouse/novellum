import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, unmount, flushSync, tick } from 'svelte';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import { OUTLINE_HIERARCHY } from '$lib/ai/pipeline/contracts.js';
import type { AuthorOutline, AuthorRevisionPack } from '$lib/ai/pipeline/author-schemas.js';
import type { AuthorSceneDraftPayload } from '$lib/ai/pipeline/author-agent.js';
import type { AuthorDraftCheckpoint } from '$lib/ai/pipeline/author-draft-contract.js';
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

function makeCheckpoint(lifecycle: AuthorDraftCheckpoint['lifecycle'] = 'review'): AuthorDraftCheckpoint {
	return {
		id: 'checkpoint-1',
		projectId: 'p1',
		taskKey: 'vibe-author.scene-draft',
		sceneId: 'scene-1',
		chapterId: 'chapter-1',
		artifactEnvelope: {
			type: 'vibe-author.scene-draft',
			version: 1,
			projectId: 'p1',
			sceneId: 'scene-1',
			chapterId: 'chapter-1',
			prose: sceneDraftEnvelope.payload.prose,
			wordCount: 12,
			sidecar: {
				sceneId: 'scene-1',
				chapterId: 'chapter-1',
				povCharacterId: 'iri',
				wordCount: 12,
				usedCanonRefs: ['characterId:iri'],
				uncertainties: [],
				continuityRisks: [],
			},
		},
		lifecycle,
		createdAt: '2026-05-27T22:00:00.000Z',
		updatedAt: '2026-05-27T22:00:00.000Z',
		baseSceneUpdatedAt: '2026-05-27T21:00:00.000Z',
		baseSceneContentHash: 'hash',
	};
}

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

	it('outline card is read-only compatibility output without an apply action', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaOutlineCard, {
			target,
			props: { envelope: outlineEnvelope, projectId: 'p1' },
		});
		flushSync();

		expect(target.querySelector('[data-testid="nova-outline-card"]')).not.toBeNull();
		expect(target.textContent).toContain('Outline preview');
		expect(target.textContent).toContain('read-only');
		expect(target.textContent).toContain('Only checkpoint proposals can be accepted');
		expect(target.textContent).toContain('Copy outline data');
		expect(target.textContent).not.toContain('Apply To Outline');
		unmount(cmp);
	});

	it('scene draft card saves for review before allowing confirmed apply', async () => {
		const checkpoint = makeCheckpoint();
		const onAccept = vi.fn(async () => ({
			action: 'accept' as const,
			classification: 'review_decision' as const,
			status: 'succeeded' as const,
			durability: 'durable' as const,
			target: {
				artifactId: sceneDraftEnvelope.id,
				artifactKind: 'author-scene-draft' as const,
				taskKey: sceneDraftEnvelope.taskKey,
				projectId: 'p1',
				sceneId: 'scene-1',
				checkpointId: checkpoint.id,
				issueId: null,
				producedAt: sceneDraftEnvelope.producedAt,
			},
			message: 'Draft saved for review. Confirm before applying it to the scene.',
			data: { checkpoint },
		}));
		const onConfirmAccept = vi.fn(async () => ({
			action: 'accept' as const,
			classification: 'review_decision' as const,
			status: 'succeeded' as const,
			durability: 'durable' as const,
			target: {
				artifactId: sceneDraftEnvelope.id,
				artifactKind: 'author-scene-draft' as const,
				taskKey: sceneDraftEnvelope.taskKey,
				projectId: 'p1',
				sceneId: 'scene-1',
				checkpointId: checkpoint.id,
				issueId: null,
				producedAt: sceneDraftEnvelope.producedAt,
			},
			message: 'Draft applied to scene.',
			data: { checkpoint: makeCheckpoint('accepted') },
		}));
		const onReject = vi.fn();
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaSceneDraftCard, {
			target,
			props: { envelope: sceneDraftEnvelope, onAccept, onConfirmAccept, onReject },
		});
		flushSync();

		const accept = target.querySelector('[data-testid="nova-scene-draft-accept"]') as HTMLButtonElement;
		const reject = target.querySelector('[data-testid="nova-scene-draft-reject"]') as HTMLButtonElement;
		const copy = target.querySelector('[data-testid="nova-scene-draft-copy"]') as HTMLButtonElement;
		expect(accept).not.toBeNull();
		expect(reject).not.toBeNull();
		expect(copy).not.toBeNull();

		accept.click();
		await tick();
		await tick();
		flushSync();
		expect(onAccept).toHaveBeenCalledTimes(1);
		expect(onAccept).toHaveBeenCalledWith(sceneDraftEnvelope);
		expect(onReject).not.toHaveBeenCalled();
		expect(accept.disabled).toBe(true);
		expect(reject.disabled).toBe(true);
		expect(target.textContent).toContain('Confirm apply');
		expect(target.textContent).not.toContain('Draft applied to scene.');

		const confirm = target.querySelector('[data-testid="nova-scene-draft-confirm-accept"]') as HTMLButtonElement;
		confirm.click();
		await tick();
		await tick();
		flushSync();
		expect(onConfirmAccept).toHaveBeenCalledWith(sceneDraftEnvelope, checkpoint, {
			forceOverwrite: false,
		});
		expect(target.textContent).toContain('Draft applied to scene.');
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
		const onAcknowledge = vi.fn(async () => ({
			artifactKey: 'revision-pack:vibe-author.revision-pack:1',
			acknowledgedIssueIds: ['issue-1'],
			updatedAt: '2026-06-15T12:00:00.000Z',
		}));
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
		await tick();
		await tick();
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
	const novaIndexSource = readFileSync(resolve(process.cwd(), 'src/modules/nova/index.ts'), 'utf-8');

	it('artifact cards do not import editor mutation modules', () => {
		for (const source of [sceneCardSource, revisionCardSource, outlineCardSource]) {
			expect(source).not.toContain('$modules/editor');
			expect(source).not.toContain('scene-repository');
			expect(source).not.toContain('updateScene(');
			expect(source).not.toContain('setProjectMetadata(');
		}
		expect(outlineCardSource).not.toContain('applyAuthorOutlineArtifact');
		expect(outlineCardSource).not.toContain('/api/nova/outline/apply');
	});

	it('author runner only produces artifacts and does not import manuscript mutation paths', () => {
		expect(runnerSource).toContain('novaSession.attachArtifact');
		expect(runnerSource).not.toContain('$modules/editor');
		expect(runnerSource).not.toContain('scene-repository');
		expect(runnerSource).not.toContain('updateScene(');
		expect(runnerSource).not.toContain('/api/db/scenes');
	});

	it('does not expose the legacy outline artifact card through the public Nova barrel', () => {
		expect(novaIndexSource).not.toContain('NovaOutlineCard');
		expect(novaIndexSource).toContain('NovaOutlineDraftCheckpointCard');
	});
});
