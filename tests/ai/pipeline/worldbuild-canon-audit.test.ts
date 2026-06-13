import { beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import {
	acceptProposalAtomically,
	rejectProposalAtomically,
} from '$lib/ai/pipeline/checkpoint-service.js';
import { WORLDBUILD_PROPOSAL_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';
import type { WorldbuildCanonDiff } from '$lib/ai/pipeline/worldbuild-canon-diff-schema.js';
import type { WorldbuildProposalRecord } from '$lib/ai/pipeline/worldbuild-proposal-schema.js';

const PROJECT_ID = 'project-canon-audit';
const PROPOSAL_ID = 'proposal-canon-audit';
const NOW = '2026-06-12T18:30:00.000Z';

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
			title: 'Canon Audit Test',
			createdAt: NOW,
			updatedAt: NOW,
		});
}

function seedCharacter(database: Database.Database): string {
	const id = 'character-audit-1';
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
			traits: '[]',
			tags: '[]',
			createdAt: NOW,
			updatedAt: NOW,
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
			title: 'Canon Audit Test',
			genre: 'fantasy',
			logline: 'A courier outruns a civil war.',
			synopsisHash: 'abc12345',
		},
		confidence: 0.8,
		reasoningSummary: 'Audit proposal.',
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

function storedProposal(database: Database.Database): WorldbuildProposalRecord {
	const row = database
		.prepare(
			`SELECT value FROM project_metadata
			 WHERE projectId = ? AND scope = 'pipeline' AND ownerId = ? AND key = ?`,
		)
		.get(PROJECT_ID, WORLDBUILD_PROPOSAL_OWNER_ID, PROPOSAL_ID) as { value: string };
	return JSON.parse(row.value) as WorldbuildProposalRecord;
}

function targetRef(family: 'character', id: string, displayName: string) {
	return {
		family,
		id,
		displayName,
		table: 'characters',
		projectId: PROJECT_ID,
	};
}

describe('worldbuild proposal canon audit metadata', () => {
	let database: Database.Database;

	beforeEach(() => {
		database = createTestDb();
		seedProject(database);
	});

	it('records accepted canon diff target and changed-field metadata', () => {
		const characterId = seedCharacter(database);
		const diff: WorldbuildCanonDiff = {
			diffId: 'diff-audit-update',
			proposalId: PROPOSAL_ID,
			projectId: PROJECT_ID,
			categoryId: 'personae',
			entityKind: 'character',
			family: 'character',
			generatedAt: NOW,
			summary: 'Fill character desire.',
			confidence: 0.9,
			decision: 'update',
			target: targetRef('character', characterId, 'Ari Quill'),
			fields: [
				{
					fieldPath: 'coreDesire',
					label: 'Core desire',
					valueType: 'string',
					operation: 'add',
					before: '',
					after: 'Recover the ledger.',
					evidence: [{ kind: 'empty_field', label: 'Core desire is empty.', score: 1 }],
				},
			],
			links: [],
			duplicateCandidates: [],
			evidence: [{ kind: 'manual_review', label: 'Reviewer-visible update.', score: 1 }],
		};
		seedProposal(database, { canonDiff: diff });

		const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID, database);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.proposal.acceptance?.audit).toMatchObject({
			projectionMode: 'canon_diff',
			decision: 'update',
			diffId: 'diff-audit-update',
			family: 'character',
			targetId: characterId,
			target: { id: characterId, displayName: 'Ari Quill' },
			duplicateCandidateCount: 0,
			evidenceCount: 2,
			summary: 'Fill character desire.',
		});
		expect(result.proposal.acceptance?.audit?.changedFields).toEqual([
			{
				fieldPath: 'coreDesire',
				label: 'Core desire',
				operation: 'add',
				valueType: 'string',
				evidenceCount: 1,
			},
		]);
		expect(storedProposal(database).acceptance?.audit?.targetId).toBe(characterId);
	});

	it('records rejected diff evidence without dropping the proposal diff', () => {
		const characterId = seedCharacter(database);
		const diff: WorldbuildCanonDiff = {
			diffId: 'diff-audit-merge',
			proposalId: PROPOSAL_ID,
			projectId: PROJECT_ID,
			categoryId: 'personae',
			entityKind: 'character',
			family: 'character',
			generatedAt: NOW,
			summary: 'Merge duplicate character detail.',
			confidence: 0.86,
			decision: 'merge',
			target: targetRef('character', characterId, 'Ari Quill'),
			fields: [
				{
					fieldPath: 'traits',
					valueType: 'array',
					operation: 'append',
					before: [],
					after: ['restless'],
					evidence: [],
				},
			],
			links: [],
			duplicateCandidates: [
				{
					target: targetRef('character', characterId, 'Ari Quill'),
					matchKind: 'exact_name',
					score: 1,
					evidence: [{ kind: 'exact_name', label: 'Exact normalized name.', score: 1 }],
				},
			],
			evidence: [{ kind: 'manual_review', label: 'Needs author decision.', score: 0.8 }],
		};
		seedProposal(database, { canonDiff: diff });

		const result = rejectProposalAtomically(
			PROJECT_ID,
			PROPOSAL_ID,
			{ rejectedBy: 'author', reason: 'Conflicts with established canon.' },
			database,
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.proposal.rejection).toMatchObject({
			rejectedBy: 'author',
			reason: 'Conflicts with established canon.',
			audit: {
				projectionMode: 'canon_diff',
				decision: 'merge',
				diffId: 'diff-audit-merge',
				targetId: characterId,
				duplicateCandidateCount: 1,
				evidenceCount: 2,
			},
		});
		expect(result.proposal.canonDiff).toMatchObject({ diffId: 'diff-audit-merge' });
		expect(storedProposal(database).rejection?.audit?.changedFields[0]?.fieldPath).toBe('traits');
	});

	it('records legacy projection audit metadata when proposals have no canon diff', () => {
		seedProposal(database);

		const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID, database);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.proposal.acceptance?.audit).toMatchObject({
			projectionMode: 'legacy_create_projection',
			decision: 'create',
			diffId: null,
			family: 'character',
			targetId: null,
			duplicateCandidateCount: 0,
			evidenceCount: 0,
		});
		expect(result.proposal.acceptance?.audit?.changedFields.map((field) => field.fieldPath)).toEqual([
			'name',
			'role',
			'bio',
		]);
	});
});
