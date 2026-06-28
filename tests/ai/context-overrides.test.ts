import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import { buildNovaContext } from '$lib/server/nova/context.js';
import type { NovaContextRequestPayload } from '$lib/ai/nova-context-types.js';

function createContextDb(): Database.Database {
	const database = new Database(':memory:');
	database.pragma('journal_mode = WAL');
	database.pragma('foreign_keys = ON');
	database.exec(SCHEMA_SQL);
	database.exec(INDEX_SQL);
	return database;
}

function seedProject(database: Database.Database): void {
	const now = '2026-06-28T14:36:00.000Z';
	database
		.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, projectType, lastOpenedAt, stylePresetId, systemPrompt, negativePrompt, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @projectType, @lastOpenedAt, @stylePresetId, @systemPrompt, @negativePrompt, @createdAt, @updatedAt)`,
		)
		.run({
			id: 'proj-ctx',
			title: 'Context Project',
			genre: 'fantasy',
			logline: 'A mapmaker hides a forbidden coast.',
			synopsis: 'The court revises history by redrawing maps.',
			targetWordCount: 80_000,
			status: 'drafting',
			projectType: 'novel',
			lastOpenedAt: now,
			stylePresetId: '',
			systemPrompt: '',
			negativePrompt: '',
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, actId, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @actId, @arcRefs, @createdAt, @updatedAt)`,
		)
		.run({
			id: 'chapter-1',
			projectId: 'proj-ctx',
			title: 'Chapter One',
			order: 1,
			summary: 'The forbidden chart appears.',
			wordCount: 1200,
			actId: null,
			arcRefs: '[]',
			createdAt: now,
			updatedAt: now,
		});

	for (const character of [
		{ id: 'char-pin', name: 'Pinned Cartographer', bio: 'Knows the honest shoreline.' },
		{ id: 'char-side', name: 'Side Witness', bio: 'Saw the court erase a harbor.' },
	]) {
		database
			.prepare(
				`INSERT INTO characters (id, projectId, name, role, pronunciation, aliases, diasporaOrigin, photoUrl, bio, faction, anomalies, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt)
				 VALUES (@id, @projectId, @name, @role, @pronunciation, @aliases, @diasporaOrigin, @photoUrl, @bio, @faction, @anomalies, @traits, @goals, @flaws, @arcs, @notes, @tags, @createdAt, @updatedAt)`,
			)
			.run({
				id: character.id,
				projectId: 'proj-ctx',
				name: character.name,
				role: 'supporting',
				pronunciation: '',
				aliases: '[]',
				diasporaOrigin: '',
				photoUrl: '',
				bio: character.bio,
				faction: '',
				anomalies: '[]',
				traits: '["observant"]',
				goals: '[]',
				flaws: '[]',
				arcs: '[]',
				notes: '',
				tags: '[]',
				createdAt: now,
				updatedAt: now,
			});
	}

	database
		.prepare(
			`INSERT INTO locations (id, projectId, name, description, tags, kind, realmType, realityRules, culturalBaseline, powerStructure, conflictPressure, storyRole, tone, realmId, environment, notableFeatures, purpose, activityType, emotionalTone, changeOverTime, landmarkIds, factionIds, characterIds, threadIds, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @description, @tags, @kind, @realmType, @realityRules, @culturalBaseline, @powerStructure, @conflictPressure, @storyRole, @tone, @realmId, @environment, @notableFeatures, @purpose, @activityType, @emotionalTone, @changeOverTime, @landmarkIds, @factionIds, @characterIds, @threadIds, @createdAt, @updatedAt)`,
		)
		.run({
			id: 'loc-excluded',
			projectId: 'proj-ctx',
			name: 'Excluded Harbor',
			description: 'This stale location must not ground the answer.',
			tags: '[]',
			kind: 'realm',
			realmType: '',
			realityRules: '',
			culturalBaseline: '',
			powerStructure: '',
			conflictPressure: '',
			storyRole: '',
			tone: '',
			realmId: '',
			environment: '',
			notableFeatures: '[]',
			purpose: '',
			activityType: '',
			emotionalTone: '',
			changeOverTime: '',
			landmarkIds: '[]',
			factionIds: '[]',
			characterIds: '["char-pin"]',
			threadIds: '[]',
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO scenes (id, chapterId, projectId, title, summary, povCharacterId, locationId, timelineEventId, "order", content, wordCount, notes, characterIds, locationIds, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @chapterId, @projectId, @title, @summary, @povCharacterId, @locationId, @timelineEventId, @order, @content, @wordCount, @notes, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
		)
		.run({
			id: 'scene-1',
			chapterId: 'chapter-1',
			projectId: 'proj-ctx',
			title: 'The False Coast',
			summary: 'A scene that references both valid and excluded context.',
			povCharacterId: 'char-pin',
			locationId: 'loc-excluded',
			timelineEventId: null,
			order: 1,
			content: 'Scene content.',
			wordCount: 300,
			notes: '',
			characterIds: '["char-pin","char-side"]',
			locationIds: '["loc-excluded"]',
			arcRefs: '[]',
			createdAt: now,
			updatedAt: now,
		});
}

describe('Nova context overrides verification', () => {
	it('keeps pinned context deterministic while excluding stale entity rows and references', () => {
		const database = createContextDb();
		seedProject(database);
		const payload: NovaContextRequestPayload = {
			projectIds: ['proj-ctx'],
			files: [
				{
					id: 'notes-1',
					name: 'oversized-notes.md',
					mimeType: 'text/markdown',
					sizeBytes: 16_000,
					text: '# Notes\n' + 'extra context '.repeat(1200),
				},
			],
			mode: 'targeted',
			requestedScopes: ['scenes', 'characters', 'locations'],
			pinnedEntityIds: ['char-pin', 'loc-excluded', 'char-pin', 'missing-entity'],
			excludedEntityIds: ['loc-excluded'],
		};

		const result = buildNovaContext(database, payload, { maxContextChars: 4_200 });

		const pinnedIndex = result.contextText.indexOf('# Pinned Context: Context Project');
		const projectIndex = result.contextText.indexOf('# Project: Context Project');
		expect(pinnedIndex).toBeGreaterThanOrEqual(0);
		expect(projectIndex).toBeGreaterThan(pinnedIndex);
		expect(result.contextText).toContain('[character:char-pin] Pinned Cartographer');
		expect(result.contextText).toContain('bio: Knows the honest shoreline.');
		expect(result.contextText).not.toContain('Excluded Harbor');
		expect(result.contextText).not.toContain('locationIds: loc-excluded');
		expect(result.contextText).not.toContain('locationId: loc-excluded');
		expect(result.contextText.length).toBeLessThanOrEqual(4_200);
		expect(result.includedItems).toContainEqual({
			kind: 'entity',
			id: 'char-pin',
			projectId: 'proj-ctx',
			entityType: 'character',
			label: 'Pinned Cartographer',
			inclusion: 'pinned',
		});
		expect(result.includedItems).not.toContainEqual(
			expect.objectContaining({ kind: 'entity', id: 'loc-excluded' }),
		);
		expect(result.warnings).toContain(
			'Excluded context overrides took precedence over pinned IDs: loc-excluded.',
		);
	});
});
