import {
	OUTLINE_DRAFT_SCHEMA_VERSION,
	type OutlineDraftAcceptanceState,
	type OutlineDraftCheckpointRecord,
	validateOutlineDraftCheckpoint,
} from '$lib/ai/pipeline/outline-draft-contract.js';
import { OUTLINE_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/outline-checkpoint-contract.js';
import { PIPELINE_METADATA_SCOPE } from '$lib/ai/pipeline/checkpoint-contract.js';
import { db, encodeJson, type SqliteDatabase } from '$lib/server/db/index.js';
import {
	OUTLINE_CONFLICT_CODE,
	getOutlineConflictPreflight,
} from './outline-conflict-preflight.js';
import {
	OutlineMaterializationMapError,
	buildOutlineMaterializationMap,
	type OutlineMaterializationMap,
	type SceneIntentMetadataRow,
} from './outline-materialization-map.js';

export type OutlineMaterializationErrorCode =
	| 'invalid_request'
	| 'not_found'
	| 'invalid_transition'
	| 'invalid_version'
	| 'invalid_payload'
	| 'stale_checkpoint'
	| 'outline_conflict'
	| 'materialization_failed';

export interface OutlineMaterializationErrorMeta {
	[key: string]: unknown;
}

export interface ManualSceneOverwriteConflict {
	id: string;
	title: string;
	chapterId: string;
	wordCount: number;
	hasContent: boolean;
	hasNotes: boolean;
	updatedAt: string;
}

export interface OutlineMergeSafetyPreflight {
	conflict: ReturnType<typeof getOutlineConflictPreflight>;
	manualSceneConflicts: ManualSceneOverwriteConflict[];
	requiresDestructiveConfirmation: boolean;
	message: string;
}

export class OutlineMaterializationServiceError extends Error {
	readonly code: OutlineMaterializationErrorCode;
	readonly status: number;
	readonly meta?: OutlineMaterializationErrorMeta;

	constructor(
		code: OutlineMaterializationErrorCode,
		message: string,
		status: number,
		meta?: OutlineMaterializationErrorMeta,
	) {
		super(message);
		this.name = 'OutlineMaterializationServiceError';
		this.code = code;
		this.status = status;
		this.meta = meta;
	}
}

export interface AcceptOutlineCheckpointInput {
	projectId: string;
	checkpointId: string;
	acceptedBy?: string | null;
	note?: string | null;
	expectedUpdatedAt?: string | null;
	expectedVersion?: string | null;
	selectedNodeIds?: readonly string[];
}

export interface AcceptOutlineCheckpointResult {
	checkpoint: OutlineDraftCheckpointRecord;
	materialization: OutlineMaterializationMap;
}

interface MetadataRow {
	value: string;
}

type ProjectScopedHierarchyTable = 'arcs' | 'acts' | 'milestones' | 'chapters' | 'scenes';

function nowIso(): string {
	return new Date().toISOString();
}

function asTrimmedString(value: string | null | undefined, maxLength = Number.MAX_SAFE_INTEGER): string {
	return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function asOptionalAuditString(value: string | null | undefined): string | null {
	const next = asTrimmedString(value, 128);
	return next.length > 0 ? next : null;
}

function assertProjectExists(database: SqliteDatabase, projectId: string): void {
	const row = database.prepare('SELECT id FROM projects WHERE id = ?').get(projectId) as
		| { id: string }
		| undefined;
	if (!row) {
		throw new OutlineMaterializationServiceError(
			'not_found',
			`Project ${projectId} was not found.`,
			404,
		);
	}
}

function loadCheckpoint(
	database: SqliteDatabase,
	projectId: string,
	checkpointId: string,
): OutlineDraftCheckpointRecord {
	const row = database
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get(projectId, PIPELINE_METADATA_SCOPE, OUTLINE_CHECKPOINT_OWNER_ID, checkpointId) as
		| MetadataRow
		| undefined;

	if (!row) {
		throw new OutlineMaterializationServiceError(
			'not_found',
			`Outline checkpoint ${checkpointId} was not found.`,
			404,
		);
	}

	const result = validateOutlineDraftCheckpoint(row.value);
	if (!result.ok) {
		throw new OutlineMaterializationServiceError(
			'invalid_payload',
			`Outline checkpoint ${checkpointId} payload is malformed and cannot be accepted.`,
			400,
			{ issues: result.issues },
		);
	}

	const checkpoint = result.data;
	if (
		checkpoint.id !== checkpointId ||
		checkpoint.projectId !== projectId ||
		checkpoint.ownerId !== OUTLINE_CHECKPOINT_OWNER_ID
	) {
		throw new OutlineMaterializationServiceError(
			'invalid_payload',
			`Outline checkpoint ${checkpointId} does not match the requested project and owner.`,
			400,
		);
	}
	return checkpoint;
}

function assertCheckpointReviewable(checkpoint: OutlineDraftCheckpointRecord): void {
	if (checkpoint.version !== OUTLINE_DRAFT_SCHEMA_VERSION) {
		throw new OutlineMaterializationServiceError(
			'invalid_version',
			`Unsupported outline checkpoint version ${checkpoint.version}.`,
			400,
		);
	}
	if (checkpoint.lifecycle !== 'review') {
		throw new OutlineMaterializationServiceError(
			'invalid_transition',
			`Only review outline checkpoints can be accepted; received ${checkpoint.lifecycle}.`,
			409,
		);
	}
}

function assertCheckpointPreconditions(
	checkpoint: OutlineDraftCheckpointRecord,
	input: AcceptOutlineCheckpointInput,
): void {
	const expectedUpdatedAt = asTrimmedString(input.expectedUpdatedAt);
	const expectedVersion = asTrimmedString(input.expectedVersion);
	if (!expectedUpdatedAt || !expectedVersion) {
		throw new OutlineMaterializationServiceError(
			'invalid_request',
			'expectedUpdatedAt and expectedVersion are required for outline checkpoint accept.',
			400,
		);
	}
	if (checkpoint.updatedAt !== expectedUpdatedAt || checkpoint.version !== expectedVersion) {
		throw new OutlineMaterializationServiceError(
			'stale_checkpoint',
			'Outline checkpoint changed before acceptance.',
			409,
			{
				expectedUpdatedAt,
				actualUpdatedAt: checkpoint.updatedAt,
				expectedVersion,
				actualVersion: checkpoint.version,
			},
		);
	}
}

function listManualSceneOverwriteConflicts(
	database: SqliteDatabase,
	projectId: string,
	selectedSceneIds?: ReadonlySet<string>,
): ManualSceneOverwriteConflict[] {
	const rows = database
		.prepare(
			`SELECT id, title, chapterId, wordCount, content, notes, updatedAt
			 FROM scenes
			 WHERE projectId = ?
				AND (
					TRIM(COALESCE(content, '')) <> ''
					OR TRIM(COALESCE(notes, '')) <> ''
					OR wordCount > 0
				)
			 ORDER BY "order" ASC, title ASC, id ASC`,
		)
		.all(projectId) as Array<{
		id: string;
		title: string;
		chapterId: string;
		wordCount: number;
		content: string | null;
		notes: string | null;
		updatedAt: string;
	}>;

	return rows
		.filter((row) => !selectedSceneIds || selectedSceneIds.has(row.id))
		.map((row) => ({
			id: row.id,
			title: row.title,
			chapterId: row.chapterId,
			wordCount: row.wordCount,
			hasContent: asTrimmedString(row.content).length > 0,
			hasNotes: asTrimmedString(row.notes).length > 0,
			updatedAt: row.updatedAt,
		}));
}

export function getOutlineMergeSafetyPreflight(
	projectId: string,
	database: SqliteDatabase = db,
	selectedSceneIds?: ReadonlySet<string>,
): OutlineMergeSafetyPreflight {
	const conflict = getOutlineConflictPreflight(projectId, database);
	const manualSceneConflicts = listManualSceneOverwriteConflicts(
		database,
		projectId,
		selectedSceneIds,
	);
	return {
		conflict,
		manualSceneConflicts,
		requiresDestructiveConfirmation: conflict.hasConflict || manualSceneConflicts.length > 0,
		message:
			manualSceneConflicts.length > 0
				? 'Existing manuscript scene prose requires review before outline merge.'
				: conflict.message,
	};
}

function outlineConflictMeta(preflight: OutlineMergeSafetyPreflight): OutlineMaterializationErrorMeta {
	const { conflict, manualSceneConflicts } = preflight;
	return {
		counts: conflict.counts,
		state: conflict.state,
		total: conflict.total,
		conflict,
		manualSceneConflicts,
		requiresDestructiveConfirmation: preflight.requiresDestructiveConfirmation,
		preflightMessage: preflight.message,
	};
}

function assertMergeSafety(
	database: SqliteDatabase,
	projectId: string,
	map: OutlineMaterializationMap,
	hasExplicitSelection: boolean,
): void {
	const selectedSceneIds = hasExplicitSelection
		? new Set(map.scenes.map((scene) => scene.id))
		: undefined;
	const preflight = getOutlineMergeSafetyPreflight(projectId, database, selectedSceneIds);

	if (!hasExplicitSelection && preflight.conflict.hasConflict) {
		throw new OutlineMaterializationServiceError(
			OUTLINE_CONFLICT_CODE,
			'Existing outline hierarchy is populated.',
			409,
			outlineConflictMeta(preflight),
		);
	}

	if (preflight.manualSceneConflicts.length > 0) {
		throw new OutlineMaterializationServiceError(
			OUTLINE_CONFLICT_CODE,
			preflight.message,
			409,
			outlineConflictMeta(preflight),
		);
	}
}

function assertNoCrossProjectCollisions(
	database: SqliteDatabase,
	projectId: string,
	table: ProjectScopedHierarchyTable,
	ids: readonly string[],
): void {
	if (ids.length === 0) return;
	const placeholders = ids.map(() => '?').join(', ');
	const row = database
		.prepare(`SELECT id FROM ${table} WHERE id IN (${placeholders}) AND projectId <> ? LIMIT 1`)
		.get(...ids, projectId) as { id: string } | undefined;
	if (!row) return;

	throw new OutlineMaterializationServiceError(
		'invalid_payload',
		`Selected outline node ${row.id} collides with existing ${table} data from another project.`,
		400,
		{ table, id: row.id },
	);
}

function assertNoMaterializationCollisions(
	database: SqliteDatabase,
	projectId: string,
	map: OutlineMaterializationMap,
): void {
	assertNoCrossProjectCollisions(database, projectId, 'arcs', map.arcs.map((arc) => arc.id));
	assertNoCrossProjectCollisions(database, projectId, 'acts', map.acts.map((act) => act.id));
	assertNoCrossProjectCollisions(
		database,
		projectId,
		'milestones',
		map.milestones.map((milestone) => milestone.id),
	);
	assertNoCrossProjectCollisions(
		database,
		projectId,
		'chapters',
		map.chapters.map((chapter) => chapter.id),
	);
	assertNoCrossProjectCollisions(database, projectId, 'scenes', map.scenes.map((scene) => scene.id));
}

function writeSceneIntentMetadata(
	insertMetadata: ReturnType<SqliteDatabase['prepare']>,
	row: SceneIntentMetadataRow,
	updatedAt: string,
): void {
	insertMetadata.run({
		projectId: row.projectId,
		scope: row.scope,
		ownerId: row.ownerId,
		key: row.key,
		value: JSON.stringify(row.value),
		updatedAt,
	});
}

function checkpointAcceptance(
	acceptedAt: string,
	input: AcceptOutlineCheckpointInput,
	map: OutlineMaterializationMap,
): OutlineDraftAcceptanceState {
	return {
		acceptedAt,
		acceptedBy: asOptionalAuditString(input.acceptedBy),
		note: asTrimmedString(input.note, 1_000),
		projectionMode: 'atomic',
		materializedCounts: {
			arcs: map.counts.arcs,
			acts: map.counts.acts,
			milestones: map.counts.milestones,
			chapters: map.counts.chapters,
			scenes: map.counts.scenes,
			beats: map.counts.beats,
			stages: map.counts.stages,
		},
		hierarchyRootIds: {
			arcIds: map.arcs.map((arc) => arc.id),
		},
		sceneIntentPersisted: map.counts.sceneIntentMetadata > 0,
	};
}

function safeMaterializationError(error: unknown): OutlineMaterializationServiceError {
	if (error instanceof OutlineMaterializationServiceError) return error;
	if (error instanceof OutlineMaterializationMapError) {
		return new OutlineMaterializationServiceError('invalid_payload', error.message, 400);
	}
	return new OutlineMaterializationServiceError(
		'materialization_failed',
		'Outline checkpoint materialization failed and was rolled back.',
		500,
	);
}

export function acceptOutlineCheckpointMaterialization(
	input: AcceptOutlineCheckpointInput,
	database: SqliteDatabase = db,
): AcceptOutlineCheckpointResult {
	const projectId = asTrimmedString(input.projectId);
	const checkpointId = asTrimmedString(input.checkpointId);
	if (!projectId || !checkpointId) {
		throw new OutlineMaterializationServiceError(
			'invalid_request',
			'projectId and checkpointId are required.',
			400,
		);
	}

	try {
		assertProjectExists(database, projectId);
		const checkpoint = loadCheckpoint(database, projectId, checkpointId);
		assertCheckpointReviewable(checkpoint);
		assertCheckpointPreconditions(checkpoint, input);

		const acceptedAt = nowIso();
		const map = buildOutlineMaterializationMap(checkpoint.draft, {
			nowIso: acceptedAt,
			selectedNodeIds: input.selectedNodeIds,
		});
		assertMergeSafety(database, projectId, map, input.selectedNodeIds !== undefined);
		assertNoMaterializationCollisions(database, projectId, map);

		const insertArc = database.prepare(
			`INSERT INTO arcs (id, projectId, title, description, purpose, arcType, status, "order", createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @description, @purpose, @arcType, @status, @order, @createdAt, @updatedAt)
			 ON CONFLICT(id) DO UPDATE SET
			 title = excluded.title,
			 description = excluded.description,
			 purpose = excluded.purpose,
			 arcType = excluded.arcType,
			 status = excluded.status,
			 "order" = excluded."order",
			 updatedAt = excluded.updatedAt`,
		);
		const insertAct = database.prepare(
			`INSERT INTO acts (id, projectId, arcId, title, "order", planningNotes, createdAt, updatedAt)
			 VALUES (@id, @projectId, @arcId, @title, @order, @planningNotes, @createdAt, @updatedAt)
			 ON CONFLICT(id) DO UPDATE SET
			 arcId = excluded.arcId,
			 title = excluded.title,
			 "order" = excluded."order",
			 planningNotes = excluded.planningNotes,
			 updatedAt = excluded.updatedAt`,
		);
		const insertMilestone = database.prepare(
			`INSERT INTO milestones (id, actId, projectId, title, description, "order", chapterIds, createdAt, updatedAt)
			 VALUES (@id, @actId, @projectId, @title, @description, @order, @chapterIds, @createdAt, @updatedAt)
			 ON CONFLICT(id) DO UPDATE SET
			 actId = excluded.actId,
			 title = excluded.title,
			 description = excluded.description,
			 "order" = excluded."order",
			 updatedAt = excluded.updatedAt`,
		);
		const insertChapter = database.prepare(
			`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, actId, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @actId, @arcRefs, @createdAt, @updatedAt)
			 ON CONFLICT(id) DO UPDATE SET
			 title = excluded.title,
			 "order" = excluded."order",
			 summary = excluded.summary,
			 actId = excluded.actId,
			 arcRefs = excluded.arcRefs,
			 updatedAt = excluded.updatedAt`,
		);
		const insertScene = database.prepare(
			`INSERT INTO scenes (id, chapterId, projectId, title, summary, povCharacterId, locationId, timelineEventId, "order", content, wordCount, notes, characterIds, locationIds, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @chapterId, @projectId, @title, @summary, @povCharacterId, @locationId, @timelineEventId, @order, @content, @wordCount, @notes, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)
			 ON CONFLICT(id) DO UPDATE SET
			 chapterId = excluded.chapterId,
			 title = excluded.title,
			 summary = excluded.summary,
			 povCharacterId = excluded.povCharacterId,
			 locationId = excluded.locationId,
			 timelineEventId = excluded.timelineEventId,
			 "order" = excluded."order",
			 characterIds = excluded.characterIds,
			 locationIds = excluded.locationIds,
			 arcRefs = excluded.arcRefs,
			 updatedAt = excluded.updatedAt`,
		);
		const insertBeat = database.prepare(
			`INSERT INTO beats (id, sceneId, arcId, projectId, title, type, "order", notes, createdAt, updatedAt)
			 VALUES (@id, @sceneId, @arcId, @projectId, @title, @type, @order, @notes, @createdAt, @updatedAt)`,
		);
		const insertStage = database.prepare(
			`INSERT INTO stages (id, beatId, projectId, title, description, "order", status, createdAt, updatedAt)
			 VALUES (@id, @beatId, @projectId, @title, @description, @order, @status, @createdAt, @updatedAt)`,
		);
		const insertMetadata = database.prepare(
			`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
			 VALUES (@projectId, @scope, @ownerId, @key, @value, @updatedAt)
			 ON CONFLICT(projectId, scope, ownerId, key) DO UPDATE SET
			 value = excluded.value,
			 updatedAt = excluded.updatedAt`,
		);
		const updateCheckpoint = database.prepare(
			`UPDATE project_metadata
			 SET value = @value, updatedAt = @updatedAt
			 WHERE projectId = @projectId
				AND scope = @scope
				AND ownerId = @ownerId
				AND key = @key
				AND updatedAt = @expectedUpdatedAt`,
		);

		const transaction = database.transaction(() => {
			for (const arc of map.arcs) insertArc.run(arc);
			for (const act of map.acts) insertAct.run(act);
			for (const milestone of map.milestones) {
				insertMilestone.run({ ...milestone, chapterIds: encodeJson(milestone.chapterIds) });
			}
			for (const chapter of map.chapters) {
				insertChapter.run({ ...chapter, arcRefs: encodeJson(chapter.arcRefs) });
			}
			for (const scene of map.scenes) {
				insertScene.run({
					...scene,
					characterIds: encodeJson(scene.characterIds),
					locationIds: encodeJson(scene.locationIds),
					arcRefs: encodeJson(scene.arcRefs),
				});
			}
			for (const beat of map.beats) insertBeat.run(beat);
			for (const stage of map.stages) insertStage.run(stage);
			for (const metadata of map.sceneIntentMetadata) {
				writeSceneIntentMetadata(insertMetadata, metadata, acceptedAt);
			}

			const acceptedCheckpoint: OutlineDraftCheckpointRecord = {
				...checkpoint,
				lifecycle: 'accepted',
				acceptance: checkpointAcceptance(acceptedAt, input, map),
				rejection: null,
				updatedAt: acceptedAt,
			};
			const validation = validateOutlineDraftCheckpoint(acceptedCheckpoint);
			if (!validation.ok) {
				throw new OutlineMaterializationServiceError(
					'invalid_payload',
					'Accepted outline checkpoint payload failed validation.',
					400,
					{ issues: validation.issues },
				);
			}

			const result = updateCheckpoint.run({
				projectId,
				scope: PIPELINE_METADATA_SCOPE,
				ownerId: OUTLINE_CHECKPOINT_OWNER_ID,
				key: checkpointId,
				value: JSON.stringify(validation.data),
				updatedAt: acceptedAt,
				expectedUpdatedAt: asTrimmedString(input.expectedUpdatedAt),
			});
			if (result.changes !== 1) {
				throw new OutlineMaterializationServiceError(
					'stale_checkpoint',
					`Outline checkpoint ${checkpointId} changed during acceptance.`,
					409,
				);
			}
			return validation.data;
		});

		const acceptedCheckpoint = transaction();
		return { checkpoint: acceptedCheckpoint, materialization: map };
	} catch (error) {
		throw safeMaterializationError(error);
	}
}
