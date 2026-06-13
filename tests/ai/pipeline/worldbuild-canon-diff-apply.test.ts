import { beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import { acceptProposalAtomically } from '$lib/ai/pipeline/checkpoint-service.js';
import { WORLDBUILD_PROPOSAL_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';
import type { WorldbuildCanonDiff } from '$lib/ai/pipeline/worldbuild-canon-diff-schema.js';
import type { WorldbuildProposalRecord } from '$lib/ai/pipeline/worldbuild-proposal-schema.js';

const PROJECT_ID = 'project-diff-apply';
const PROPOSAL_ID = 'proposal-diff-apply';
const NOW = '2026-06-12T18:00:00.000Z';

function createTestDb(): Database.Database {
	const database = new Database(':memory:');
	database.pragma('journal_mode = WAL');
	database.pragma('foreign_keys = ON');
	database.exec(SCHEMA_SQL);
	database.exec(INDEX_SQL);
	return database;
}

function seedProject(database: Database.Database): void {
	database
		.prepare(
			`INSERT INTO projects (id, title, createdAt, updatedAt)
			 VALUES (@id, @title, @createdAt, @updatedAt)`,
		)
		.run({
			id: PROJECT_ID,
			title: 'Diff Apply Test',
			createdAt: NOW,
			updatedAt: NOW,
		});
}

function seedCharacter(database: Database.Database, overrides: Record<string, unknown> = {}): string {
	const id = String(overrides.id ?? 'character-1');
	database
		.prepare(
			`INSERT INTO characters (id, projectId, name, role, bio, traits, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @role, @bio, @traits, @tags, @createdAt, @updatedAt)`,
		)
		.run({
			id,
			projectId: PROJECT_ID,
			name: 'Ari Quill',
			role: '',
			bio: '',
			traits: '["precise"]',
			tags: '[]',
			createdAt: NOW,
			updatedAt: NOW,
			...overrides,
		});
	return id;
}

function seedLocation(database: Database.Database, overrides: Record<string, unknown> = {}): string {
	const id = String(overrides.id ?? 'location-1');
	database
		.prepare(
			`INSERT INTO locations (id, projectId, name, description, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @description, @tags, @createdAt, @updatedAt)`,
		)
		.run({
			id,
			projectId: PROJECT_ID,
			name: 'Glass Delta',
			description: '',
			tags: '["market"]',
			createdAt: NOW,
			updatedAt: NOW,
			...overrides,
		});
	return id;
}

function seedFaction(database: Database.Database, overrides: Record<string, unknown> = {}): string {
	const id = String(overrides.id ?? 'faction-1');
	database
		.prepare(
			`INSERT INTO factions (id, projectId, name, type, description, mission, ideology, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @type, @description, @mission, @ideology, @createdAt, @updatedAt)`,
		)
		.run({
			id,
			projectId: PROJECT_ID,
			name: 'Clock Syndicate',
			type: 'guild',
			description: '',
			mission: '',
			ideology: '',
			createdAt: NOW,
			updatedAt: NOW,
			...overrides,
		});
	return id;
}

function makeProposal(overrides: Partial<WorldbuildProposalRecord> = {}): WorldbuildProposalRecord {
	return {
		proposalId: PROPOSAL_ID,
		projectId: PROJECT_ID,
		categoryId: 'personae',
		entityKind: 'character',
		status: 'pending_review',
		generatedAt: NOW,
		sourceContext: {
			title: 'Diff Apply Test',
			genre: 'fantasy',
			logline: 'A courier outruns a civil war.',
			synopsisHash: 'abc12345',
		},
		confidence: 0.8,
		reasoningSummary: 'Test proposal.',
		payload: { name: 'Ari Quill', role: 'protagonist', bio: 'A courier.' },
		dedupeKey: 'personae:character:ari quill',
		acceptance: null,
		rejection: null,
		...overrides,
	};
}

function seedProposal(
	database: Database.Database,
	overrides: Partial<WorldbuildProposalRecord> = {},
): void {
	const proposal = makeProposal(overrides);
	database
		.prepare(
			`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
			 VALUES (@projectId, 'pipeline', @ownerId, @key, @value, @updatedAt)`,
		)
		.run({
			projectId: proposal.projectId,
			ownerId: WORLDBUILD_PROPOSAL_OWNER_ID,
			key: proposal.proposalId,
			value: JSON.stringify(proposal),
			updatedAt: NOW,
		});
}

function readCharacter(database: Database.Database, id = 'character-1') {
	return database.prepare('SELECT * FROM characters WHERE id = ?').get(id) as Record<string, unknown>;
}

function readFirstCharacter(database: Database.Database) {
	return database
		.prepare('SELECT * FROM characters WHERE projectId = ? ORDER BY createdAt ASC LIMIT 1')
		.get(PROJECT_ID) as Record<string, unknown>;
}

function readLocation(database: Database.Database, id = 'location-1') {
	return database.prepare('SELECT * FROM locations WHERE id = ?').get(id) as Record<string, unknown>;
}

function proposalStatus(database: Database.Database): string {
	const row = database
		.prepare(
			`SELECT value FROM project_metadata
			 WHERE projectId = ? AND scope = 'pipeline' AND ownerId = ? AND key = ?`,
		)
		.get(PROJECT_ID, WORLDBUILD_PROPOSAL_OWNER_ID, PROPOSAL_ID) as { value: string };
	return (JSON.parse(row.value) as WorldbuildProposalRecord).status;
}

function targetRef(family: 'character' | 'location' | 'faction', id: string, displayName: string) {
	return {
		family,
		id,
		displayName,
		table: `${family}s`,
		projectId: PROJECT_ID,
	};
}

describe('worldbuild canon diff apply', () => {
	let database: Database.Database;

	beforeEach(() => {
		database = createTestDb();
		seedProject(database);
	});

	it('keeps create diffs on the legacy create projection fallback', () => {
		const createDiff: WorldbuildCanonDiff = {
			diffId: 'diff-create',
			proposalId: PROPOSAL_ID,
			projectId: PROJECT_ID,
			categoryId: 'personae',
			entityKind: 'character',
			family: 'character',
			generatedAt: NOW,
			summary: 'Create Ari Quill.',
			confidence: 0.8,
			decision: 'create',
			target: null,
			fields: [
				{
					fieldPath: 'name',
					valueType: 'string',
					operation: 'add',
					before: null,
					after: 'Ari Quill',
					evidence: [],
				},
			],
			links: [],
			duplicateCandidates: [],
			evidence: [],
		};
		seedProposal(database, { canonDiff: createDiff });

		const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID, database);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.proposal.acceptance?.projectionTarget).toBe('personae');
		expect(result.proposal.acceptance?.projectedToCanon).toBe(true);
		expect(readFirstCharacter(database).name).toBe('Ari Quill');
	});

	it('applies update diffs to empty fields and append-only arrays', () => {
		const characterId = seedCharacter(database);
		const updateDiff: WorldbuildCanonDiff = {
			diffId: 'diff-update',
			proposalId: PROPOSAL_ID,
			projectId: PROJECT_ID,
			categoryId: 'personae',
			entityKind: 'character',
			family: 'character',
			generatedAt: NOW,
			summary: 'Fill character fields.',
			confidence: 0.88,
			decision: 'update',
			target: targetRef('character', characterId, 'Ari Quill'),
			fields: [
				{
					fieldPath: 'coreDesire',
					valueType: 'string',
					operation: 'add',
					before: '',
					after: 'Recover the ledger.',
					evidence: [],
				},
				{
					fieldPath: 'traits',
					valueType: 'array',
					operation: 'append',
					before: ['precise'],
					after: ['precise', 'restless'],
					evidence: [],
				},
			],
			links: [],
			duplicateCandidates: [],
			evidence: [],
		};
		seedProposal(database, { canonDiff: updateDiff });

		const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID, database);

		expect(result.ok).toBe(true);
		const row = readCharacter(database);
		expect(row.coreDesire).toBe('Recover the ledger.');
		expect(JSON.parse(String(row.traits))).toEqual(['precise', 'restless']);
	});

	it('applies merge diffs to locations without duplicating array values', () => {
		const locationId = seedLocation(database);
		const mergeDiff: WorldbuildCanonDiff = {
			diffId: 'diff-merge',
			proposalId: PROPOSAL_ID,
			projectId: PROJECT_ID,
			categoryId: 'atlas',
			entityKind: 'location',
			family: 'location',
			generatedAt: NOW,
			summary: 'Merge location details.',
			confidence: 0.9,
			decision: 'merge',
			target: targetRef('location', locationId, 'Glass Delta'),
			fields: [
				{
					fieldPath: 'description',
					valueType: 'string',
					operation: 'add',
					before: '',
					after: 'A flooded market crossing.',
					evidence: [],
				},
				{
					fieldPath: 'tags',
					valueType: 'array',
					operation: 'append',
					before: ['market'],
					after: ['market', 'flooded'],
					evidence: [],
				},
			],
			links: [],
			duplicateCandidates: [
				{
					target: targetRef('location', locationId, 'Glass Delta'),
					matchKind: 'exact_name',
					score: 1,
					evidence: [{ kind: 'exact_name', label: 'Exact location name.', score: 1 }],
				},
			],
			evidence: [],
		};
		seedProposal(database, {
			categoryId: 'atlas',
			entityKind: 'location',
			canonDiff: mergeDiff,
		});

		const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID, database);

		expect(result.ok).toBe(true);
		const row = readLocation(database);
		expect(row.description).toBe('A flooded market crossing.');
		expect(JSON.parse(String(row.tags))).toEqual(['market', 'flooded']);
	});

	it('applies supported link-only decisions', () => {
		const characterId = seedCharacter(database);
		const factionId = seedFaction(database);
		const linkDiff: WorldbuildCanonDiff = {
			diffId: 'diff-link',
			proposalId: PROPOSAL_ID,
			projectId: PROJECT_ID,
			categoryId: 'personae',
			entityKind: 'character',
			family: 'character',
			generatedAt: NOW,
			summary: 'Link character to faction.',
			confidence: 0.86,
			decision: 'link',
			target: targetRef('character', characterId, 'Ari Quill'),
			fields: [],
			links: [
				{
					linkType: 'faction_membership',
					source: targetRef('character', characterId, 'Ari Quill'),
					target: targetRef('faction', factionId, 'Clock Syndicate'),
					description: 'Faction text resolves to an existing faction.',
					evidence: [],
				},
			],
			duplicateCandidates: [],
			evidence: [],
		};
		seedProposal(database, { canonDiff: linkDiff });

		const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID, database);

		expect(result.ok).toBe(true);
		const row = readCharacter(database);
		expect(row.factionId).toBe(factionId);
		expect(row.faction).toBe('Clock Syndicate');
	});

	it('accepts no-op diffs without canon writes', () => {
		const characterId = seedCharacter(database);
		const noopDiff: WorldbuildCanonDiff = {
			diffId: 'diff-noop',
			proposalId: PROPOSAL_ID,
			projectId: PROJECT_ID,
			categoryId: 'personae',
			entityKind: 'character',
			family: 'character',
			generatedAt: NOW,
			summary: 'Existing canon already covers the proposal.',
			confidence: 1,
			decision: 'no_op',
			target: targetRef('character', characterId, 'Ari Quill'),
			fields: [],
			links: [],
			duplicateCandidates: [],
			evidence: [{ kind: 'exact_key', label: 'Exact duplicate.', score: 1 }],
			reason: 'No canon mutation needed.',
		};
		seedProposal(database, { canonDiff: noopDiff });

		const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID, database);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.proposal.acceptance?.projectionTarget).toBe('no_op');
		expect(result.proposal.acceptance?.projectedToCanon).toBe(false);
		expect(readCharacter(database).updatedAt).toBe(NOW);
	});

	it('rolls back unsupported protected field updates and keeps proposal pending', () => {
		const characterId = seedCharacter(database);
		const badDiff: WorldbuildCanonDiff = {
			diffId: 'diff-bad',
			proposalId: PROPOSAL_ID,
			projectId: PROJECT_ID,
			categoryId: 'personae',
			entityKind: 'character',
			family: 'character',
			generatedAt: NOW,
			summary: 'Attempt to rewrite a protected id.',
			confidence: 0.8,
			decision: 'update',
			target: targetRef('character', characterId, 'Ari Quill'),
			fields: [
				{
					fieldPath: 'id',
					valueType: 'string',
					operation: 'replace',
					before: characterId,
					after: 'other-character',
					evidence: [],
				},
			],
			links: [],
			duplicateCandidates: [],
			evidence: [],
		};
		seedProposal(database, { canonDiff: badDiff });

		const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID, database);

		expect(result.ok).toBe(false);
		expect(readCharacter(database).id).toBe(characterId);
		expect(proposalStatus(database)).toBe('pending_review');
	});
});
