import { describe, expect, it, vi } from 'vitest';
import type { AuthorSceneDraftPayload } from '$lib/ai/pipeline/author-agent.js';
import type { AuthorDraftCheckpoint } from '$lib/ai/pipeline/author-draft-contract.js';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import {
	rejectInlineSceneDraftCheckpoint,
	stageInlineSceneDraftCheckpoint,
} from '$modules/nova/services/inline-scene-draft-actions.js';

function envelope(overrides: Partial<AuthorSceneDraftPayload['sidecar']> = {}): PipelineArtifactEnvelope<AuthorSceneDraftPayload> {
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
				scenes: [],
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
				...overrides,
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

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function requestBody(fetchMock: ReturnType<typeof vi.fn>): Record<string, unknown> {
	const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
	return JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
}

describe('inline scene draft actions', () => {
	it('returns insufficient context before making a request when project or scene is missing', async () => {
		const fetchMock = vi.fn();
		const result = await stageInlineSceneDraftCheckpoint(
			{
				projectId: null,
				envelope: envelope({ sceneId: '' }),
			},
			{ fetch: fetchMock },
		);

		expect(result.status).toBe('insufficient_context');
		expect(result.durability).toBe('not_started');
		expect(result.message).toContain('Open a project');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('stages a parsed scene draft through the server route', async () => {
		const staged = checkpoint('review');
		const fetchMock = vi.fn(async () => jsonResponse({ ok: true, checkpoint: staged }));

		const result = await stageInlineSceneDraftCheckpoint(
			{
				projectId: 'project-1',
				envelope: envelope(),
			},
			{ fetch: fetchMock },
		);

		expect(result.status).toBe('succeeded');
		expect(result.durability).toBe('durable');
		expect(result.data?.checkpoint).toStrictEqual(staged);
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/author-draft/checkpoints/stage-inline',
			expect.objectContaining({ method: 'POST' }),
		);
		expect(requestBody(fetchMock)).toMatchObject({
			projectId: 'project-1',
			sceneId: 'scene-1',
		});
	});

	it('maps server conflicts into stale-target results', async () => {
		const fetchMock = vi.fn(async () =>
			jsonResponse(
				{
					error: {
						code: 'stale_target',
						message: 'Scene changed.',
					},
				},
				409,
			),
		);

		const result = await stageInlineSceneDraftCheckpoint(
			{
				projectId: 'project-1',
				envelope: envelope(),
			},
			{ fetch: fetchMock },
		);

		expect(result.status).toBe('stale_target');
		expect(result.errorCode).toBe('stale_target');
		expect(result.message).toBe('Scene changed.');
	});

	it('stages and then rejects inline drafts durably', async () => {
		const staged = checkpoint('review');
		const rejected = checkpoint('rejected');
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse({ ok: true, checkpoint: staged }))
			.mockResolvedValueOnce(jsonResponse({ ok: true, checkpoint: rejected }));

		const result = await rejectInlineSceneDraftCheckpoint(
			{
				projectId: 'project-1',
				envelope: envelope(),
				reason: 'Not the right direction.',
			},
			{ fetch: fetchMock },
		);

		expect(result.status).toBe('succeeded');
		expect(result.durability).toBe('durable');
		expect(result.message).toContain('rejected');
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/author-draft/checkpoints/checkpoint-1/reject');
	});
});
