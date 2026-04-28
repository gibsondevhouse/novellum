import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('$lib/server/db/index.js', () => {
	type Row = {
		projectId: string;
		scope: string;
		ownerId: string;
		key: string;
		value: string;
		updatedAt: string;
	};
	const store = new Map<string, Row>();
	function k(r: { projectId: string; scope: string; ownerId: string; key: string }) {
		return `${r.projectId}\u0000${r.scope}\u0000${r.ownerId}\u0000${r.key}`;
	}
	const db = {
		prepare(sql: string) {
			const t = sql.replace(/\s+/g, ' ').trim();
			return {
				get(p: { projectId: string; scope: string; ownerId: string; key: string }) {
					return store.get(k(p));
				},
				all(p: { projectId: string; scope: string; ownerId: string }) {
					return [...store.values()].filter(
						(r) => r.projectId === p.projectId && r.scope === p.scope && r.ownerId === p.ownerId,
					);
				},
				run(p: Row) {
					if (t.startsWith('INSERT INTO project_metadata')) {
						store.set(k(p), { ...p });
					} else if (t.startsWith('DELETE FROM project_metadata')) {
						store.delete(k(p));
					}
					return { changes: 1, lastInsertRowid: 0 };
				},
			};
		},
		__store: store,
	};
	return { db };
});

import {
	getProjectMetadata,
	setProjectMetadata,
	deleteProjectMetadata,
	listProjectMetadata,
} from '$lib/server/project-metadata/project-metadata-service.js';

describe('project-metadata-service', () => {
	beforeEach(async () => {
		const mod = (await import('$lib/server/db/index.js')) as unknown as {
			db: { __store: Map<string, unknown> };
		};
		mod.db.__store.clear();
	});

	it('returns undefined when missing', () => {
		expect(getProjectMetadata('p1', 'scene', 's1', 'clarity')).toBeUndefined();
	});

	it('round-trips a structured value', () => {
		const payload = { sceneGoal: 'win', linkedCharacterIds: ['c1', 'c2'] };
		setProjectMetadata('p1', 'scene', 's1', 'clarity', payload);
		expect(getProjectMetadata('p1', 'scene', 's1', 'clarity')).toEqual(payload);
	});

	it('overwrites within (project, scope, owner, key)', () => {
		setProjectMetadata('p1', 'scene', 's1', 'clarity', { v: 1 });
		setProjectMetadata('p1', 'scene', 's1', 'clarity', { v: 2 });
		expect(getProjectMetadata('p1', 'scene', 's1', 'clarity')).toEqual({ v: 2 });
	});

	it('isolates entries across scopes and owners', () => {
		setProjectMetadata('p1', 'scene', 's1', 'clarity', 'A');
		setProjectMetadata('p1', 'scene', 's2', 'clarity', 'B');
		setProjectMetadata('p1', 'chapter', 's1', 'clarity', 'C');
		expect(getProjectMetadata('p1', 'scene', 's1', 'clarity')).toBe('A');
		expect(getProjectMetadata('p1', 'scene', 's2', 'clarity')).toBe('B');
		expect(getProjectMetadata('p1', 'chapter', 's1', 'clarity')).toBe('C');
	});

	it('lists all keys for an owner', () => {
		setProjectMetadata('p1', 'scene', 's1', 'clarity', { a: 1 });
		setProjectMetadata('p1', 'scene', 's1', 'quickIntent', { b: 2 });
		setProjectMetadata('p1', 'scene', 's2', 'clarity', { c: 3 });
		const data = listProjectMetadata('p1', 'scene', 's1');
		expect(data).toEqual({ clarity: { a: 1 }, quickIntent: { b: 2 } });
	});

	it('deletes a key', () => {
		setProjectMetadata('p1', 'scene', 's1', 'clarity', 'x');
		deleteProjectMetadata('p1', 'scene', 's1', 'clarity');
		expect(getProjectMetadata('p1', 'scene', 's1', 'clarity')).toBeUndefined();
	});
});
