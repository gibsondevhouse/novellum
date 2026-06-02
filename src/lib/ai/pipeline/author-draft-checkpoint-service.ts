import type Database from 'better-sqlite3';
import { createHash, randomUUID } from 'node:crypto';
import { db } from '$lib/server/db/index.js';
import type { Scene } from '$lib/db/domain-types.js';
import {
	AUTHOR_DRAFT_CHECKPOINT_OWNER_ID,
	AUTHOR_DRAFT_TASK_KEY,
	authorDraftCheckpointSchema,
	type AuthorDraftArtifact,
	type AuthorDraftCheckpoint,
} from './author-draft-contract.js';

const PIPELINE_METADATA_SCOPE = 'pipeline' as const;

type JsonObject = Record<string, unknown>;

export type AuthorDraftCheckpointErrorCode =
	| 'invalid_payload'
	| 'not_found'
	| 'invalid_transition'
	| 'scene_not_found'
	| 'stale_target'
	| 'apply_failed';

export class AuthorDraftCheckpointError extends Error {
	readonly code: AuthorDraftCheckpointErrorCode;
	readonly meta?: JsonObject;

	constructor(code: AuthorDraftCheckpointErrorCode, message: string, meta?: JsonObject) {
		super(message);
		this.name = 'AuthorDraftCheckpointError';
		this.code = code;
		this.meta = meta;
	}
}

function nowIso(): string {
	return new Date().toISOString();
}

function isObject(value: unknown): value is JsonObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function computeWordCount(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).filter((w) => w.length > 0).length;
}

function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function proseToSceneHtml(prose: string): string {
	const escaped = escapeHtml(prose);
	const paragraphs = escaped.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
	if (paragraphs.length === 0) return '<p></p>';
	return paragraphs.map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('');
}

function sha256Hex(value: string): string {
	return createHash('sha256').update(value, 'utf8').digest('hex');
}

function normalizeStringList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.filter((item): item is string => typeof item === 'string')
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
	}
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed ? [trimmed] : [];
	}
	return [];
}

function normalizeUsedCanonRefs(value: unknown): string[] {
	if (!value) return [];
	if (Array.isArray(value) || typeof value === 'string') {
		return normalizeStringList(value);
	}
	if (!isObject(value)) return [];

	const out: string[] = [];
	const pushAll = (prefix: string, raw: unknown) => {
		for (const id of normalizeStringList(raw)) {
			out.push(`${prefix}:${id}`);
		}
	};

	pushAll('characterId', value.characterIds);
	pushAll('locationId', value.locationIds);
	pushAll('factionId', value.factionIds);
	pushAll('loreEntryId', value.loreEntryIds);

	return Array.from(new Set(out));
}

interface MetadataRow {
	value: string;
}

function deserializeCheckpoint(raw: string): AuthorDraftCheckpoint | null {
	try {
		const parsed = JSON.parse(raw) as unknown;
		const result = authorDraftCheckpointSchema.safeParse(parsed);
		if (!result.success) return null;
		return result.data;
	} catch {
		return null;
	}
}

function listRows(database: Database.Database, projectId: string): Array<{ key: string; value: string }> {
	return database
		.prepare(
			'SELECT key, value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ?',
		)
		.all(projectId, PIPELINE_METADATA_SCOPE, AUTHOR_DRAFT_CHECKPOINT_OWNER_ID) as Array<{
		key: string;
		value: string;
	}>;
}

function getRow(
	database: Database.Database,
	projectId: string,
	key: string,
): MetadataRow | undefined {
	return database
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get(projectId, PIPELINE_METADATA_SCOPE, AUTHOR_DRAFT_CHECKPOINT_OWNER_ID, key) as
		| MetadataRow
		| undefined;
}

function writeRow(database: Database.Database, record: AuthorDraftCheckpoint, keyOverride?: string): void {
	database
		.prepare(
			`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
			 VALUES (?, ?, ?, ?, ?, ?)
			 ON CONFLICT(projectId, scope, ownerId, key) DO UPDATE SET
			 value = excluded.value,
			 updatedAt = excluded.updatedAt`,
		)
		.run(
			record.projectId,
			PIPELINE_METADATA_SCOPE,
			AUTHOR_DRAFT_CHECKPOINT_OWNER_ID,
			keyOverride ?? record.id,
			JSON.stringify(record),
			record.updatedAt,
		);
}

function loadCheckpointOrThrow(
	database: Database.Database,
	projectId: string,
	checkpointId: string,
): AuthorDraftCheckpoint {
	const row = getRow(database, projectId, checkpointId);
	if (!row) {
		throw new AuthorDraftCheckpointError('not_found', `Checkpoint ${checkpointId} not found.`);
	}
	const parsed = deserializeCheckpoint(row.value);
	if (!parsed) {
		throw new AuthorDraftCheckpointError(
			'invalid_payload',
			`Checkpoint ${checkpointId} payload is malformed and cannot be processed.`,
		);
	}
	return parsed;
}

function loadSceneOrThrow(database: Database.Database, sceneId: string): Scene {
	const row = database.prepare('SELECT * FROM scenes WHERE id = ?').get(sceneId) as Scene | undefined;
	if (!row) {
		throw new AuthorDraftCheckpointError('scene_not_found', `Scene ${sceneId} not found.`);
	}
	return row;
}

function findActiveCheckpointForScene(
	database: Database.Database,
	projectId: string,
	sceneId: string,
): AuthorDraftCheckpoint | undefined {
	const rows = listRows(database, projectId);
	const active = rows
		.map((r) => deserializeCheckpoint(r.value))
		.filter((r): r is AuthorDraftCheckpoint => Boolean(r))
		.filter(
			(r) =>
				r.taskKey === AUTHOR_DRAFT_TASK_KEY &&
				r.sceneId === sceneId &&
				(r.lifecycle === 'draft' || r.lifecycle === 'review'),
		)
		.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
	return active[0];
}

export interface CreateCheckpointInput {
	projectId: string;
	sceneId: string;
	chapterId: string;
	artifact: Omit<AuthorDraftArtifact, 'wordCount' | 'sidecar'> & {
		wordCount?: number;
		sidecar: Omit<
			AuthorDraftArtifact['sidecar'],
			'wordCount' | 'usedCanonRefs' | 'uncertainties' | 'continuityRisks'
		> & {
			wordCount?: number;
			usedCanonRefs?: unknown;
			uncertainties?: unknown;
			continuityRisks?: unknown;
		};
	};
	baseSceneUpdatedAt: string;
	baseSceneContentHash?: string;
	forceRegenerate?: boolean;
}

export interface AcceptCheckpointInput {
	projectId: string;
	checkpointId: string;
	sceneId: string;
	forceOverwrite?: boolean;
}

export interface RejectCheckpointInput {
	projectId: string;
	checkpointId: string;
	reason: string;
}

export function createAuthorDraftCheckpointService(database: Database.Database = db) {
	function listCheckpoints(projectId: string): AuthorDraftCheckpoint[] {
		const rows = listRows(database, projectId);
		return rows
			.map((r) => deserializeCheckpoint(r.value))
			.filter((r): r is AuthorDraftCheckpoint => Boolean(r))
			.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
	}

	function getCheckpoint(projectId: string, checkpointId: string): AuthorDraftCheckpoint | undefined {
		const row = getRow(database, projectId, checkpointId);
		if (!row) return undefined;
		return deserializeCheckpoint(row.value) ?? undefined;
	}

	function createCheckpoint(input: CreateCheckpointInput): AuthorDraftCheckpoint {
		const tx = database.transaction(() => {
			const scene = loadSceneOrThrow(database, input.sceneId);
			if (scene.projectId !== input.projectId) {
				throw new AuthorDraftCheckpointError(
					'invalid_payload',
					`Scene ${input.sceneId} does not belong to project ${input.projectId}.`,
				);
			}
			if (scene.chapterId !== input.chapterId) {
				throw new AuthorDraftCheckpointError(
					'invalid_payload',
					`Scene ${input.sceneId} does not belong to chapter ${input.chapterId}.`,
				);
			}

			const existingActive = findActiveCheckpointForScene(database, input.projectId, input.sceneId);
			if (existingActive && !input.forceRegenerate) {
				return existingActive;
			}

			const createdAt = nowIso();
			const updatedAt = createdAt;
			const checkpointId = randomUUID();

			if (existingActive && input.forceRegenerate) {
				const superseded: AuthorDraftCheckpoint = {
					...existingActive,
					lifecycle: 'rejected',
					rejectedAt: updatedAt,
					updatedAt,
					rejectReason: 'Superseded by regeneration',
				};
				writeRow(database, superseded, superseded.id);
			}

			const prose = input.artifact.prose ?? '';
			const computedCount = computeWordCount(prose);

			const artifactEnvelope: AuthorDraftArtifact = {
				type: input.artifact.type,
				version: input.artifact.version,
				projectId: input.projectId,
				chapterId: input.chapterId,
				sceneId: input.sceneId,
				title: input.artifact.title,
				prose,
				wordCount: computedCount,
				sidecar: {
					sceneId: input.sceneId,
					chapterId: input.chapterId,
					povCharacterId: input.artifact.sidecar.povCharacterId ?? null,
					wordCount: computedCount,
					usedCanonRefs: normalizeUsedCanonRefs(input.artifact.sidecar.usedCanonRefs),
					uncertainties: normalizeStringList(input.artifact.sidecar.uncertainties),
					continuityRisks: normalizeStringList(input.artifact.sidecar.continuityRisks),
				},
			};

			const record: AuthorDraftCheckpoint = {
				id: checkpointId,
				projectId: input.projectId,
				taskKey: AUTHOR_DRAFT_TASK_KEY,
				sceneId: input.sceneId,
				chapterId: input.chapterId,
				artifactEnvelope,
				lifecycle: 'review',
				createdAt,
				updatedAt,
				baseSceneUpdatedAt: input.baseSceneUpdatedAt,
				baseSceneContentHash: input.baseSceneContentHash,
			};

			writeRow(database, record, record.id);
			return record;
		});

		return tx();
	}

	function acceptCheckpoint(input: AcceptCheckpointInput): AuthorDraftCheckpoint {
		const tx = database.transaction(() => {
			const checkpoint = loadCheckpointOrThrow(database, input.projectId, input.checkpointId);

			if (checkpoint.lifecycle === 'accepted') {
				return checkpoint;
			}

			if (checkpoint.lifecycle === 'rejected') {
				throw new AuthorDraftCheckpointError(
					'invalid_transition',
					`Checkpoint ${input.checkpointId} is rejected and cannot be accepted.`,
				);
			}

			if (checkpoint.sceneId !== input.sceneId) {
				throw new AuthorDraftCheckpointError(
					'invalid_payload',
					`Checkpoint ${input.checkpointId} does not target scene ${input.sceneId}.`,
				);
			}

			const scene = loadSceneOrThrow(database, input.sceneId);
			if (scene.projectId !== checkpoint.projectId) {
				throw new AuthorDraftCheckpointError(
					'invalid_payload',
					`Scene ${input.sceneId} does not belong to project ${checkpoint.projectId}.`,
				);
			}
			if (scene.chapterId !== checkpoint.chapterId) {
				throw new AuthorDraftCheckpointError(
					'invalid_payload',
					`Scene ${input.sceneId} does not belong to chapter ${checkpoint.chapterId}.`,
				);
			}

			const artifact = checkpoint.artifactEnvelope;
			if (artifact.type !== AUTHOR_DRAFT_TASK_KEY || artifact.version !== 1) {
				throw new AuthorDraftCheckpointError(
					'invalid_payload',
					`Checkpoint ${input.checkpointId} artifact envelope is not a supported author scene draft.`,
				);
			}
			if (artifact.projectId !== checkpoint.projectId || artifact.projectId !== scene.projectId) {
				throw new AuthorDraftCheckpointError(
					'invalid_payload',
					`Checkpoint ${input.checkpointId} artifact project mismatch.`,
				);
			}
			if (artifact.sceneId !== checkpoint.sceneId || artifact.sceneId !== input.sceneId) {
				throw new AuthorDraftCheckpointError(
					'invalid_payload',
					`Checkpoint ${input.checkpointId} artifact scene mismatch.`,
				);
			}
			if (artifact.prose.trim().length === 0) {
				throw new AuthorDraftCheckpointError(
					'invalid_payload',
					`Checkpoint ${input.checkpointId} prose is empty.`,
				);
			}

			const currentHash = sha256Hex(scene.content ?? '');
			const staleByTimestamp = scene.updatedAt !== checkpoint.baseSceneUpdatedAt;
			const staleByHash =
				typeof checkpoint.baseSceneContentHash === 'string' &&
				checkpoint.baseSceneContentHash.length > 0 &&
				currentHash !== checkpoint.baseSceneContentHash;

			if ((staleByTimestamp || staleByHash) && !input.forceOverwrite) {
				throw new AuthorDraftCheckpointError(
					'stale_target',
					`Scene ${input.sceneId} changed since this draft was generated.`,
					{
						code: 'STALE_TARGET',
						sceneUpdatedAt: scene.updatedAt,
						baseSceneUpdatedAt: checkpoint.baseSceneUpdatedAt,
					},
				);
			}

			const prose = artifact.prose;
			const html = proseToSceneHtml(prose);
			const wordCount = computeWordCount(prose);
			const updatedAt = nowIso();

			const updateScene = database.prepare(
				`UPDATE scenes
				 SET content = @content, wordCount = @wordCount, updatedAt = @updatedAt
				 WHERE id = @sceneId`,
			);
			const sceneResult = updateScene.run({
				sceneId: input.sceneId,
				content: html,
				wordCount,
				updatedAt,
			});
			if (sceneResult.changes === 0) {
				throw new AuthorDraftCheckpointError('scene_not_found', `Scene ${input.sceneId} not found.`);
			}

			const next: AuthorDraftCheckpoint = {
				...checkpoint,
				lifecycle: 'accepted',
				updatedAt,
				acceptedAt: updatedAt,
				appliedToSceneId: input.sceneId,
				artifactEnvelope: {
					...artifact,
					wordCount,
					sidecar: {
						...artifact.sidecar,
						wordCount,
					},
				},
			};

			writeRow(database, next, next.id);
			return next;
		});

		return tx();
	}

	function rejectCheckpoint(input: RejectCheckpointInput): AuthorDraftCheckpoint {
		const tx = database.transaction(() => {
			const checkpoint = loadCheckpointOrThrow(database, input.projectId, input.checkpointId);
			if (checkpoint.lifecycle === 'accepted') {
				throw new AuthorDraftCheckpointError(
					'invalid_transition',
					`Checkpoint ${input.checkpointId} is accepted and cannot be rejected.`,
				);
			}
			if (checkpoint.lifecycle === 'rejected') {
				return checkpoint;
			}
			const updatedAt = nowIso();
			const next: AuthorDraftCheckpoint = {
				...checkpoint,
				lifecycle: 'rejected',
				updatedAt,
				rejectedAt: updatedAt,
				rejectReason: input.reason.trim(),
			};
			writeRow(database, next, next.id);
			return next;
		});
		return tx();
	}

	function getSceneBaseGuard(projectId: string, sceneId: string): {
		baseSceneUpdatedAt: string;
		baseSceneContentHash: string;
		chapterId: string;
	} {
		const scene = loadSceneOrThrow(database, sceneId);
		if (scene.projectId !== projectId) {
			throw new AuthorDraftCheckpointError(
				'invalid_payload',
				`Scene ${sceneId} does not belong to project ${projectId}.`,
			);
		}
		return {
			baseSceneUpdatedAt: scene.updatedAt,
			baseSceneContentHash: sha256Hex(scene.content ?? ''),
			chapterId: scene.chapterId,
		};
	}

	return {
		listCheckpoints,
		getCheckpoint,
		createCheckpoint,
		acceptCheckpoint,
		rejectCheckpoint,
		getSceneBaseGuard,
	};
}

const defaultService = createAuthorDraftCheckpointService();

export const authorDraftCheckpointService = defaultService;

export function listAuthorDraftCheckpoints(projectId: string): AuthorDraftCheckpoint[] {
	return defaultService.listCheckpoints(projectId);
}

export function getAuthorDraftCheckpoint(
	projectId: string,
	checkpointId: string,
): AuthorDraftCheckpoint | undefined {
	return defaultService.getCheckpoint(projectId, checkpointId);
}

export function createAuthorDraftCheckpoint(input: CreateCheckpointInput): AuthorDraftCheckpoint {
	return defaultService.createCheckpoint(input);
}

export function acceptAuthorDraftCheckpoint(input: AcceptCheckpointInput): AuthorDraftCheckpoint {
	return defaultService.acceptCheckpoint(input);
}

export function rejectAuthorDraftCheckpoint(input: RejectCheckpointInput): AuthorDraftCheckpoint {
	return defaultService.rejectCheckpoint(input);
}

export function getSceneDraftBaseGuard(projectId: string, sceneId: string): {
	baseSceneUpdatedAt: string;
	baseSceneContentHash: string;
	chapterId: string;
} {
	return defaultService.getSceneBaseGuard(projectId, sceneId);
}
