import { describe, it, expect, beforeEach, vi } from 'vitest';

const apiGetMock = vi.fn();
const apiPostMock = vi.fn();

vi.mock('$lib/api-client.js', () => ({
	apiGet: (...args: unknown[]) => apiGetMock(...args),
	apiPost: (...args: unknown[]) => apiPostMock(...args),
	apiPut: vi.fn(),
	apiDel: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	},
}));

const prefStore = new Map<string, unknown>();
vi.mock('$lib/preferences.js', () => ({
	getPreference: vi.fn(async <T,>(key: string, def: T) => (prefStore.has(key) ? (prefStore.get(key) as T) : def)),
	setPreference: vi.fn(async <T,>(key: string, value: T) => {
		prefStore.set(key, value);
	}),
}));

import { db, resetDb } from '$lib/legacy/dexie/db';
import { migrate, isMigrationComplete, MIGRATION_COMPLETE_KEY } from '$lib/migration/index.js';

describe('Dexie → SQLite migration engine', () => {
	beforeEach(async () => {
		await resetDb();
		apiGetMock.mockReset();
		apiPostMock.mockReset();
		prefStore.clear();
		// Default: SQLite is empty for every list query.
		apiGetMock.mockResolvedValue([]);
		apiPostMock.mockResolvedValue({});
	});

	async function seedAcceptanceProject() {
		const now = '2026-04-10T00:00:00.000Z';
		await db.projects.add({
			id: 'p-acc',
			title: 'Acceptance Novel',
			genre: 'SF',
			logline: 'l',
			synopsis: 's',
			targetWordCount: 50000,
			systemPrompt: '',
			negativePrompt: '',
			status: 'draft',
			projectType: 'novel' as const,
			stylePresetId: '',
			lastOpenedAt: now,
			createdAt: now,
			updatedAt: now,
		});
		await db.arcs.add({
			id: 'arc-acc',
			projectId: 'p-acc',
			title: 'Main Arc',
			description: '',
			purpose: '',
			order: 0,
			createdAt: now,
			updatedAt: now,
		});
		await db.acts.add({
			id: 'act-acc',
			projectId: 'p-acc',
			title: 'Act I',
			order: 0,
			planningNotes: '',
			createdAt: now,
			updatedAt: now,
		});
		await db.chapters.add({
			id: 'ch-acc',
			projectId: 'p-acc',
			title: 'Chapter 1',
			order: 0,
			summary: '',
			wordCount: 1000,
			arcRefs: [],
			createdAt: now,
			updatedAt: now,
		});
		await db.scenes.add({
			id: 'sc-acc',
			chapterId: 'ch-acc',
			projectId: 'p-acc',
			title: 'Opening',
			summary: '',
			povCharacterId: 'char-acc',
			locationId: null,
			timelineEventId: null,
			order: 0,
			content: 'x'.repeat(1000),
			wordCount: 1000,
			notes: '',
			characterIds: ['char-acc'],
			locationIds: ['loc-acc'],
			arcRefs: [],
			createdAt: now,
			updatedAt: now,
		});
		await db.characters.add({
			id: 'char-acc',
			projectId: 'p-acc',
			name: 'Hero',
			role: 'protagonist',
			pronunciation: '',
			aliases: [],
			diasporaOrigin: '',
			photoUrl: '',
			bio: '',
			faction: '',
			anomalies: [],
			traits: [],
			goals: [],
			flaws: [],
			arcs: [],
			notes: '',
			tags: [],
			createdAt: now,
			updatedAt: now,
		});
		await db.locations.add({
			id: 'loc-acc',
			projectId: 'p-acc',
			name: 'Castle',
			description: '',
			tags: [],
			createdAt: now,
			updatedAt: now,
		});
		await db.lore_entries.add({
			id: 'lore-acc',
			projectId: 'p-acc',
			title: 'Magic Rules',
			content: '',
			tags: [],
			createdAt: now,
			updatedAt: now,
		});
	}

	it('migrates every project-owned table to /api/db/* (acceptance scenario)', async () => {
		await seedAcceptanceProject();
		const result = await migrate();

		expect(result.alreadyComplete).toBe(false);
		expect(result.errors).toEqual([]);
		// 8 entities seeded — all should POST.
		expect(result.rowsMigrated).toBeGreaterThanOrEqual(8);
		expect(apiPostMock).toHaveBeenCalledWith('/api/db/projects', expect.objectContaining({ id: 'p-acc' }));
		expect(apiPostMock).toHaveBeenCalledWith('/api/db/scenes', expect.objectContaining({ id: 'sc-acc' }));
		expect(apiPostMock).toHaveBeenCalledWith(
			'/api/db/characters',
			expect.objectContaining({ id: 'char-acc' }),
		);

		expect(prefStore.get(MIGRATION_COMPLETE_KEY)).toBeTruthy();
		expect(await isMigrationComplete()).toBe(true);
	});

	it('is idempotent: running twice does not duplicate rows', async () => {
		await seedAcceptanceProject();
		await migrate();
		const callsAfterFirst = apiPostMock.mock.calls.length;

		// Second run should short-circuit on the marker.
		const second = await migrate();
		expect(second.alreadyComplete).toBe(true);
		expect(second.rowsMigrated).toBe(0);
		expect(apiPostMock.mock.calls.length).toBe(callsAfterFirst);
	});

	it('skips rows that already exist in SQLite', async () => {
		await seedAcceptanceProject();
		// Pretend the project already exists in SQLite.
		apiGetMock.mockImplementation(async (path: string) =>
			path === '/api/db/projects' ? [{ id: 'p-acc' }] : [],
		);

		const result = await migrate();
		expect(result.skipped).toBeGreaterThanOrEqual(1);
		expect(
			apiPostMock.mock.calls.find(
				([path, payload]) =>
					path === '/api/db/projects' && (payload as { id: string }).id === 'p-acc',
			),
		).toBeUndefined();
	});
});
