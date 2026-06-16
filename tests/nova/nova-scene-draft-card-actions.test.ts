import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import type { AuthorSceneDraftPayload } from '$lib/ai/pipeline/author-agent.js';
import type { AuthorDraftCheckpoint } from '$lib/ai/pipeline/author-draft-contract.js';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import type { NovaArtifactActionResult } from '$modules/nova/services/artifact-action-types.js';
import type { StageInlineSceneDraftResultData } from '$modules/nova/services/inline-scene-draft-actions.js';
import NovaSceneDraftCard from '$modules/nova/components/NovaSceneDraftCard.svelte';

function envelope(): PipelineArtifactEnvelope<AuthorSceneDraftPayload> {
	return {
		id: 'artifact-1',
		taskKey: 'vibe-author.scene-draft',
		pipeline: 'vibe-author',
		stage: 'scene-draft',
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
				scenes: ['scene-1'],
				beats: [],
				stages: [],
			},
			stageStatusById: {},
		},
		payload: {
			prose: 'Draft prose.',
			sidecar: {
				sceneId: 'scene-1',
				chapterId: 'chapter-1',
				povCharacterId: null,
				wordCount: 2,
				usedCanonRefs: {
					characterIds: [],
					locationIds: [],
					factionIds: [],
					loreEntryIds: [],
				},
				uncertainties: [],
				continuityRisks: [],
			},
		},
		notes: [],
	};
}

function checkpoint(lifecycle: AuthorDraftCheckpoint['lifecycle'] = 'review'): AuthorDraftCheckpoint {
	return {
		id: 'checkpoint-1',
		projectId: 'project-1',
		taskKey: 'vibe-author.scene-draft',
		sceneId: 'scene-1',
		chapterId: 'chapter-1',
		artifactEnvelope: {
			type: 'vibe-author.scene-draft',
			version: 1,
			projectId: 'project-1',
			sceneId: 'scene-1',
			chapterId: 'chapter-1',
			prose: 'Draft prose.',
			wordCount: 2,
			sidecar: {
				sceneId: 'scene-1',
				chapterId: 'chapter-1',
				povCharacterId: null,
				wordCount: 2,
				usedCanonRefs: [],
				uncertainties: [],
				continuityRisks: [],
			},
		},
		lifecycle,
		createdAt: '2026-06-15T12:00:00.000Z',
		updatedAt: '2026-06-15T12:00:00.000Z',
		baseSceneUpdatedAt: '2026-06-15T11:00:00.000Z',
		baseSceneContentHash: 'hash',
	};
}

function actionResult(
	message: string,
	lifecycle: AuthorDraftCheckpoint['lifecycle'] = 'review',
): NovaArtifactActionResult<StageInlineSceneDraftResultData> {
	const env = envelope();
	const cp = checkpoint(lifecycle);
	return {
		action: 'accept',
		classification: 'review_decision',
		status: 'succeeded',
		durability: 'durable',
		target: {
			artifactId: env.id,
			artifactKind: 'author-scene-draft',
			taskKey: env.taskKey,
			projectId: cp.projectId,
			sceneId: cp.sceneId,
			checkpointId: cp.id,
			issueId: null,
			producedAt: env.producedAt,
		},
		message,
		data: { checkpoint: cp },
	};
}

describe('NovaSceneDraftCard durable action states', () => {
	it('does not claim acceptance while the save-for-review action is pending', async () => {
		let resolveAction: (value: NovaArtifactActionResult<StageInlineSceneDraftResultData>) => void;
		const pending = new Promise<NovaArtifactActionResult<StageInlineSceneDraftResultData>>((resolve) => {
			resolveAction = resolve;
		});
		const onAccept = vi.fn(() => pending);
		const onConfirmAccept = vi.fn(async () => actionResult('Draft applied to scene.', 'accepted'));
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaSceneDraftCard, {
			target,
			props: { envelope: envelope(), onAccept, onConfirmAccept, onReject: vi.fn() },
		});
		flushSync();

		const accept = target.querySelector('[data-testid="nova-scene-draft-accept"]') as HTMLButtonElement;
		accept.click();
		flushSync();

		expect(target.textContent).toContain('Saving...');
		expect(target.textContent).not.toContain('Draft applied to scene.');
		expect(target.textContent).not.toContain('Marked as accepted');

		resolveAction!(actionResult('Draft saved for review. Confirm before applying it to the scene.'));
		await tick();
		await tick();
		flushSync();
		expect(target.textContent).toContain('Confirm apply');

		unmount(cmp);
	});

	it('shows a blocked state instead of local success when handlers are unavailable', async () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(NovaSceneDraftCard, {
			target,
			props: { envelope: envelope() },
		});
		flushSync();

		const accept = target.querySelector('[data-testid="nova-scene-draft-accept"]') as HTMLButtonElement;
		accept.click();
		await tick();

		expect(target.textContent).toContain('cannot be saved for review');
		expect(target.textContent).not.toContain('Marked as accepted');
		unmount(cmp);
	});
});

describe('NovaMessageLog scene draft source contract', () => {
	const source = readFileSync(
		resolve(process.cwd(), 'src/modules/nova/components/NovaMessageLog.svelte'),
		'utf-8',
	);

	it('passes durable scene-draft handlers into inline scene draft cards', () => {
		expect(source).toContain('onAccept={handleSceneDraftAccept}');
		expect(source).toContain('onConfirmAccept={handleSceneDraftConfirmAccept}');
		expect(source).toContain('onReject={handleSceneDraftReject}');
		expect(source).toContain('stageInlineSceneDraftCheckpoint');
		expect(source).toContain('acceptSceneDraftCheckpoint');
		expect(source).toContain('rejectInlineSceneDraftCheckpoint');
	});
});
