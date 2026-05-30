import type Database from 'better-sqlite3';
import { db, encodeJson } from '$lib/server/db/index.js';
import { isWorldbuildTaskKey } from './worldbuild-agent.js';
import {
	PIPELINE_CHECKPOINT_SCHEMA_VERSION,
	PIPELINE_METADATA_SCOPE,
	WORLDBUILD_CHECKPOINT_OWNER_ID,
	hasPopulatedBibleProjection,
	isCheckpointLifecycle,
	isSupportedCheckpointVersion,
	type CheckpointAcceptanceState,
	type CheckpointRejectionState,
	type CheckpointReviewState,
	type WorldbuildCheckpointRecord,
	type WorldbuildDomainCheckpointRecord,
} from './checkpoint-contract.js';
import type { PipelineArtifactEnvelope } from './contracts.js';
import { isWorldbuildDomainTaskKey } from './task-catalog.js';
import type { WorldbuildDomainTaskKey } from './task-catalog.js';
import { createPipelineArtifactEnvelope, createDefaultHierarchyReferences } from './contracts.js';
import type {
	WorldbuildPayload,
	WorldbuildPopulatedBibleTableWrites,
	WorldbuildTaskKey,
} from './worldbuild-agent.js';

type JsonObject = Record<string, unknown>;

export type WorldbuildCheckpointErrorCode =
	| 'invalid_payload'
	| 'not_found'
	| 'invalid_transition'
	| 'invalid_version'
	| 'projection_failed';

export class WorldbuildCheckpointError extends Error {
	readonly code: WorldbuildCheckpointErrorCode;

	constructor(code: WorldbuildCheckpointErrorCode, message: string) {
		super(message);
		this.name = 'WorldbuildCheckpointError';
		this.code = code;
	}
}

function isObject(value: unknown): value is JsonObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function asOptionalString(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.filter((item): item is string => typeof item === 'string')
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

function ensureNonEmpty(value: string, label: string): string {
	const trimmed = value.trim();
	if (!trimmed) {
		throw new WorldbuildCheckpointError(
			'projection_failed',
			`Checkpoint projection requires non-empty ${label}.`,
		);
	}
	return trimmed;
}

function nowIso(): string {
	return new Date().toISOString();
}

interface MetadataRow {
	value: string;
}

function deserializeCheckpoint(raw: string): WorldbuildCheckpointRecord | null {
	try {
		const parsed = JSON.parse(raw) as Partial<WorldbuildCheckpointRecord>;
		if (!isObject(parsed)) return null;
		if (typeof parsed.id !== 'string' || typeof parsed.projectId !== 'string') return null;
		if (!isCheckpointLifecycle(parsed.lifecycle)) return null;
		if (typeof parsed.taskKey !== 'string') return null;
		if (!isWorldbuildTaskKey(parsed.taskKey) && !isWorldbuildDomainTaskKey(parsed.taskKey)) return null;
		if (!parsed.artifact || typeof parsed.artifact !== 'object') return null;
		if (typeof parsed.version !== 'string') return null;
		if (typeof parsed.createdAt !== 'string' || typeof parsed.updatedAt !== 'string') return null;
		return parsed as WorldbuildCheckpointRecord;
	} catch {
		return null;
	}
}

function parseUpsertInput(
	projectId: string,
	ownerId: string,
	key: string,
	input: unknown,
	existing: WorldbuildCheckpointRecord | undefined,
): WorldbuildCheckpointRecord {
	if (!isObject(input)) {
		throw new WorldbuildCheckpointError('invalid_payload', 'Checkpoint value must be an object.');
	}

	const artifactValue = input.artifact;
	if (!isObject(artifactValue)) {
		throw new WorldbuildCheckpointError('invalid_payload', 'Checkpoint value must include an artifact.');
	}

	const artifact = artifactValue as unknown as PipelineArtifactEnvelope<WorldbuildPayload>;
	if (artifact.pipeline !== 'vibe-worldbuild' && artifact.pipeline !== 'vibe-worldbuild-domain') {
		throw new WorldbuildCheckpointError(
			'invalid_payload',
			'Checkpoint artifact must belong to a worldbuild pipeline family.',
		);
	}

	if (!isWorldbuildTaskKey(artifact.taskKey) && !isWorldbuildDomainTaskKey(artifact.taskKey)) {
		throw new WorldbuildCheckpointError('invalid_payload', 'Checkpoint artifact task key is not worldbuild-compatible.');
	}

	const version = typeof input.version === 'string' ? input.version : PIPELINE_CHECKPOINT_SCHEMA_VERSION;
	const createdAt = existing?.createdAt ?? nowIso();
	const updatedAt = nowIso();

	return {
		id: key,
		projectId,
		ownerId,
		version,
		lifecycle: 'draft',
		taskKey: artifact.taskKey,
		artifact: {
			...artifact,
			id: artifact.id || key,
			taskKey: artifact.taskKey,
			lifecycle: 'draft',
		},
		createdAt,
		updatedAt,
		review: null,
		acceptance: null,
		rejection: null,
	};
}

function listRows(
	database: Database.Database,
	projectId: string,
	ownerId: string,
): Array<{ key: string; value: string }> {
	return database
		.prepare(
			'SELECT key, value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ?',
		)
		.all(projectId, PIPELINE_METADATA_SCOPE, ownerId) as Array<{ key: string; value: string }>;
}

function getRow(
	database: Database.Database,
	projectId: string,
	ownerId: string,
	key: string,
): MetadataRow | undefined {
	return database
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get(projectId, PIPELINE_METADATA_SCOPE, ownerId, key) as MetadataRow | undefined;
}

function writeRow(
	database: Database.Database,
	record: WorldbuildCheckpointRecord,
	keyOverride?: string,
): void {
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
			record.ownerId,
			keyOverride ?? record.id,
			JSON.stringify(record),
			record.updatedAt,
		);
}

function loadCheckpointOrThrow(
	database: Database.Database,
	projectId: string,
	ownerId: string,
	key: string,
): WorldbuildCheckpointRecord {
	const row = getRow(database, projectId, ownerId, key);
	if (!row) {
		throw new WorldbuildCheckpointError('not_found', `Checkpoint ${key} was not found.`);
	}

	const parsed = deserializeCheckpoint(row.value);
	if (!parsed) {
		throw new WorldbuildCheckpointError(
			'invalid_payload',
			`Checkpoint ${key} payload is malformed and cannot be processed.`,
		);
	}

	return parsed;
}

function applyPopulatedBibleProjection(
	database: Database.Database,
	projectId: string,
	writes: WorldbuildPopulatedBibleTableWrites,
	timestamp: string,
): Partial<Record<keyof WorldbuildPopulatedBibleTableWrites, number>> {
	const counts: Partial<Record<keyof WorldbuildPopulatedBibleTableWrites, number>> = {
		characters: 0,
		locations: 0,
		factions: 0,
		themes: 0,
		glossary_terms: 0,
		lore_entries: 0,
		plot_threads: 0,
		timeline_events: 0,
	};

	const insertFaction = database.prepare(
		`INSERT INTO factions (id, projectId, name, type, description, mission, ideology, createdAt, updatedAt)
		 VALUES (@id, @projectId, @name, @type, @description, @mission, @ideology, @createdAt, @updatedAt)`,
	);
	const insertTheme = database.prepare(
		`INSERT INTO themes (id, projectId, title, description, tensionPair, imagery, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @description, @tensionPair, @imagery, @createdAt, @updatedAt)`,
	);
	const insertGlossary = database.prepare(
		`INSERT INTO glossary_terms (id, projectId, term, definition, pronunciation, category, createdAt, updatedAt)
		 VALUES (@id, @projectId, @term, @definition, @pronunciation, @category, @createdAt, @updatedAt)`,
	);
	const insertCharacter = database.prepare(
		`INSERT INTO characters (id, projectId, name, role, bio, faction, factionId, traits, goals, flaws, notes, tags, createdAt, updatedAt)
		 VALUES (@id, @projectId, @name, @role, @bio, @faction, @factionId, @traits, @goals, @flaws, @notes, @tags, @createdAt, @updatedAt)`,
	);
	const insertLocation = database.prepare(
		`INSERT INTO locations (id, projectId, name, description, tags, createdAt, updatedAt)
		 VALUES (@id, @projectId, @name, @description, @tags, @createdAt, @updatedAt)`,
	);
	const insertLoreEntry = database.prepare(
		`INSERT INTO lore_entries (id, projectId, title, category, content, tags, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @category, @content, @tags, @createdAt, @updatedAt)`,
	);
	const insertPlotThread = database.prepare(
		`INSERT INTO plot_threads (id, projectId, title, description, status, relatedSceneIds, relatedCharacterIds, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @description, @status, @relatedSceneIds, @relatedCharacterIds, @createdAt, @updatedAt)`,
	);
	const insertTimelineEvent = database.prepare(
		`INSERT INTO timeline_events (id, projectId, title, description, date, relatedCharacterIds, relatedSceneIds, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @description, @date, @relatedCharacterIds, @relatedSceneIds, @createdAt, @updatedAt)`,
	);

	const factionNameToId = new Map<string, string>();

	for (const faction of writes.factions) {
		const name = ensureNonEmpty(asString(faction.name), 'faction name');
		const id = crypto.randomUUID();
		insertFaction.run({
			id,
			projectId,
			name,
			type: asString(faction.type),
			description: asString(faction.description),
			mission: asString(faction.mission),
			ideology: asString(faction.ideology),
			createdAt: timestamp,
			updatedAt: timestamp,
		});
		factionNameToId.set(name.toLowerCase(), id);
		counts.factions = (counts.factions ?? 0) + 1;
	}

	for (const theme of writes.themes) {
		insertTheme.run({
			id: crypto.randomUUID(),
			projectId,
			title: ensureNonEmpty(asString(theme.title), 'theme title'),
			description: asString(theme.description),
			tensionPair: asString(theme.tensionPair),
			imagery: asString(theme.imagery),
			createdAt: timestamp,
			updatedAt: timestamp,
		});
		counts.themes = (counts.themes ?? 0) + 1;
	}

	for (const term of writes.glossary_terms) {
		insertGlossary.run({
			id: crypto.randomUUID(),
			projectId,
			term: ensureNonEmpty(asString(term.term), 'glossary term'),
			definition: asString(term.definition),
			pronunciation: asString(term.pronunciation),
			category: asString(term.category),
			createdAt: timestamp,
			updatedAt: timestamp,
		});
		counts.glossary_terms = (counts.glossary_terms ?? 0) + 1;
	}

	for (const character of writes.characters) {
		const factionName = asString(character.faction);
		const factionId = factionName ? factionNameToId.get(factionName.toLowerCase()) ?? null : null;
		insertCharacter.run({
			id: crypto.randomUUID(),
			projectId,
			name: ensureNonEmpty(asString(character.name), 'character name'),
			role: asString(character.role),
			bio: asString(character.bio),
			faction: factionName,
			factionId,
			traits: encodeJson(normalizeStringArray(character.traits)),
			goals: encodeJson(normalizeStringArray(character.goals)),
			flaws: encodeJson(normalizeStringArray(character.flaws)),
			notes: asString(character.notes),
			tags: encodeJson(normalizeStringArray(character.tags)),
			createdAt: timestamp,
			updatedAt: timestamp,
		});
		counts.characters = (counts.characters ?? 0) + 1;
	}

	for (const location of writes.locations) {
		insertLocation.run({
			id: crypto.randomUUID(),
			projectId,
			name: ensureNonEmpty(asString(location.name), 'location name'),
			description: asString(location.description),
			tags: encodeJson(normalizeStringArray(location.tags)),
			createdAt: timestamp,
			updatedAt: timestamp,
		});
		counts.locations = (counts.locations ?? 0) + 1;
	}

	for (const loreEntry of writes.lore_entries) {
		insertLoreEntry.run({
			id: crypto.randomUUID(),
			projectId,
			title: ensureNonEmpty(asString(loreEntry.title), 'lore entry title'),
			category: asString(loreEntry.category),
			content: asString(loreEntry.content),
			tags: encodeJson(normalizeStringArray(loreEntry.tags)),
			createdAt: timestamp,
			updatedAt: timestamp,
		});
		counts.lore_entries = (counts.lore_entries ?? 0) + 1;
	}

	for (const plotThread of writes.plot_threads) {
		insertPlotThread.run({
			id: crypto.randomUUID(),
			projectId,
			title: ensureNonEmpty(asString(plotThread.title), 'plot thread title'),
			description: asString(plotThread.description),
			status: asString(plotThread.status),
			relatedSceneIds: encodeJson(normalizeStringArray(plotThread.relatedSceneIds)),
			relatedCharacterIds: encodeJson(normalizeStringArray(plotThread.relatedCharacterIds)),
			createdAt: timestamp,
			updatedAt: timestamp,
		});
		counts.plot_threads = (counts.plot_threads ?? 0) + 1;
	}

	for (const event of writes.timeline_events) {
		insertTimelineEvent.run({
			id: crypto.randomUUID(),
			projectId,
			title: ensureNonEmpty(asString(event.title), 'timeline event title'),
			description: asString(event.description),
			date: asString(event.date),
			relatedCharacterIds: encodeJson(normalizeStringArray(event.relatedCharacterIds)),
			relatedSceneIds: encodeJson(normalizeStringArray(event.relatedSceneIds)),
			createdAt: timestamp,
			updatedAt: timestamp,
		});
		counts.timeline_events = (counts.timeline_events ?? 0) + 1;
	}

	return counts;
}

export interface ReviewCheckpointInput {
	reviewer?: string | null;
	note?: string;
}

export interface AcceptCheckpointInput {
	acceptedBy?: string | null;
	note?: string;
}

export interface RejectCheckpointInput {
	rejectedBy?: string | null;
	reason: string;
}

export interface WorldbuildCheckpointService {
	upsertCheckpoint(projectId: string, ownerId: string, key: string, value: unknown): WorldbuildCheckpointRecord;
	getCheckpoint(projectId: string, ownerId: string, key: string): WorldbuildCheckpointRecord | undefined;
	listCheckpoints(projectId: string, ownerId: string): WorldbuildCheckpointRecord[];
	moveToReview(
		projectId: string,
		ownerId: string,
		key: string,
		input?: ReviewCheckpointInput,
	): WorldbuildCheckpointRecord;
	acceptCheckpoint(
		projectId: string,
		ownerId: string,
		key: string,
		input?: AcceptCheckpointInput,
	): WorldbuildCheckpointRecord;
	rejectCheckpoint(
		projectId: string,
		ownerId: string,
		key: string,
		input: RejectCheckpointInput,
	): WorldbuildCheckpointRecord;
}

export function createWorldbuildCheckpointService(
	database: Database.Database = db,
): WorldbuildCheckpointService {
	function upsertCheckpoint(
		projectId: string,
		ownerId: string,
		key: string,
		value: unknown,
	): WorldbuildCheckpointRecord {
		const existing = getCheckpoint(projectId, ownerId, key);
		const record = parseUpsertInput(projectId, ownerId, key, value, existing);
		writeRow(database, record, key);
		return record;
	}

	function getCheckpoint(
		projectId: string,
		ownerId: string,
		key: string,
	): WorldbuildCheckpointRecord | undefined {
		const row = getRow(database, projectId, ownerId, key);
		if (!row) return undefined;
		const parsed = deserializeCheckpoint(row.value);
		if (!parsed) {
			throw new WorldbuildCheckpointError(
				'invalid_payload',
				`Checkpoint ${key} exists but could not be parsed.`,
			);
		}
		return parsed;
	}

	function listCheckpoints(projectId: string, ownerId: string): WorldbuildCheckpointRecord[] {
		const rows = listRows(database, projectId, ownerId);
		const parsed = rows
			.map((row) => deserializeCheckpoint(row.value))
			.filter((row): row is WorldbuildCheckpointRecord => row !== null);
		return parsed.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
	}

	function moveToReview(
		projectId: string,
		ownerId: string,
		key: string,
		input: ReviewCheckpointInput = {},
	): WorldbuildCheckpointRecord {
		const tx = database.transaction(() => {
			const checkpoint = loadCheckpointOrThrow(database, projectId, ownerId, key);
			if (!isSupportedCheckpointVersion(checkpoint.version)) {
				throw new WorldbuildCheckpointError(
					'invalid_version',
					`Unsupported checkpoint version ${checkpoint.version}.`,
				);
			}
			if (checkpoint.lifecycle === 'accepted' || checkpoint.lifecycle === 'rejected') {
				throw new WorldbuildCheckpointError(
					'invalid_transition',
					`Cannot move ${checkpoint.lifecycle} checkpoint ${key} back to review.`,
				);
			}

			const review: CheckpointReviewState = {
				reviewedAt: nowIso(),
				reviewer: asOptionalString(input.reviewer),
				note: asString(input.note).trim(),
			};
			const updatedAt = nowIso();
			const next: WorldbuildCheckpointRecord = {
				...checkpoint,
				lifecycle: 'review',
				artifact: { ...checkpoint.artifact, lifecycle: 'review' },
				review,
				updatedAt,
			};
			writeRow(database, next, key);
			return next;
		});

		return tx();
	}

	function acceptCheckpoint(
		projectId: string,
		ownerId: string,
		key: string,
		input: AcceptCheckpointInput = {},
	): WorldbuildCheckpointRecord {
		const tx = database.transaction(() => {
			const checkpoint = loadCheckpointOrThrow(database, projectId, ownerId, key);
			if (!isSupportedCheckpointVersion(checkpoint.version)) {
				throw new WorldbuildCheckpointError(
					'invalid_version',
					`Unsupported checkpoint version ${checkpoint.version}.`,
				);
			}

			if (checkpoint.lifecycle === 'accepted') {
				return checkpoint;
			}
			if (checkpoint.lifecycle === 'rejected') {
				throw new WorldbuildCheckpointError(
					'invalid_transition',
					`Rejected checkpoint ${key} cannot be accepted without regenerating a new draft.`,
				);
			}

			const appliedAt = nowIso();
			let entityCounts: Partial<Record<keyof WorldbuildPopulatedBibleTableWrites, number>> = {};
			let projectedToCanon = false;

			if (hasPopulatedBibleProjection(checkpoint)) {
				entityCounts = applyPopulatedBibleProjection(
					database,
					projectId,
					checkpoint.artifact.payload.tableWrites,
					appliedAt,
				);
				projectedToCanon = true;
			}

			const acceptance: CheckpointAcceptanceState = {
				acceptedAt: appliedAt,
				acceptedBy: asOptionalString(input.acceptedBy),
				note: asString(input.note).trim(),
				projectionMode: 'atomic',
				projectedToCanon,
				entityCounts,
			};

			const next: WorldbuildCheckpointRecord = {
				...checkpoint,
				lifecycle: 'accepted',
				artifact: { ...checkpoint.artifact, lifecycle: 'accepted' },
				acceptance,
				rejection: null,
				updatedAt: appliedAt,
			};

			writeRow(database, next, key);
			return next;
		});

		return tx();
	}

	function rejectCheckpoint(
		projectId: string,
		ownerId: string,
		key: string,
		input: RejectCheckpointInput,
	): WorldbuildCheckpointRecord {
		const reason = input.reason.trim();
		if (!reason) {
			throw new WorldbuildCheckpointError('invalid_payload', 'Reject reason is required.');
		}

		const tx = database.transaction(() => {
			const checkpoint = loadCheckpointOrThrow(database, projectId, ownerId, key);
			if (!isSupportedCheckpointVersion(checkpoint.version)) {
				throw new WorldbuildCheckpointError(
					'invalid_version',
					`Unsupported checkpoint version ${checkpoint.version}.`,
				);
			}
			if (checkpoint.lifecycle === 'accepted') {
				throw new WorldbuildCheckpointError(
					'invalid_transition',
					`Accepted checkpoint ${key} cannot be rejected.`,
				);
			}

			const rejectedAt = nowIso();
			const rejection: CheckpointRejectionState = {
				rejectedAt,
				rejectedBy: asOptionalString(input.rejectedBy),
				reason,
			};

			const next: WorldbuildCheckpointRecord = {
				...checkpoint,
				lifecycle: 'rejected',
				artifact: { ...checkpoint.artifact, lifecycle: 'rejected' },
				rejection,
				updatedAt: rejectedAt,
			};
			writeRow(database, next, key);
			return next;
		});

		return tx();
	}

	return {
		upsertCheckpoint,
		getCheckpoint,
		listCheckpoints,
		moveToReview,
		acceptCheckpoint,
		rejectCheckpoint,
	};
}

const defaultService = createWorldbuildCheckpointService();

export function upsertWorldbuildCheckpoint(
	projectId: string,
	ownerId: string,
	key: string,
	value: unknown,
): WorldbuildCheckpointRecord {
	return defaultService.upsertCheckpoint(projectId, ownerId, key, value);
}

export function getWorldbuildCheckpoint(
	projectId: string,
	ownerId: string,
	key: string,
): WorldbuildCheckpointRecord | undefined {
	return defaultService.getCheckpoint(projectId, ownerId, key);
}

export function listWorldbuildCheckpoints(
	projectId: string,
	ownerId = WORLDBUILD_CHECKPOINT_OWNER_ID,
): WorldbuildCheckpointRecord[] {
	return defaultService.listCheckpoints(projectId, ownerId);
}

export function reviewWorldbuildCheckpoint(
	projectId: string,
	ownerId: string,
	key: string,
	input?: ReviewCheckpointInput,
): WorldbuildCheckpointRecord {
	return defaultService.moveToReview(projectId, ownerId, key, input);
}

export function acceptWorldbuildCheckpoint(
	projectId: string,
	ownerId: string,
	key: string,
	input?: AcceptCheckpointInput,
): WorldbuildCheckpointRecord {
	return defaultService.acceptCheckpoint(projectId, ownerId, key, input);
}

export function rejectWorldbuildCheckpoint(
	projectId: string,
	ownerId: string,
	key: string,
	input: RejectCheckpointInput,
): WorldbuildCheckpointRecord {
	return defaultService.rejectCheckpoint(projectId, ownerId, key, input);
}

export const worldbuildCheckpointService = defaultService;

export function createDomainCheckpoint(params: {
	projectId: string;
	taskKey: WorldbuildDomainTaskKey;
	payload: WorldbuildPayload;
	ownerId?: string;
}): WorldbuildDomainCheckpointRecord {
	if (!isWorldbuildDomainTaskKey(params.taskKey)) {
		throw new WorldbuildCheckpointError(
			'invalid_payload',
			`Task key ${params.taskKey} is not a valid worldbuilding domain key.`,
		);
	}

	const createdAt = nowIso();
	const ownerId = params.ownerId ?? WORLDBUILD_CHECKPOINT_OWNER_ID;

	const artifact = createPipelineArtifactEnvelope<WorldbuildPayload>({
		task: {
			key: params.taskKey,
			family: 'vibe-worldbuild-domain',
			stage: params.taskKey.replace('vibe-worldbuild.domain.', ''),
			role: '',
			contextPolicy: 'continuity_scope',
			outputFormat: `json_worldbuild_${params.taskKey.split('.').pop()}`,
		},
		payload: params.payload,
		producedAt: createdAt,
		lifecycle: 'draft',
		hierarchyReferences: createDefaultHierarchyReferences(),
	});

	const record: WorldbuildDomainCheckpointRecord = {
		id: artifact.id,
		projectId: params.projectId,
		ownerId,
		version: PIPELINE_CHECKPOINT_SCHEMA_VERSION,
		lifecycle: 'draft',
		taskKey: params.taskKey,
		artifact,
		createdAt,
		updatedAt: createdAt,
		review: null,
		acceptance: null,
		rejection: null,
	};

	writeRow(db, record, artifact.id);
	return record;
}

export function createCheckpointDraftFromArtifact(params: {
	projectId: string;
	ownerId?: string;
	artifact: PipelineArtifactEnvelope<WorldbuildPayload>;
	version?: string;
}): WorldbuildCheckpointRecord {
	if (!isWorldbuildTaskKey(params.artifact.taskKey)) {
		throw new WorldbuildCheckpointError(
			'invalid_payload',
			`Artifact task key ${params.artifact.taskKey} is not worldbuild-compatible.`,
		);
	}

	const createdAt = nowIso();
	const taskKey = params.artifact.taskKey as WorldbuildTaskKey;
	return {
		id: params.artifact.id,
		projectId: params.projectId,
		ownerId: params.ownerId ?? WORLDBUILD_CHECKPOINT_OWNER_ID,
		version: params.version ?? PIPELINE_CHECKPOINT_SCHEMA_VERSION,
		lifecycle: 'draft',
		taskKey,
		artifact: {
			...params.artifact,
			lifecycle: 'draft',
		} as PipelineArtifactEnvelope<WorldbuildPayload>,
		createdAt,
		updatedAt: createdAt,
		review: null,
		acceptance: null,
		rejection: null,
	};
}
