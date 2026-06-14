import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';
import {
	indexScene,
	indexCharacter,
	indexLocation,
	indexLore,
	indexPlotThread,
	indexTimelineEvent,
	indexOutlineItem,
	indexArtifact,
	removeScene,
	removeCharacter,
	clearProjectSearchIndex,
} from '$lib/server/search/project-search-index.js';

function freshDb(): Database.Database {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	return db;
}

describe('project-search-index', () => {
	let db: Database.Database;

	beforeEach(() => {
		db = freshDb();
	});

	describe('indexScene / removeScene', () => {
		it('inserts an FTS row for a scene', () => {
			indexScene(
				{ projectId: 'p1', entityId: 's1', title: 'Prologue', content: 'A hero awakes.' },
				{ db },
			);
			const rows = db
				.prepare(
					`SELECT entityId FROM project_search_scenes WHERE project_search_scenes MATCH ?`,
				)
				.all('hero');
			expect(rows.length).toBe(1);
		});

		it('removeScene deletes the FTS row', () => {
			indexScene(
				{ projectId: 'p1', entityId: 's1', title: 'Prologue', content: 'A hero awakes.' },
				{ db },
			);
			removeScene('s1', { db });
			const rows = db
				.prepare(
					`SELECT entityId FROM project_search_scenes WHERE project_search_scenes MATCH ?`,
				)
				.all('hero');
			expect(rows.length).toBe(0);
		});

		it('is idempotent on repeated upserts', () => {
			indexScene({ projectId: 'p1', entityId: 's1', title: 'V1', content: 'first version' }, { db });
			indexScene({ projectId: 'p1', entityId: 's1', title: 'V2', content: 'second version updated' }, { db });
			const rows = db
				.prepare(
					`SELECT entityId FROM project_search_scenes WHERE project_search_scenes MATCH ?`,
				)
				.all('updated');
			expect(rows.length).toBe(1);
			const old = db
				.prepare(
					`SELECT entityId FROM project_search_scenes WHERE project_search_scenes MATCH ?`,
				)
				.all('first');
			expect(old.length).toBe(0);
		});
	});

	describe('indexCharacter / removeCharacter', () => {
		it('inserts an FTS row for a character', () => {
			indexCharacter(
				{ projectId: 'p1', entityId: 'c1', name: 'Lyria', bio: 'A wandering bard.', notes: '' },
				{ db },
			);
			const rows = db
				.prepare(
					`SELECT entityId FROM project_search_characters WHERE project_search_characters MATCH ?`,
				)
				.all('bard');
			expect(rows.length).toBe(1);
		});

		it('removeCharacter deletes the FTS row', () => {
			indexCharacter(
				{ projectId: 'p1', entityId: 'c1', name: 'Lyria', bio: 'A wandering bard.', notes: '' },
				{ db },
			);
			removeCharacter('c1', { db });
			const rows = db
				.prepare(
					`SELECT entityId FROM project_search_characters WHERE project_search_characters MATCH ?`,
				)
				.all('bard');
			expect(rows.length).toBe(0);
		});
	});

	describe('indexLocation', () => {
		it('inserts and can be retrieved', () => {
			indexLocation(
				{ projectId: 'p1', entityId: 'loc1', name: 'Castle Keep', description: 'A fortress.', notes: '' },
				{ db },
			);
			const rows = db
				.prepare(
					`SELECT entityId FROM project_search_locations WHERE project_search_locations MATCH ?`,
				)
				.all('fortress');
			expect(rows.length).toBe(1);
		});
	});

	describe('indexLore', () => {
		it('inserts and can be retrieved', () => {
			indexLore(
				{ projectId: 'p1', entityId: 'lore1', title: 'Old Magic', content: 'Forbidden spells.' },
				{ db },
			);
			const rows = db
				.prepare(`SELECT entityId FROM project_search_lore WHERE project_search_lore MATCH ?`)
				.all('spells');
			expect(rows.length).toBe(1);
		});
	});

	describe('indexPlotThread', () => {
		it('inserts and can be retrieved', () => {
			indexPlotThread(
				{ projectId: 'p1', entityId: 'pt1', title: 'The Prophecy', description: 'An ancient prophecy.' },
				{ db },
			);
			const rows = db
				.prepare(
					`SELECT entityId FROM project_search_plot_threads WHERE project_search_plot_threads MATCH ?`,
				)
				.all('prophecy');
			expect(rows.length).toBe(1);
		});
	});

	describe('indexTimelineEvent', () => {
		it('inserts and can be retrieved', () => {
			indexTimelineEvent(
				{ projectId: 'p1', entityId: 'te1', title: 'Great War', description: 'Decades of conflict.' },
				{ db },
			);
			const rows = db
				.prepare(
					`SELECT entityId FROM project_search_timeline_events WHERE project_search_timeline_events MATCH ?`,
				)
				.all('conflict');
			expect(rows.length).toBe(1);
		});
	});

	describe('indexOutlineItem', () => {
		it('inserts and can be retrieved', () => {
			indexOutlineItem(
				{ projectId: 'p1', entityId: 'oi1', summary: 'Chapter 1 summary: journey begins.', notes: '' },
				{ db },
			);
			const rows = db
				.prepare(
					`SELECT entityId FROM project_search_outline_items WHERE project_search_outline_items MATCH ?`,
				)
				.all('journey');
			expect(rows.length).toBe(1);
		});
	});

	describe('indexArtifact', () => {
		it('inserts and can be retrieved', () => {
			indexArtifact(
				{ projectId: 'p1', entityId: 'art1', summary: 'Accepted worldbuilding proposal.' },
				{ db },
			);
			const rows = db
				.prepare(
					`SELECT entityId FROM project_search_artifacts WHERE project_search_artifacts MATCH ?`,
				)
				.all('worldbuilding');
			expect(rows.length).toBe(1);
		});
	});

	describe('clearProjectSearchIndex', () => {
		it('removes all rows for a project without affecting other projects', () => {
			indexScene({ projectId: 'proj-A', entityId: 's1', title: 'Scene A', content: 'Content A.' }, { db });
			indexScene({ projectId: 'proj-B', entityId: 's2', title: 'Scene B', content: 'Content B.' }, { db });

			clearProjectSearchIndex('proj-A', { db });

			const rowsA = db
				.prepare(`SELECT entityId FROM project_search_scenes WHERE projectId = ?`)
				.all('proj-A');
			const rowsB = db
				.prepare(`SELECT entityId FROM project_search_scenes WHERE projectId = ?`)
				.all('proj-B');

			expect(rowsA.length).toBe(0);
			expect(rowsB.length).toBe(1);
		});
	});
});
