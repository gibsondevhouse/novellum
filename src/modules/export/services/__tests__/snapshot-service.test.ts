import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db, resetDb } from '$lib/db/index.js';
import {
	buildDexieSnapshot,
	buildKeyValueSnapshot,
	buildPortabilitySnapshot,
} from '../portability/snapshot-service.js';

/** Simple in-memory Storage polyfill for test environments where native localStorage is broken */
function createMockStorage(): Storage {
	const store = new Map<string, string>();
	return {
		get length() {
			return store.size;
		},
		key(index: number) {
			return [...store.keys()][index] ?? null;
		},
		getItem(key: string) {
			return store.get(key) ?? null;
		},
		setItem(key: string, value: string) {
			store.set(key, String(value));
		},
		removeItem(key: string) {
			store.delete(key);
		},
		clear() {
			store.clear();
		},
	};
}

describe('snapshot-service', () => {
	beforeEach(async () => {
		await resetDb();
	});

	describe('buildDexieSnapshot', () => {
		it('returns empty arrays for all tables when DB is empty', async () => {
			const snapshot = await buildDexieSnapshot('nonexistent');
			expect(Object.keys(snapshot).length).toBeGreaterThanOrEqual(16);
			for (const rows of Object.values(snapshot)) {
				expect(rows).toEqual([]);
			}
		});

		it('includes project and related entities', async () => {
			const projectId = 'snap-proj-1';
			await db.projects.add({
				id: projectId,
				title: 'Test',
				genre: 'Fantasy',
				logline: '',
				synopsis: '',
				targetWordCount: 50000,
			systemPrompt: '',
			negativePrompt: '',
				status: 'draft',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			await db.chapters.add({
				id: 'ch-1',
				projectId,
				title: 'Chapter 1',
				order: 1,
				summary: '',
				wordCount: 0,
				arcRefs: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});

			const snapshot = await buildDexieSnapshot(projectId);
			expect(snapshot.projects).toHaveLength(1);
			expect(snapshot.chapters).toHaveLength(1);
			expect(snapshot.scenes).toHaveLength(0);
		});

		it('does not include data from other projects', async () => {
			await db.projects.add({
				id: 'proj-a',
				title: 'A',
				genre: '',
				logline: '',
				synopsis: '',
				targetWordCount: 0,
			systemPrompt: '',
			negativePrompt: '',
				status: 'draft',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			await db.projects.add({
				id: 'proj-b',
				title: 'B',
				genre: '',
				logline: '',
				synopsis: '',
				targetWordCount: 0,
			systemPrompt: '',
			negativePrompt: '',
				status: 'draft',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			await db.chapters.add({
				id: 'ch-b',
				projectId: 'proj-b',
				title: 'Ch B',
				order: 1,
				summary: '',
				wordCount: 0,
				arcRefs: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});

			const snapshot = await buildDexieSnapshot('proj-a');
			expect(snapshot.projects).toHaveLength(1);
			expect((snapshot.projects[0] as Record<string, unknown>).id).toBe('proj-a');
			expect(snapshot.chapters).toHaveLength(0);
		});

		it('sorts rows by id for deterministic output', async () => {
			const projectId = 'snap-sort';
			await db.projects.add({
				id: projectId,
				title: 'Sort Test',
				genre: '',
				logline: '',
				synopsis: '',
				targetWordCount: 0,
			systemPrompt: '',
			negativePrompt: '',
				status: 'draft',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			await db.chapters.bulkAdd([
				{
					id: 'ch-z',
					projectId,
					title: 'Z',
					order: 2,
					summary: '',
					wordCount: 0,
					arcRefs: [],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
				{
					id: 'ch-a',
					projectId,
					title: 'A',
					order: 1,
					summary: '',
					wordCount: 0,
					arcRefs: [],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			]);

			const snapshot = await buildDexieSnapshot(projectId);
			expect((snapshot.chapters[0] as Record<string, unknown>).id).toBe('ch-a');
			expect((snapshot.chapters[1] as Record<string, unknown>).id).toBe('ch-z');
		});
	});

	describe('buildKeyValueSnapshot', () => {
		let mockStorage: Storage;

		beforeEach(() => {
			mockStorage = createMockStorage();
			vi.stubGlobal('localStorage', mockStorage);
		});

		it('includes allowed localStorage keys', () => {
			mockStorage.setItem('novellum:planning:test', 'value1');
			mockStorage.setItem('novellum:outliner:view', 'tree');
			mockStorage.setItem('unrelated-key', 'ignore');

			const snapshot = buildKeyValueSnapshot();
			expect(snapshot['novellum:planning:test']).toBe('value1');
			expect(snapshot['novellum:outliner:view']).toBe('tree');
			expect(snapshot['unrelated-key']).toBeUndefined();
		});

		it('excludes explicitly excluded keys', () => {
			mockStorage.setItem('novellum:planning:draft-form', 'temp');

			const snapshot = buildKeyValueSnapshot();
			expect(snapshot['novellum:planning:draft-form']).toBeUndefined();
		});

		it('returns empty object when no matching keys', () => {
			const snapshot = buildKeyValueSnapshot();
			// Only check that no unexpected keys leak in
			for (const key of Object.keys(snapshot)) {
				expect(key).toMatch(/^novellum:/);
			}
		});
	});

	describe('buildPortabilitySnapshot', () => {
		it('returns dexie, kv, and tableCounts', async () => {
			const snapshot = await buildPortabilitySnapshot('empty-proj');
			expect(snapshot).toHaveProperty('dexie');
			expect(snapshot).toHaveProperty('kv');
			expect(snapshot).toHaveProperty('tableCounts');
			expect(typeof snapshot.tableCounts.projects).toBe('number');
		});
	});
});
