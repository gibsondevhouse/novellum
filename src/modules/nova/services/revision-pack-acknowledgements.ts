import type { AuthorRevisionPack } from '$lib/ai/pipeline/author-schemas.js';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import {
	getProjectMetadata,
	setProjectMetadata,
	type MetadataScope,
} from '$lib/project-metadata.js';

export const REVISION_PACK_ACKNOWLEDGEMENT_OWNER_ID = 'novaRevisionPackAcknowledgements.v1';

const ACK_SCOPE: MetadataScope = 'pipeline';

export interface RevisionPackAcknowledgementState {
	artifactKey: string;
	acknowledgedIssueIds: string[];
	updatedAt: string | null;
}

export interface RevisionPackAcknowledgementDeps {
	getMetadata?: typeof getProjectMetadata;
	setMetadata?: typeof setProjectMetadata;
	now?: () => string;
}

export class RevisionPackAcknowledgementError extends Error {
	readonly code: 'missing_project' | 'missing_issue';

	constructor(code: RevisionPackAcknowledgementError['code'], message: string) {
		super(message);
		this.name = 'RevisionPackAcknowledgementError';
		this.code = code;
	}
}

function normalizeToken(value: string): string {
	return value.trim().replace(/[^a-z0-9_.:-]+/gi, '-').replace(/^-+|-+$/g, '');
}

function fnv1a(value: string): string {
	let hash = 0x811c9dc5;
	for (let i = 0; i < value.length; i += 1) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0).toString(16).padStart(8, '0');
}

export function revisionPackAcknowledgementKey(
	envelope: PipelineArtifactEnvelope<AuthorRevisionPack>,
): string {
	const explicitId = normalizeToken(envelope.id ?? '');
	if (explicitId) return `revision-pack:${explicitId}`;
	const fingerprint = JSON.stringify({
		taskKey: envelope.taskKey,
		producedAt: envelope.producedAt,
		model: envelope.model,
		issueIds: envelope.payload.issues.map((issue) => issue.id),
	});
	return `revision-pack:fingerprint-${fnv1a(fingerprint)}`;
}

function emptyState(artifactKey: string): RevisionPackAcknowledgementState {
	return {
		artifactKey,
		acknowledgedIssueIds: [],
		updatedAt: null,
	};
}

function normalizeState(
	artifactKey: string,
	value: unknown,
): RevisionPackAcknowledgementState {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return emptyState(artifactKey);
	}

	const record = value as Record<string, unknown>;
	const acknowledgedIssueIds = Array.isArray(record.acknowledgedIssueIds)
		? Array.from(
				new Set(
					record.acknowledgedIssueIds
						.filter((item): item is string => typeof item === 'string')
						.map((item) => item.trim())
						.filter((item) => item.length > 0),
				),
			)
		: [];
	const updatedAt = typeof record.updatedAt === 'string' ? record.updatedAt : null;

	return {
		artifactKey,
		acknowledgedIssueIds,
		updatedAt,
	};
}

export async function loadRevisionPackAcknowledgements(
	projectId: string | null | undefined,
	envelope: PipelineArtifactEnvelope<AuthorRevisionPack>,
	deps: RevisionPackAcknowledgementDeps = {},
): Promise<RevisionPackAcknowledgementState> {
	const artifactKey = revisionPackAcknowledgementKey(envelope);
	const normalizedProjectId = projectId?.trim();
	if (!normalizedProjectId) return emptyState(artifactKey);

	const getMetadata = deps.getMetadata ?? getProjectMetadata;
	const value = await getMetadata<unknown>(
		normalizedProjectId,
		ACK_SCOPE,
		REVISION_PACK_ACKNOWLEDGEMENT_OWNER_ID,
		artifactKey,
		null,
	);
	return normalizeState(artifactKey, value);
}

export async function acknowledgeRevisionPackIssue(
	projectId: string | null | undefined,
	envelope: PipelineArtifactEnvelope<AuthorRevisionPack>,
	issueId: string,
	deps: RevisionPackAcknowledgementDeps = {},
): Promise<RevisionPackAcknowledgementState> {
	const normalizedProjectId = projectId?.trim();
	if (!normalizedProjectId) {
		throw new RevisionPackAcknowledgementError(
			'missing_project',
			'Open a project before acknowledging this revision note.',
		);
	}
	const normalizedIssueId = issueId.trim();
	if (!normalizedIssueId) {
		throw new RevisionPackAcknowledgementError(
			'missing_issue',
			'Revision issue id is required before acknowledgement can be saved.',
		);
	}

	const setMetadata = deps.setMetadata ?? setProjectMetadata;
	const now = deps.now ?? (() => new Date().toISOString());
	const current = await loadRevisionPackAcknowledgements(normalizedProjectId, envelope, deps);
	const acknowledgedIssueIds = Array.from(
		new Set([...current.acknowledgedIssueIds, normalizedIssueId]),
	).sort();
	const next: RevisionPackAcknowledgementState = {
		artifactKey: current.artifactKey,
		acknowledgedIssueIds,
		updatedAt: now(),
	};

	await setMetadata(
		normalizedProjectId,
		ACK_SCOPE,
		REVISION_PACK_ACKNOWLEDGEMENT_OWNER_ID,
		current.artifactKey,
		next,
	);

	return next;
}
