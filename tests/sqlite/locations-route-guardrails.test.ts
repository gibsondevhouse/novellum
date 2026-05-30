import { beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';

let testDb: Database.Database;

vi.mock('$lib/server/db/index.js', () => ({
	get db() {
		return testDb;
	},
	encodeJson(value: unknown) {
		return JSON.stringify(value ?? []);
	},
	decodeJson<T>(value: string | null | undefined): T {
		if (!value) return JSON.parse('[]') as T;
		return JSON.parse(value) as T;
	},
}));

function createDb() {
	const db = new Database(':memory:');
	db.exec(`
		CREATE TABLE locations (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			name TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			tags TEXT NOT NULL DEFAULT '[]',
			kind TEXT NOT NULL DEFAULT '',
			realmType TEXT NOT NULL DEFAULT '',
			realityRules TEXT NOT NULL DEFAULT '',
			culturalBaseline TEXT NOT NULL DEFAULT '',
			powerStructure TEXT NOT NULL DEFAULT '',
			conflictPressure TEXT NOT NULL DEFAULT '',
			storyRole TEXT NOT NULL DEFAULT '',
			tone TEXT NOT NULL DEFAULT '',
			realmId TEXT NOT NULL DEFAULT '',
			environment TEXT NOT NULL DEFAULT '',
			notableFeatures TEXT NOT NULL DEFAULT '[]',
			purpose TEXT NOT NULL DEFAULT '',
			activityType TEXT NOT NULL DEFAULT '',
			emotionalTone TEXT NOT NULL DEFAULT '',
			changeOverTime TEXT NOT NULL DEFAULT '',
			landmarkIds TEXT NOT NULL DEFAULT '[]',
			factionIds TEXT NOT NULL DEFAULT '[]',
			characterIds TEXT NOT NULL DEFAULT '[]',
			threadIds TEXT NOT NULL DEFAULT '[]',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);
	`);
	return db;
}

describe('locations route guardrails', () => {
	beforeEach(() => {
		testDb = createDb();
		vi.resetModules();
	});

	it('accepts generated landmarks without a realmId', async () => {
		const { POST } = await import('../../src/routes/api/db/locations/+server.js');
		const request = new Request('http://localhost/api/db/locations', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				name: 'Floating Shrine',
				description: 'Suspended above a faultline.',
				kind: 'landmark',
				tags: ['sacred', 'unstable'],
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(201);
		const payload = (await response.json()) as { kind: string; realmId: string; tags: string[] };
		expect(payload.kind).toBe('landmark');
		expect(payload.realmId).toBe('');
		expect(payload.tags).toEqual(['sacred', 'unstable']);
	});

	it('accepts generated realms without an explicit realmType', async () => {
		const { POST } = await import('../../src/routes/api/db/locations/+server.js');
		const request = new Request('http://localhost/api/db/locations', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				name: 'Shattered Basin',
				description: 'A frontier basin with competing city-states.',
				kind: 'realm',
				tags: ['frontier'],
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(201);
		const payload = (await response.json()) as { kind: string; realmType: string };
		expect(payload.kind).toBe('realm');
		expect(payload.realmType).toBe('');
	});
});
