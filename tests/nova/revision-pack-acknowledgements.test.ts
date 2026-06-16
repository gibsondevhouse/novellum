import { describe, expect, it, vi } from 'vitest';
import type { AuthorRevisionPack } from '$lib/ai/pipeline/author-schemas.js';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import {
	REVISION_PACK_ACKNOWLEDGEMENT_OWNER_ID,
	RevisionPackAcknowledgementError,
	type RevisionPackAcknowledgementDeps,
	acknowledgeRevisionPackIssue,
	loadRevisionPackAcknowledgements,
	revisionPackAcknowledgementKey,
} from '$modules/nova/services/revision-pack-acknowledgements.js';

function envelope(id = 'artifact-1'): PipelineArtifactEnvelope<AuthorRevisionPack> {
	return {
		id,
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
					id: 'issue-2',
					severity: 'low',
					kind: 'style',
					location: 'Scene 1',
					description: 'Loose verb.',
					recommendation: 'Tighten it.',
				},
				{
					id: 'issue-1',
					severity: 'high',
					kind: 'continuity',
					location: 'Scene 2',
					description: 'Timeline mismatch.',
					recommendation: 'Adjust the date.',
				},
			],
			continuityFixes: [],
			stylisticSuggestions: [],
		},
		notes: [],
	};
}

function mockGetMetadata(value: () => unknown): NonNullable<RevisionPackAcknowledgementDeps['getMetadata']> {
	return async <T>() => value() as T;
}

describe('revision pack acknowledgements', () => {
	it('uses a stable metadata key per artifact identity', () => {
		expect(revisionPackAcknowledgementKey(envelope('artifact/with spaces'))).toBe(
			'revision-pack:artifact-with-spaces',
		);
		expect(revisionPackAcknowledgementKey(envelope('artifact-2'))).not.toBe(
			revisionPackAcknowledgementKey(envelope('artifact-1')),
		);
	});

	it('loads persisted acknowledgement state and ignores corrupt metadata safely', async () => {
		let metadata: unknown = {
			acknowledgedIssueIds: ['issue-1', ' ', 'issue-1', 123],
			updatedAt: '2026-06-15T12:00:00.000Z',
		};
		const getMetadata = mockGetMetadata(() => metadata);

		await expect(
			loadRevisionPackAcknowledgements('project-1', envelope(), { getMetadata }),
		).resolves.toEqual({
			artifactKey: 'revision-pack:artifact-1',
			acknowledgedIssueIds: ['issue-1'],
			updatedAt: '2026-06-15T12:00:00.000Z',
		});

		metadata = { acknowledgedIssueIds: 'broken' };
		await expect(
			loadRevisionPackAcknowledgements('project-1', envelope(), { getMetadata }),
		).resolves.toMatchObject({ acknowledgedIssueIds: [], updatedAt: null });
	});

	it('persists a sorted acknowledgement set without touching manuscript data', async () => {
		const getMetadata = mockGetMetadata(() => ({
			acknowledgedIssueIds: ['issue-2'],
			updatedAt: 'old',
		}));
		const setMetadata: NonNullable<RevisionPackAcknowledgementDeps['setMetadata']> = vi.fn(
			async () => undefined,
		);

		const result = await acknowledgeRevisionPackIssue('project-1', envelope(), 'issue-1', {
			getMetadata,
			setMetadata,
			now: () => '2026-06-15T13:00:00.000Z',
		});

		expect(result).toEqual({
			artifactKey: 'revision-pack:artifact-1',
			acknowledgedIssueIds: ['issue-1', 'issue-2'],
			updatedAt: '2026-06-15T13:00:00.000Z',
		});
		expect(setMetadata).toHaveBeenCalledWith(
			'project-1',
			'pipeline',
			REVISION_PACK_ACKNOWLEDGEMENT_OWNER_ID,
			'revision-pack:artifact-1',
			result,
		);
	});

	it('rejects acknowledgement writes without a project or issue id', async () => {
		await expect(acknowledgeRevisionPackIssue(null, envelope(), 'issue-1')).rejects.toBeInstanceOf(
			RevisionPackAcknowledgementError,
		);
		await expect(acknowledgeRevisionPackIssue('project-1', envelope(), ' ')).rejects.toMatchObject({
			code: 'missing_issue',
		});
	});
});
