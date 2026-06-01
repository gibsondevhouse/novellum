import { beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';

let testDb: Database.Database;

vi.mock('$lib/server/db/index.js', () => ({
	get db() {
		return testDb;
	},
	encodeJson(val: unknown): string {
		if (val == null) return '[]';
		return JSON.stringify(val);
	},
}));

const PROJECT_ID = 'proj-safety-001';
const PROPOSAL_ID = 'prop-safety-001';

const CANON_TABLE_FOR: Record<string, string> = {
	personae: 'characters',
	atlas: 'locations',
	archive: 'lore_entries',
	threads: 'plot_threads',
	chronicles: 'timeline_events',
};

function createTestDb(): Database.Database {
	const database = new Database(':memory:');
	database.exec(`
		CREATE TABLE project_metadata (
			projectId TEXT NOT NULL,
			scope TEXT NOT NULL,
			ownerId TEXT NOT NULL,
			key TEXT NOT NULL,
			value TEXT NOT NULL,
			updatedAt TEXT NOT NULL,
			PRIMARY KEY (projectId, scope, ownerId, key)
		);
		CREATE TABLE characters (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			name TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT '',
			bio TEXT NOT NULL DEFAULT '',
			faction TEXT NOT NULL DEFAULT '',
			factionId TEXT,
			traits TEXT NOT NULL DEFAULT '[]',
			goals TEXT NOT NULL DEFAULT '[]',
			flaws TEXT NOT NULL DEFAULT '[]',
			notes TEXT NOT NULL DEFAULT '',
			tags TEXT NOT NULL DEFAULT '[]',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);
		CREATE TABLE locations (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			name TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			tags TEXT NOT NULL DEFAULT '[]',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);
		CREATE TABLE lore_entries (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			title TEXT NOT NULL,
			category TEXT NOT NULL DEFAULT '',
			content TEXT NOT NULL DEFAULT '',
			tags TEXT NOT NULL DEFAULT '[]',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);
		CREATE TABLE plot_threads (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT '',
			relatedSceneIds TEXT NOT NULL DEFAULT '[]',
			relatedCharacterIds TEXT NOT NULL DEFAULT '[]',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);
		CREATE TABLE timeline_events (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			date TEXT NOT NULL DEFAULT '',
			relatedCharacterIds TEXT NOT NULL DEFAULT '[]',
			relatedSceneIds TEXT NOT NULL DEFAULT '[]',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);
	`);
	return database;
}

function rowCount(database: Database.Database, table: string, projectId: string): number {
	const row = database
		.prepare(`SELECT COUNT(*) as n FROM ${table} WHERE projectId = ?`)
		.get(projectId) as { n: number };
	return row.n;
}

function getProposalStatus(database: Database.Database): string {
	const row = database
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get(PROJECT_ID, 'pipeline', 'vibe-worldbuild-scan', PROPOSAL_ID) as
		| { value: string }
		| undefined;
	if (!row) return 'not_found';
	return (JSON.parse(row.value) as { status: string }).status;
}

function seedProposal(
	database: Database.Database,
	overrides: Partial<Record<string, unknown>> = {},
	proposalId = PROPOSAL_ID,
): void {
	const now = new Date().toISOString();
	const proposal: Record<string, unknown> = {
		proposalId,
		projectId: PROJECT_ID,
		categoryId: 'personae',
		entityKind: 'character',
		status: 'pending_review',
		generatedAt: now,
		sourceContext: {
			title: 'Test Novel',
			genre: 'fantasy',
			logline: 'A test story.',
			synopsisHash: 'abc12345',
		},
		confidence: 0.8,
		reasoningSummary: 'Test suggestion.',
		payload: { name: 'Elara Voss', role: 'protagonist', bio: 'A courier.' },
		dedupeKey: 'personae:character:elara voss',
		acceptance: null,
		rejection: null,
		...overrides,
	};
	database
		.prepare(
			`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
			 VALUES (?, ?, ?, ?, ?, ?)`,
		)
		.run(PROJECT_ID, 'pipeline', 'vibe-worldbuild-scan', proposalId, JSON.stringify(proposal), now);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('worldbuild proposal canon safety', () => {
	beforeEach(() => {
		testDb = createTestDb();
		vi.resetModules();
	});

	describe('pre-accept: no canon writes for pending proposals', () => {
		it('characters table is empty when proposal is pending_review', () => {
			seedProposal(testDb);
			expect(rowCount(testDb, 'characters', PROJECT_ID)).toBe(0);
		});

		it('all canon tables are empty when a proposal is pending_review', () => {
			seedProposal(testDb); // one pending personae proposal
			for (const table of Object.values(CANON_TABLE_FOR)) {
				expect(rowCount(testDb, table, PROJECT_ID)).toBe(0);
			}
		});
	});

	describe('successful accept: atomically writes entity and marks accepted', () => {
		it('writes character to canon and sets projectedToCanon: true for personae', async () => {
			seedProposal(testDb);
			const { acceptProposalAtomically } = await import(
				'../../src/lib/ai/pipeline/checkpoint-service.js'
			);

			const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID);

			expect(result.ok).toBe(true);
			if (!result.ok) return;
			expect(result.proposal.status).toBe('accepted');
			expect(result.proposal.acceptance?.projectedToCanon).toBe(true);
			expect(result.proposal.acceptance?.projectionTarget).toBe('personae');

			const chars = testDb
				.prepare('SELECT name FROM characters WHERE projectId = ?')
				.all(PROJECT_ID) as Array<{ name: string }>;
			expect(chars).toHaveLength(1);
			expect(chars[0].name).toBe('Elara Voss');
		});

		it('writes location to canon for atlas category', async () => {
			seedProposal(testDb, {
				categoryId: 'atlas',
				entityKind: 'location',
				payload: { name: 'The Dustmarket', description: 'A trade hub.' },
				dedupeKey: 'atlas:location:the dustmarket',
			});
			const { acceptProposalAtomically } = await import(
				'../../src/lib/ai/pipeline/checkpoint-service.js'
			);

			const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID);

			expect(result.ok).toBe(true);
			const locs = testDb
				.prepare('SELECT name FROM locations WHERE projectId = ?')
				.all(PROJECT_ID) as Array<{ name: string }>;
			expect(locs).toHaveLength(1);
			expect(locs[0].name).toBe('The Dustmarket');
		});

		it('writes lore entry to canon for archive category', async () => {
			seedProposal(testDb, {
				categoryId: 'archive',
				entityKind: 'lore_entry',
				payload: { title: 'The Binding Accord', category: 'treaty', content: 'Historical pact.' },
				dedupeKey: 'archive:lore_entry:the binding accord',
			});
			const { acceptProposalAtomically } = await import(
				'../../src/lib/ai/pipeline/checkpoint-service.js'
			);

			const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID);

			expect(result.ok).toBe(true);
			const entries = testDb
				.prepare('SELECT title FROM lore_entries WHERE projectId = ?')
				.all(PROJECT_ID) as Array<{ title: string }>;
			expect(entries).toHaveLength(1);
			expect(entries[0].title).toBe('The Binding Accord');
		});

		it('writes plot thread to canon for threads category', async () => {
			seedProposal(testDb, {
				categoryId: 'threads',
				entityKind: 'plot_thread',
				payload: { title: 'The Missing Courier', description: 'A courier vanishes.', status: 'active' },
				dedupeKey: 'threads:plot_thread:the missing courier',
			});
			const { acceptProposalAtomically } = await import(
				'../../src/lib/ai/pipeline/checkpoint-service.js'
			);

			const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID);

			expect(result.ok).toBe(true);
			const threads = testDb
				.prepare('SELECT title FROM plot_threads WHERE projectId = ?')
				.all(PROJECT_ID) as Array<{ title: string }>;
			expect(threads).toHaveLength(1);
			expect(threads[0].title).toBe('The Missing Courier');
		});

		it('writes timeline event to canon for chronicles category', async () => {
			seedProposal(testDb, {
				categoryId: 'chronicles',
				entityKind: 'timeline_event',
				payload: { title: 'The Fall of Tal', date: 'Year 34', description: 'A dynasty collapses.' },
				dedupeKey: 'chronicles:timeline_event:the fall of tal',
			});
			const { acceptProposalAtomically } = await import(
				'../../src/lib/ai/pipeline/checkpoint-service.js'
			);

			const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID);

			expect(result.ok).toBe(true);
			const events = testDb
				.prepare('SELECT title FROM timeline_events WHERE projectId = ?')
				.all(PROJECT_ID) as Array<{ title: string }>;
			expect(events).toHaveLength(1);
			expect(events[0].title).toBe('The Fall of Tal');
		});
	});

	describe('rollback on failure: no partial canon writes', () => {
		it('leaves characters table empty when required name field is missing', async () => {
			seedProposal(testDb, { payload: { role: 'protagonist' } }); // no name
			const { acceptProposalAtomically } = await import(
				'../../src/lib/ai/pipeline/checkpoint-service.js'
			);

			const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID);

			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe('projection_failed');

			// Transaction rolled back — no partial write
			expect(rowCount(testDb, 'characters', PROJECT_ID)).toBe(0);
			// Proposal must remain pending_review
			expect(getProposalStatus(testDb)).toBe('pending_review');
		});

		it('leaves canon tables empty for unrecognized category', async () => {
			seedProposal(testDb, {
				categoryId: 'unknown-domain',
				payload: { name: 'Some Entity' },
			});
			const { acceptProposalAtomically } = await import(
				'../../src/lib/ai/pipeline/checkpoint-service.js'
			);

			const result = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID);

			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe('projection_failed');

			for (const table of Object.values(CANON_TABLE_FOR)) {
				expect(rowCount(testDb, table, PROJECT_ID)).toBe(0);
			}
			expect(getProposalStatus(testDb)).toBe('pending_review');
		});

		it('returns not_found for missing proposal and writes nothing', async () => {
			const { acceptProposalAtomically } = await import(
				'../../src/lib/ai/pipeline/checkpoint-service.js'
			);

			const result = acceptProposalAtomically(PROJECT_ID, 'nonexistent-prop');

			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe('not_found');

			for (const table of Object.values(CANON_TABLE_FOR)) {
				expect(rowCount(testDb, table, PROJECT_ID)).toBe(0);
			}
		});
	});

	describe('invalid transition: double-accept prevention', () => {
		it('second accept returns invalid_transition and does not duplicate the canon row', async () => {
			seedProposal(testDb);
			const { acceptProposalAtomically } = await import(
				'../../src/lib/ai/pipeline/checkpoint-service.js'
			);

			const first = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID);
			expect(first.ok).toBe(true);

			const second = acceptProposalAtomically(PROJECT_ID, PROPOSAL_ID);
			expect(second.ok).toBe(false);
			if (second.ok) return;
			expect(second.code).toBe('invalid_transition');

			// Exactly 1 canon row — not 2
			expect(rowCount(testDb, 'characters', PROJECT_ID)).toBe(1);
		});
	});
});
