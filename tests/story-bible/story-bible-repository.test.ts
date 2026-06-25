import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { runMigrations } from '$lib/server/db/migration-runner.js';
import { MIGRATION_REGISTRY } from '$lib/server/db/migration-registry.js';
import { StoryBibleRepository } from '$modules/story-bible/services/story-bible-repository.js';

const NOW = '2026-06-25T12:00:00.000Z';

function createHarness(): { db: Database.Database; repository: StoryBibleRepository } {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	db.prepare('INSERT INTO projects (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)').run(
		'project-1',
		'The Glass Tide',
		NOW,
		NOW,
	);
	db.prepare('INSERT INTO projects (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)').run(
		'project-2',
		'Other Project',
		NOW,
		NOW,
	);
	return { db, repository: new StoryBibleRepository(db) };
}

function seedCompleteBible(db: Database.Database): void {
	db.prepare(
		`INSERT INTO characters (id, projectId, name, role, bio, aliases, traits, tags, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	).run(
		'char-1',
		'project-1',
		'Mira Vale',
		'Navigator',
		'Pilot of the reef skiff',
		JSON.stringify(['Captain Vale']),
		JSON.stringify(['decisive']),
		JSON.stringify(['crew', 'pilot']),
		NOW,
		NOW,
	);
	db.prepare(
		`INSERT INTO characters (id, projectId, name, role, bio, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
	).run('char-2', 'project-2', 'Outside Character', 'Witness', 'Should not appear', NOW, NOW);
	db.prepare(
		`INSERT INTO locations (id, projectId, name, description, tags, kind, notableFeatures, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	).run(
		'loc-1',
		'project-1',
		'Glass Harbor',
		'A city built over luminous reefs',
		JSON.stringify(['anchor', 'coast']),
		'realm',
		JSON.stringify(['glass docks']),
		NOW,
		NOW,
	);
	db.prepare(
		`INSERT INTO factions (id, projectId, name, type, description, mission, ideology, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	).run(
		'faction-1',
		'project-1',
		'Tide Cartel',
		'guild',
		'Controls shipping routes',
		'Keep the tide maps private',
		'Profit through secrecy',
		NOW,
		NOW,
	);
	db.prepare(
		`INSERT INTO lore_entries (id, projectId, title, category, content, tags, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
	).run(
		'lore-1',
		'project-1',
		'The First Bell',
		'myth',
		'The bell calmed the sea.',
		JSON.stringify(['myth']),
		NOW,
		NOW,
	);
	db.prepare(
		`INSERT INTO glossary_terms (id, projectId, term, definition, pronunciation, category, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
	).run(
		'term-1',
		'project-1',
		'Brightwater',
		'Luminescent seawater',
		'brite-water',
		'world',
		NOW,
		NOW,
	);
	db.prepare(
		`INSERT INTO timeline_events (id, projectId, title, description, date, relatedCharacterIds, relatedSceneIds, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	).run(
		'event-1',
		'project-1',
		'Harbor Fire',
		'Mira burns the false map.',
		'Day 3',
		JSON.stringify(['char-1']),
		JSON.stringify(['scene-1']),
		NOW,
		NOW,
	);
	db.prepare(
		`INSERT INTO themes (id, projectId, title, description, tensionPair, imagery, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
	).run(
		'theme-1',
		'project-1',
		'Truth vs. Survival',
		'Telling the truth endangers the crew.',
		'truth/survival',
		'cracked glass',
		NOW,
		NOW,
	);
	db.prepare(
		`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, status, description, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	).run(
		'rel-1',
		'project-1',
		'char-1',
		'char-3',
		'rival',
		'volatile',
		'They both want the same tide map.',
		NOW,
		NOW,
	);
}

describe('StoryBibleRepository', () => {
	it('loads a typed project bible across the story bible tables', () => {
		const { db, repository } = createHarness();
		try {
			seedCompleteBible(db);

			const bible = repository.getProjectBible('project-1');

			expect(bible.characters).toHaveLength(1);
			expect(bible.characters[0]).toMatchObject({
				id: 'char-1',
				name: 'Mira Vale',
				aliases: ['Captain Vale'],
				traits: ['decisive'],
				tags: ['crew', 'pilot'],
			});
			expect(bible.locations[0]).toMatchObject({
				name: 'Glass Harbor',
				kind: 'realm',
				notableFeatures: ['glass docks'],
			});
			expect(bible.factions[0]?.name).toBe('Tide Cartel');
			expect(bible.loreEntries[0]).toMatchObject({ title: 'The First Bell', tags: ['myth'] });
			expect(bible.glossaryTerms[0]?.term).toBe('Brightwater');
			expect(bible.timelineEvents[0]).toMatchObject({
				title: 'Harbor Fire',
				relatedCharacterIds: ['char-1'],
				relatedSceneIds: ['scene-1'],
			});
			expect(bible.themes[0]?.title).toBe('Truth vs. Survival');
			expect(bible.relationships[0]).toMatchObject({
				characterAId: 'char-1',
				characterBId: 'char-3',
				status: 'volatile',
			});
		} finally {
			db.close();
		}
	});

	it('paginates and filters repository lists', () => {
		const { db, repository } = createHarness();
		try {
			seedCompleteBible(db);
			db.prepare(
				`INSERT INTO characters (id, projectId, name, role, bio, createdAt, updatedAt)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			).run('char-4', 'project-1', 'Zed Pilot', 'Engineer', 'Backup pilot', NOW, NOW);

			const firstPilotPage = repository.getCharacters('project-1', {
				search: 'pilot',
				limit: 1,
				offset: 0,
			});
			const secondPilotPage = repository.getCharacters('project-1', {
				search: 'pilot',
				limit: 1,
				offset: 1,
			});
			const realmLocations = repository.getLocations('project-1', {
				kind: 'realm',
				tag: 'anchor',
			});
			const myths = repository.getLoreEntries('project-1', { category: 'myth' });

			expect(firstPilotPage).toMatchObject({ total: 2, limit: 1, offset: 0 });
			expect(firstPilotPage.items.map((item) => item.name)).toEqual(['Mira Vale']);
			expect(secondPilotPage.items.map((item) => item.name)).toEqual(['Zed Pilot']);
			expect(realmLocations.items.map((item) => item.id)).toEqual(['loc-1']);
			expect(myths.items.map((item) => item.id)).toEqual(['lore-1']);
		} finally {
			db.close();
		}
	});

	it('returns empty lists for missing projects and tolerates malformed JSON fields', () => {
		const { db, repository } = createHarness();
		try {
			db.prepare(
				`INSERT INTO characters (id, projectId, name, role, aliases, tags, createdAt, updatedAt)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'char-bad-json',
				'project-1',
				'Broken Tags',
				'Archivist',
				'not-json',
				'not-json',
				NOW,
				NOW,
			);

			const emptyBible = repository.getProjectBible('missing-project');
			const characters = repository.getCharacters('project-1');

			expect(Object.values(emptyBible).every((items) => items.length === 0)).toBe(true);
			expect(characters.items[0]).toMatchObject({
				id: 'char-bad-json',
				aliases: [],
				tags: [],
			});
		} finally {
			db.close();
		}
	});
});
