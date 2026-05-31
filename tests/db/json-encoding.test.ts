import { beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import { encodeJson, decodeJson } from '$lib/server/db/serialize.js';
import { joinCommaSeparated } from '$modules/world-building/narrative-locations.js';

let testDb: Database.Database;

vi.mock('$lib/server/db/index.js', () => ({
	get db() {
		return testDb;
	},
	encodeJson(value: unknown) {
		if (value == null) return '[]';
		return JSON.stringify(value);
	},
	decodeJson<T>(value: string | number | null | undefined): T {
		if (!value) return JSON.parse('[]') as T;
		return JSON.parse(String(value)) as T;
	},
}));

function createDb() {
	const db = new Database(':memory:');
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');
	db.exec(SCHEMA_SQL);
	db.exec(INDEX_SQL);
	return db;
}

function jsonRequest(url: string, body: Record<string, unknown>): Request {
	return new Request(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

describe('json encoding regression coverage', () => {
	beforeEach(() => {
		testDb = createDb();
		vi.resetModules();
	});

	describe('joinCommaSeparated guards', () => {
		it('returns empty string for accidentally stringified input', () => {
			expect(joinCommaSeparated('["tag"]' as unknown as string[])).toBe('');
		});

		it('returns empty string for undefined input', () => {
			expect(joinCommaSeparated(undefined)).toBe('');
		});

		it('joins arrays normally', () => {
			expect(joinCommaSeparated(['north', 'river'])).toBe('north, river');
		});
	});

	describe('serialize edge cases', () => {
		it('round-trips arrays with encodeJson/decodeJson', () => {
			const encoded = encodeJson(['a', 'b']);
			expect(decodeJson<string[]>(encoded)).toEqual(['a', 'b']);
		});

		it('documents that decodeJson parses double-encoded values to inner strings', () => {
			const doubleEncoded = JSON.stringify(JSON.stringify(['ghost']));
			expect(decodeJson<string>(doubleEncoded)).toBe('["ghost"]');
		});
	});

	describe('route-level round-trips', () => {
		it('POST + GET locations with array tags returns arrays', async () => {
			const { POST, GET } = await import('../../src/routes/api/db/locations/+server.js');
			const post = await POST(
				{
					request: jsonRequest('http://localhost/api/db/locations', {
						projectId: 'proj-1',
						name: 'Sunken Ward',
						description: 'A flooded district.',
						kind: 'realm',
						tags: ['flooded', 'ancient'],
					}),
				} as never,
			);

			expect(post.status).toBe(201);
			const created = (await post.json()) as { tags: string[] };
			expect(created.tags).toEqual(['flooded', 'ancient']);

			const get = await GET({
				url: new URL('http://localhost/api/db/locations?projectId=proj-1'),
			} as never);
			expect(get.status).toBe(200);
			const rows = (await get.json()) as Array<{ tags: string[] }>;
			expect(rows).toHaveLength(1);
			expect(rows[0].tags).toEqual(['flooded', 'ancient']);
		});

		it('POST locations with pre-stringified tags avoids double-encoding', async () => {
			const { POST } = await import('../../src/routes/api/db/locations/+server.js');
			const post = await POST(
				{
					request: jsonRequest('http://localhost/api/db/locations', {
						projectId: 'proj-1',
						name: 'Vault of Echoes',
						kind: 'realm',
						tags: JSON.stringify(['arcane']),
					}),
				} as never,
			);

			expect(post.status).toBe(201);
			const created = (await post.json()) as { id: string; tags: string[] };
			expect(created.tags).toEqual(['arcane']);

			const row = testDb
				.prepare('SELECT tags FROM locations WHERE id = ?')
				.get(created.id) as { tags: string };
			expect(row.tags).toBe('["arcane"]');
		});

		it('POST characters with pre-stringified traits avoids double-encoding', async () => {
			const { POST } = await import('../../src/routes/api/db/characters/+server.js');
			const post = await POST(
				{
					request: jsonRequest('http://localhost/api/db/characters', {
						projectId: 'proj-1',
						name: 'Mara Vale',
						traits: JSON.stringify(['patient', 'analytical']),
					}),
				} as never,
			);

			expect(post.status).toBe(201);
			const created = (await post.json()) as { id: string; traits: string[] };
			expect(created.traits).toEqual(['patient', 'analytical']);

			const row = testDb
				.prepare('SELECT traits FROM characters WHERE id = ?')
				.get(created.id) as { traits: string };
			expect(row.traits).toBe('["patient","analytical"]');
		});
	});
});
