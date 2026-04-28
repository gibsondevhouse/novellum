import { beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';

let testDb: Database.Database;

vi.mock('$lib/server/db/index.js', () => ({
	get db() {
		return testDb;
	},
}));

function createDb() {
	const db = new Database(':memory:');
	db.exec(`
		CREATE TABLE character_relationships (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			characterAId TEXT NOT NULL,
			characterBId TEXT NOT NULL,
			type TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT '',
			description TEXT NOT NULL DEFAULT '',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);
	`);
	return db;
}

describe('character_relationships POST guardrails', () => {
	beforeEach(() => {
		testDb = createDb();
		vi.resetModules();
	});

	it('rejects self relationships', async () => {
		const { POST } = await import('../../src/routes/api/db/character_relationships/+server.js');
		const request = new Request('http://localhost/api/db/character_relationships', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				characterAId: 'char-1',
				characterBId: 'char-1',
				type: 'Ally',
				status: 'Stable',
				description: 'Invalid self link',
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			error: 'A character cannot be related to themselves',
		});
	});

	it('stores canonical pair ordering regardless of input direction', async () => {
		const { POST } = await import('../../src/routes/api/db/character_relationships/+server.js');
		const request = new Request('http://localhost/api/db/character_relationships', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				characterAId: 'char-z',
				characterBId: 'char-a',
				type: 'Rival',
				status: 'Volatile',
				description: 'Order should normalize',
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(201);

		const row = testDb
			.prepare(
				'SELECT characterAId, characterBId, type, status, description FROM character_relationships WHERE projectId = ?',
			)
			.get('proj-1') as {
				characterAId: string;
				characterBId: string;
				type: string;
				status: string;
				description: string;
			};

		expect(row.characterAId).toBe('char-a');
		expect(row.characterBId).toBe('char-z');
		expect(row.type).toBe('Rival');
		expect(row.status).toBe('Volatile');
		expect(row.description).toBe('Order should normalize');
	});

	it('rejects duplicates even when submitted in reversed direction', async () => {
		const { POST } = await import('../../src/routes/api/db/character_relationships/+server.js');

		testDb.prepare(
			`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, status, description, createdAt, updatedAt)
			 VALUES ('rel-1', 'proj-1', 'char-a', 'char-b', 'Ally', 'Stable', 'Existing', @createdAt, @updatedAt)`,
		).run({
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const request = new Request('http://localhost/api/db/character_relationships', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				characterAId: 'char-b',
				characterBId: 'char-a',
				type: 'Ally',
				status: 'Stable',
				description: 'Duplicate in reverse',
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(409);
		await expect(response.json()).resolves.toEqual({ error: 'Relationship already exists' });

		const count = testDb
			.prepare('SELECT COUNT(*) as c FROM character_relationships WHERE projectId = ?')
			.get('proj-1') as { c: number };
		expect(Number(count.c)).toBe(1);
	});

	it('supports retarget persistence by creating new pair then deleting previous pair', async () => {
		const { POST } = await import('../../src/routes/api/db/character_relationships/+server.js');
		const { DELETE } = await import('../../src/routes/api/db/character_relationships/[id]/+server.js');

		testDb
			.prepare(
				`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, status, description, createdAt, updatedAt)
				 VALUES ('rel-old', 'proj-1', 'char-a', 'char-b', 'Ally', 'Stable', 'Previous target', @createdAt, @updatedAt)`,
			)
			.run({
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});

		const createNewRequest = new Request('http://localhost/api/db/character_relationships', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				characterAId: 'char-c',
				characterBId: 'char-a',
				type: 'Ally',
				status: 'Tense',
				description: 'Retargeted to character C',
			}),
		});

		const createResponse = await POST({ request: createNewRequest } as never);
		expect(createResponse.status).toBe(201);

		const deleteOldResponse = await DELETE({ params: { id: 'rel-old' } } as never);
		expect(deleteOldResponse.status).toBe(204);

		const remaining = testDb
			.prepare(
				'SELECT projectId, characterAId, characterBId, type, status, description FROM character_relationships WHERE projectId = ? ORDER BY createdAt ASC',
			)
			.all('proj-1') as Array<{
				projectId: string;
				characterAId: string;
				characterBId: string;
				type: string;
				status: string;
				description: string;
			}>;

		expect(remaining).toHaveLength(1);
		expect(remaining[0]).toEqual({
			projectId: 'proj-1',
			characterAId: 'char-a',
			characterBId: 'char-c',
			type: 'Ally',
			status: 'Tense',
			description: 'Retargeted to character C',
		});
	});
});
