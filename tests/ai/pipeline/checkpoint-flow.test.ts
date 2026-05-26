import { beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import {
	createCheckpointDraftFromArtifact,
	createWorldbuildCheckpointService,
	WorldbuildCheckpointError,
} from '$lib/ai/pipeline/checkpoint-service.js';
import { createPipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import { PIPELINE_TASK_KEYS, getPipelineTaskDefinition } from '$lib/ai/pipeline/task-catalog.js';
import type { WorldbuildPopulatedBiblePayload } from '$lib/ai/pipeline/worldbuild-agent.js';

function createTestDb() {
	const database = new Database(':memory:');
	database.pragma('journal_mode = WAL');
	database.pragma('foreign_keys = ON');
	database.exec(SCHEMA_SQL);
	database.exec(INDEX_SQL);
	return database;
}

function seedProject(database: Database.Database, projectId = 'proj-1') {
	const now = new Date().toISOString();
	database
		.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
		)
		.run({
			id: projectId,
			title: 'Checkpoint Test Project',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			status: 'draft',
			createdAt: now,
			updatedAt: now,
		});
}

function countRows(database: Database.Database, table: string): number {
	const row = database
		.prepare(`SELECT COUNT(*) AS count FROM ${table}`)
		.get() as { count: number };
	return row.count;
}

function createPopulatedBibleDraftArtifact(projectId = 'proj-1') {
	const definition = getPipelineTaskDefinition(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE);
	if (!definition) throw new Error('Missing populated world-bible task definition.');

	const payload: WorldbuildPopulatedBiblePayload = {
		canonical: {
			characters: [{ name: 'Ari Quill' }],
			locations: [{ name: 'North Arch' }],
			factions: [{ name: 'Clock Syndicate' }],
			loreEntries: [{ title: 'Glass Accord' }],
			timelineEvents: [{ title: 'Siege of Winterline' }],
			themes: [{ title: 'Memory vs Obligation' }],
			glossary: [{ term: 'Shardline' }],
			relationships: [{ title: 'Ari vs Helion' }],
		},
		tableWrites: {
			characters: [
				{
					name: 'Ari Quill',
					role: 'protagonist',
					bio: 'A memory courier navigating state collapse.',
					faction: 'Clock Syndicate',
					traits: ['precise'],
					goals: ['break the embargo'],
					flaws: ['obsessive'],
					tags: ['lead'],
					notes: 'Carries inherited debt ledger.',
				},
			],
			locations: [
				{
					name: 'North Arch',
					description: 'A suspended market between flood towers.',
					tags: ['market', 'frontier'],
				},
			],
			factions: [
				{
					name: 'Clock Syndicate',
					type: 'trade guild',
					description: 'Controls memory transit routes.',
					mission: 'Protect data routes.',
					ideology: 'Order through scarcity.',
				},
			],
			themes: [
				{
					title: 'Memory vs Obligation',
					description: 'Personal truth collides with inherited duty.',
					tensionPair: 'truth vs duty',
					imagery: 'fractured mirrors',
				},
			],
			glossary_terms: [
				{
					term: 'Shardline',
					definition: 'A data vein carved into glacial glass.',
					pronunciation: 'shard-line',
					category: 'infrastructure',
				},
			],
			lore_entries: [
				{
					title: 'Glass Accord',
					category: 'treaty',
					content: 'Cities exchange stored memories for weather rights.',
					tags: ['canon'],
				},
			],
			plot_threads: [
				{
					title: 'Ari vs Helion',
					description: 'Competing claims over the Winterline ledger.',
					status: 'planned',
					relatedSceneIds: [],
					relatedCharacterIds: [],
				},
			],
			timeline_events: [
				{
					title: 'Siege of Winterline',
					description: 'The supply chain fracture that started the diaspora.',
					date: 'Year 8',
					relatedCharacterIds: [],
					relatedSceneIds: [],
				},
			],
		},
	};

	const artifact = createPipelineArtifactEnvelope({
		task: definition,
		payload,
		hierarchyReferences: {
			stages: ['stage-worldbuild-001'],
		},
	});

	return createCheckpointDraftFromArtifact({
		projectId,
		artifact,
	});
}

describe('worldbuild checkpoint flow', () => {
	let database: Database.Database;

	beforeEach(() => {
		database = createTestDb();
		seedProject(database);
	});

	it('keeps canon unchanged until explicit accept and then projects atomically', () => {
		const service = createWorldbuildCheckpointService(database);
		const draft = createPopulatedBibleDraftArtifact();

		const stored = service.upsertCheckpoint('proj-1', 'vibe-worldbuild', draft.id, {
			artifact: draft.artifact,
			version: draft.version,
		});
		expect(stored.lifecycle).toBe('draft');
		expect(countRows(database, 'characters')).toBe(0);
		expect(countRows(database, 'factions')).toBe(0);

		const inReview = service.moveToReview('proj-1', 'vibe-worldbuild', draft.id, {
			reviewer: 'reviewer-1',
			note: 'Ready for explicit acceptance.',
		});
		expect(inReview.lifecycle).toBe('review');
		expect(countRows(database, 'characters')).toBe(0);

		const accepted = service.acceptCheckpoint('proj-1', 'vibe-worldbuild', draft.id, {
			acceptedBy: 'author-1',
			note: 'Promote this world bible.',
		});
		expect(accepted.lifecycle).toBe('accepted');
		expect(accepted.acceptance?.projectedToCanon).toBe(true);
		expect(accepted.acceptance?.projectionMode).toBe('atomic');

		expect(countRows(database, 'characters')).toBe(1);
		expect(countRows(database, 'locations')).toBe(1);
		expect(countRows(database, 'factions')).toBe(1);
		expect(countRows(database, 'themes')).toBe(1);
		expect(countRows(database, 'glossary_terms')).toBe(1);
		expect(countRows(database, 'lore_entries')).toBe(1);
		expect(countRows(database, 'plot_threads')).toBe(1);
		expect(countRows(database, 'timeline_events')).toBe(1);
	});

	it('reject path preserves rationale and does not mutate canon', () => {
		const service = createWorldbuildCheckpointService(database);
		const draft = createPopulatedBibleDraftArtifact();

		service.upsertCheckpoint('proj-1', 'vibe-worldbuild', draft.id, {
			artifact: draft.artifact,
			version: draft.version,
		});

		const rejected = service.rejectCheckpoint('proj-1', 'vibe-worldbuild', draft.id, {
			reason: 'Conflicting faction hierarchy. Needs rewrite.',
			rejectedBy: 'reviewer-2',
		});

		expect(rejected.lifecycle).toBe('rejected');
		expect(rejected.rejection?.reason).toContain('Conflicting faction hierarchy');
		expect(countRows(database, 'characters')).toBe(0);
		expect(countRows(database, 'factions')).toBe(0);
	});

	it('second accept is idempotent and does not double-apply writes', () => {
		const service = createWorldbuildCheckpointService(database);
		const draft = createPopulatedBibleDraftArtifact();
		service.upsertCheckpoint('proj-1', 'vibe-worldbuild', draft.id, {
			artifact: draft.artifact,
			version: draft.version,
		});
		service.moveToReview('proj-1', 'vibe-worldbuild', draft.id, { note: 'Ready' });

		const first = service.acceptCheckpoint('proj-1', 'vibe-worldbuild', draft.id);
		expect(first.lifecycle).toBe('accepted');
		expect(countRows(database, 'characters')).toBe(1);

		const second = service.acceptCheckpoint('proj-1', 'vibe-worldbuild', draft.id);
		expect(second.lifecycle).toBe('accepted');
		expect(countRows(database, 'characters')).toBe(1);
		expect(countRows(database, 'factions')).toBe(1);
	});

	it('invalid payload versions fail non-destructively', () => {
		const service = createWorldbuildCheckpointService(database);
		const draft = createPopulatedBibleDraftArtifact();
		service.upsertCheckpoint('proj-1', 'vibe-worldbuild', draft.id, {
			artifact: draft.artifact,
			version: '9.9.9',
		});

		expect(() => service.acceptCheckpoint('proj-1', 'vibe-worldbuild', draft.id)).toThrow(
			WorldbuildCheckpointError,
		);
		expect(countRows(database, 'characters')).toBe(0);

		const checkpoint = service.getCheckpoint('proj-1', 'vibe-worldbuild', draft.id);
		expect(checkpoint?.lifecycle).toBe('draft');
	});
});
