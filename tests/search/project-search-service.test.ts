import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';
import {
	indexScene,
	indexCharacter,
	indexLore,
} from '$lib/server/search/project-search-index.js';
import { searchProject, searchProjectKind } from '$lib/server/search/project-search-service.js';

function freshDb(): Database.Database {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	return db;
}

describe('project-search-service', () => {
	let db: Database.Database;

	beforeEach(() => {
		db = freshDb();
		// Project A fixtures
		indexScene(
			{ projectId: 'proj-A', entityId: 's1', title: 'The Awakening', content: 'The dragon woke from slumber.' },
			{ db },
		);
		indexScene(
			{ projectId: 'proj-A', entityId: 's2', title: 'The Flight', content: 'The dragon flew over mountains.' },
			{ db },
		);
		indexCharacter(
			{ projectId: 'proj-A', entityId: 'c1', name: 'Kira', bio: 'A dragon rider from the north.', notes: '' },
			{ db },
		);
		indexLore(
			{ projectId: 'proj-A', entityId: 'l1', title: 'Dragon Lore', content: 'Dragons are ancient beings.' },
			{ db },
		);

		// Project B fixtures — must not appear in proj-A searches
		indexScene(
			{ projectId: 'proj-B', entityId: 's3', title: 'The Dragon King', content: 'A dragon sat on the throne.' },
			{ db },
		);
	});

	describe('searchProject', () => {
		it('returns results matching the query', () => {
			const hits = searchProject('proj-A', 'dragon', { db });
			expect(hits.length).toBeGreaterThan(0);
			const entityIds = hits.map((h) => h.entityId);
			expect(entityIds).toContain('s1');
			expect(entityIds).toContain('s2');
		});

		it('enforces project isolation', () => {
			const hits = searchProject('proj-A', 'dragon', { db });
			const entityIds = hits.map((h) => h.entityId);
			expect(entityIds).not.toContain('s3'); // proj-B scene must not appear
		});

		it('returns results from multiple entity kinds', () => {
			const hits = searchProject('proj-A', 'dragon', { db });
			const kinds = new Set(hits.map((h) => h.kind));
			// scenes, characters, and lore all mention 'dragon'
			expect(kinds.has('scene')).toBe(true);
			expect(kinds.has('character')).toBe(true);
			expect(kinds.has('lore')).toBe(true);
		});

		it('returns empty array for empty query', () => {
			const hits = searchProject('proj-A', '', { db });
			expect(hits).toEqual([]);
		});

		it('returns empty array when no matches exist', () => {
			const hits = searchProject('proj-A', 'zzznomatchxxx', { db });
			expect(hits).toEqual([]);
		});

		it('respects limitPerKind', () => {
			const hits = searchProject('proj-A', 'dragon', { db, limitPerKind: 1 });
			// At most 1 result per kind
			const countByKind = new Map<string, number>();
			for (const h of hits) {
				countByKind.set(h.kind, (countByKind.get(h.kind) ?? 0) + 1);
			}
			for (const count of countByKind.values()) {
				expect(count).toBeLessThanOrEqual(1);
			}
		});

		it('filters to specified kinds only', () => {
			const hits = searchProject('proj-A', 'dragon', { db, kinds: ['character'] });
			for (const h of hits) {
				expect(h.kind).toBe('character');
			}
		});

		it('hits are sorted by bm25Score ascending (most relevant first)', () => {
			const hits = searchProject('proj-A', 'dragon', { db });
			for (let i = 1; i < hits.length; i++) {
				expect(hits[i].bm25Score).toBeGreaterThanOrEqual(hits[i - 1].bm25Score);
			}
		});
	});

	describe('searchProjectKind', () => {
		it('returns hits for the specified kind', () => {
			const hits = searchProjectKind('proj-A', 'dragon', 'scene', { db });
			expect(hits.length).toBeGreaterThan(0);
			for (const h of hits) {
				expect(h.kind).toBe('scene');
			}
		});

		it('returns empty array for empty query', () => {
			const hits = searchProjectKind('proj-A', '', 'scene', { db });
			expect(hits).toEqual([]);
		});
	});
});
