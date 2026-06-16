import { createHash } from 'node:crypto';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import type { AuthorSceneDraftPayload } from '$lib/ai/pipeline/author-agent.js';
import {
	AUTHOR_DRAFT_ARTIFACT_TYPE,
	AUTHOR_DRAFT_ARTIFACT_VERSION,
} from '$lib/ai/pipeline/author-draft-contract.js';
import {
	AuthorDraftCheckpointError,
	createAuthorDraftCheckpoint,
	getSceneDraftBaseGuard,
} from '$lib/ai/pipeline/author-draft-checkpoint-service.js';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function listValue(value: unknown): unknown {
	if (Array.isArray(value) || typeof value === 'string') {
		return value;
	}
	if (isRecord(value)) {
		throw new AuthorDraftCheckpointError('invalid_payload', 'Sidecar list fields must be arrays or strings, not objects.');
	}
	return [];
}

function _usedCanonRefsValue(value: unknown): unknown {
	if (Array.isArray(value) || typeof value === 'string') {
		return value;
	}
	if (isRecord(value)) {
		// Support object form with characterIds property
		if (Array.isArray(value.characterIds)) {
			return value.characterIds;
		}
		throw new AuthorDraftCheckpointError('invalid_payload', 'usedCanonRefs object must contain a characterIds array.');
	}
	return [];
}

function sceneIdFromEnvelope(envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>): string | null {
	const sidecarSceneId = asString(envelope.payload.sidecar?.sceneId);
	if (sidecarSceneId) return sidecarSceneId;
	return envelope.hierarchy.references.scenes[0] ?? null;
}

function checkpointIdForEnvelope(envelopeId: string): string {
	const digest = createHash('sha256').update(envelopeId, 'utf8').digest('hex').slice(0, 24);
	return `inline-scene-draft-${digest}`;
}

function statusForError(err: AuthorDraftCheckpointError): number {
	switch (err.code) {
		case 'not_found':
		case 'scene_not_found':
			return 404;
		case 'stale_target':
		case 'invalid_transition':
			return 409;
		case 'invalid_payload':
			return 422;
		case 'apply_failed':
		default:
			return 500;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => ({}))) as JsonRecord;
	const projectId = asString(body.projectId);
	if (!projectId) error(400, 'projectId is required');

	const envelope = body.envelope as PipelineArtifactEnvelope<AuthorSceneDraftPayload> | undefined;
	if (!isRecord(envelope) || !isRecord(envelope.payload) || !isRecord(envelope.payload.sidecar)) {
		return json(
			{
				ok: false,
				error: {
					code: 'invalid_payload',
					message: 'Scene draft artifact payload is required.',
				},
			},
			{ status: 422 },
		);
	}

	const bodySceneId = asString(body.sceneId);
	const envelopeSceneId = sceneIdFromEnvelope(envelope);
	const sceneId = bodySceneId ?? envelopeSceneId;
	if (!sceneId) error(400, 'sceneId is required');
	if (envelopeSceneId && envelopeSceneId !== sceneId) {
		return json(
			{
				ok: false,
				error: {
					code: 'invalid_payload',
					message: 'Scene draft artifact target does not match the requested scene.',
				},
			},
			{ status: 422 },
		);
	}

	const prose = typeof envelope.payload.prose === 'string' ? envelope.payload.prose : '';
	if (prose.trim().length === 0) {
		return json(
			{
				ok: false,
				error: {
					code: 'invalid_payload',
					message: 'Scene draft prose is empty.',
				},
			},
			{ status: 422 },
		);
	}

	try {
		const guard = getSceneDraftBaseGuard(projectId, sceneId);
		const sidecar = envelope.payload.sidecar;
		const sidecarChapterId = asString(sidecar.chapterId);
		if (sidecarChapterId && sidecarChapterId !== guard.chapterId) {
			return json(
				{
					ok: false,
					error: {
						code: 'invalid_payload',
						message: 'Scene draft artifact chapter does not match the target scene.',
					},
				},
				{ status: 422 },
			);
		}

		const checkpoint = createAuthorDraftCheckpoint({
			projectId,
			sceneId,
			chapterId: guard.chapterId,
			checkpointId: checkpointIdForEnvelope(envelope.id),
			baseSceneUpdatedAt: guard.baseSceneUpdatedAt,
			baseSceneContentHash: guard.baseSceneContentHash,
			forceRegenerate: true,
			artifact: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId,
				sceneId,
				chapterId: guard.chapterId,
				prose,
				wordCount: sidecar.wordCount,
				sidecar: {
					sceneId,
					chapterId: guard.chapterId,
					povCharacterId: sidecar.povCharacterId ?? null,
					wordCount: sidecar.wordCount,
					usedCanonRefs: listValue(sidecar.usedCanonRefs),
					uncertainties: listValue(sidecar.uncertainties),
					continuityRisks: listValue(sidecar.continuityRisks),
				},
			},
		});

		return json({ ok: true, checkpoint });
	} catch (err) {
		if (err instanceof AuthorDraftCheckpointError) {
			return json(
				{ ok: false, error: { code: err.code, message: err.message, meta: err.meta } },
				{ status: statusForError(err) },
			);
		}
		throw err;
	}
};
