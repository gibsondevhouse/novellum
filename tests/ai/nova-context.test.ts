import { beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import { buildNovaContext } from '$lib/server/nova/context.js';
import type { NovaContextRequestPayload } from '$modules/ai/types.js';

function createTestDb() {
	const database = new Database(':memory:');
	database.pragma('journal_mode = WAL');
	database.pragma('foreign_keys = ON');
	database.exec(SCHEMA_SQL);
	database.exec(INDEX_SQL);
	return database;
}

function seedProjectGraph(database: Database.Database, projectId: string, title: string) {
	const now = new Date().toISOString();
	database
		.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, projectType, lastOpenedAt, stylePresetId, systemPrompt, negativePrompt, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @projectType, @lastOpenedAt, @stylePresetId, @systemPrompt, @negativePrompt, @createdAt, @updatedAt)`,
		)
		.run({
			id: projectId,
			title,
			genre: 'fantasy',
			logline: `${title} logline`,
			synopsis: `${title} synopsis`,
			targetWordCount: 90_000,
			status: 'drafting',
			projectType: 'novel',
			lastOpenedAt: now,
			stylePresetId: 'preset-1',
			systemPrompt: 'project system prompt',
			negativePrompt: 'project negative prompt',
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, actId, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @actId, @arcRefs, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-ch-1`,
			projectId,
			title: 'Chapter One',
			order: 1,
			summary: 'Chapter summary',
			wordCount: 1200,
			actId: `${projectId}-act-1`,
			arcRefs: JSON.stringify([{ arcId: `${projectId}-arc-1`, role: 'primary' }]),
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO scenes (id, chapterId, projectId, title, summary, povCharacterId, locationId, timelineEventId, "order", content, wordCount, notes, characterIds, locationIds, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @chapterId, @projectId, @title, @summary, @povCharacterId, @locationId, @timelineEventId, @order, @content, @wordCount, @notes, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-sc-1`,
			chapterId: `${projectId}-ch-1`,
			projectId,
			title: 'Scene One',
			summary: 'Scene summary',
			povCharacterId: `${projectId}-char-1`,
			locationId: `${projectId}-loc-1`,
			timelineEventId: `${projectId}-time-1`,
			order: 1,
			content: 'Scene body text',
			wordCount: 450,
			notes: 'Scene note',
			characterIds: JSON.stringify([`${projectId}-char-1`, `${projectId}-char-2`]),
			locationIds: JSON.stringify([`${projectId}-loc-1`]),
			arcRefs: JSON.stringify([{ arcId: `${projectId}-arc-1`, role: 'primary' }]),
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO beats (id, sceneId, arcId, projectId, title, type, "order", notes, createdAt, updatedAt)
			 VALUES (@id, @sceneId, @arcId, @projectId, @title, @type, @order, @notes, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-beat-1`,
			sceneId: `${projectId}-sc-1`,
			arcId: `${projectId}-arc-1`,
			projectId,
			title: 'Beat One',
			type: 'action',
			order: 1,
			notes: 'Beat note',
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO characters (id, projectId, name, role, pronunciation, aliases, diasporaOrigin, photoUrl, bio, faction, anomalies, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @role, @pronunciation, @aliases, @diasporaOrigin, @photoUrl, @bio, @faction, @anomalies, @traits, @goals, @flaws, @arcs, @notes, @tags, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-char-1`,
			projectId,
			name: 'Hero',
			role: 'protagonist',
			pronunciation: '',
			aliases: JSON.stringify(['The Lead']),
			diasporaOrigin: '',
			photoUrl: '',
			bio: 'Character biography',
			faction: 'Guild',
			anomalies: JSON.stringify(['none']),
			traits: JSON.stringify(['curious']),
			goals: JSON.stringify(['win']),
			flaws: JSON.stringify(['impulsive']),
			arcs: JSON.stringify(['growth']),
			notes: 'Character notes',
			tags: JSON.stringify(['main']),
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, description, createdAt, updatedAt)
			 VALUES (@id, @projectId, @characterAId, @characterBId, @type, @description, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-rel-1`,
			projectId,
			characterAId: `${projectId}-char-1`,
			characterBId: `${projectId}-char-2`,
			type: 'ally',
			description: 'Relationship',
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO locations (id, projectId, name, description, tags, kind, realmType, realityRules, culturalBaseline, powerStructure, conflictPressure, storyRole, tone, realmId, environment, notableFeatures, purpose, activityType, emotionalTone, changeOverTime, landmarkIds, factionIds, characterIds, threadIds, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @description, @tags, @kind, @realmType, @realityRules, @culturalBaseline, @powerStructure, @conflictPressure, @storyRole, @tone, @realmId, @environment, @notableFeatures, @purpose, @activityType, @emotionalTone, @changeOverTime, @landmarkIds, @factionIds, @characterIds, @threadIds, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-loc-1`,
			projectId,
			name: 'City',
			description: 'Location description',
			tags: JSON.stringify(['urban']),
			kind: 'realm',
			realmType: 'physical',
			realityRules: 'rules',
			culturalBaseline: 'baseline',
			powerStructure: 'council',
			conflictPressure: 'war',
			storyRole: 'setting',
			tone: 'grim',
			realmId: '',
			environment: 'cold',
			notableFeatures: JSON.stringify(['gate']),
			purpose: 'trade',
			activityType: 'market',
			emotionalTone: 'tense',
			changeOverTime: 'decline',
			landmarkIds: JSON.stringify([]),
			factionIds: JSON.stringify(['guild']),
			characterIds: JSON.stringify([`${projectId}-char-1`]),
			threadIds: JSON.stringify([`${projectId}-plot-1`]),
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO lore_entries (id, projectId, title, category, content, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @category, @content, @tags, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-lore-1`,
			projectId,
			title: 'Lore',
			category: 'history',
			content: 'Lore content',
			tags: JSON.stringify(['canon']),
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO plot_threads (id, projectId, title, description, status, relatedSceneIds, relatedCharacterIds, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @description, @status, @relatedSceneIds, @relatedCharacterIds, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-plot-1`,
			projectId,
			title: 'Arc A',
			description: 'Thread description',
			status: 'open',
			relatedSceneIds: JSON.stringify([`${projectId}-sc-1`]),
			relatedCharacterIds: JSON.stringify([`${projectId}-char-1`]),
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO timeline_events (id, projectId, title, description, date, relatedCharacterIds, relatedSceneIds, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @description, @date, @relatedCharacterIds, @relatedSceneIds, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-time-1`,
			projectId,
			title: 'Event',
			description: 'Timeline description',
			date: 'Y1-M1-D1',
			relatedCharacterIds: JSON.stringify([`${projectId}-char-1`]),
			relatedSceneIds: JSON.stringify([`${projectId}-sc-1`]),
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO story_frames (id, projectId, premise, theme, toneNotes, updatedAt)
			 VALUES (@id, @projectId, @premise, @theme, @toneNotes, @updatedAt)`,
		)
		.run({
			id: `${projectId}-frame-1`,
			projectId,
			premise: 'Premise',
			theme: 'Theme',
			toneNotes: 'Tone',
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO acts (id, projectId, arcId, title, "order", planningNotes, createdAt, updatedAt)
			 VALUES (@id, @projectId, @arcId, @title, @order, @planningNotes, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-act-1`,
			projectId,
			arcId: `${projectId}-arc-1`,
			title: 'Act I',
			order: 1,
			planningNotes: 'Act notes',
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO arcs (id, projectId, title, description, purpose, arcType, status, "order", createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @description, @purpose, @arcType, @status, @order, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-arc-1`,
			projectId,
			title: 'Main Arc',
			description: 'Arc description',
			purpose: 'Arc purpose',
			arcType: 'plot',
			status: 'planned',
			order: 1,
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO milestones (id, actId, projectId, title, description, "order", chapterIds, createdAt, updatedAt)
			 VALUES (@id, @actId, @projectId, @title, @description, @order, @chapterIds, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-mile-1`,
			actId: `${projectId}-act-1`,
			projectId,
			title: 'Milestone',
			description: 'Milestone description',
			order: 1,
			chapterIds: JSON.stringify([`${projectId}-ch-1`]),
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO writing_styles (id, projectId, title, description, exampleText, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @description, @exampleText, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-style-1`,
			projectId,
			title: 'Style',
			description: 'Style description',
			exampleText: 'Style example text',
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO system_prompts (id, projectId, name, content, isDefault, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @content, @isDefault, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-sys-1`,
			projectId,
			name: 'System Prompt',
			content: 'System prompt content',
			isDefault: 1,
			createdAt: now,
			updatedAt: now,
		});

	database
		.prepare(
			`INSERT INTO chat_instructions (id, projectId, name, content, isDefault, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @content, @isDefault, @createdAt, @updatedAt)`,
		)
		.run({
			id: `${projectId}-chat-1`,
			projectId,
			name: 'Chat Instruction',
			content: 'Chat instruction content',
			isDefault: 1,
			createdAt: now,
			updatedAt: now,
		});
}

describe('buildNovaContext', () => {
	let database: Database.Database;

	beforeEach(() => {
		database = createTestDb();
	});

	it('serializes full project graph sections with deterministic headings', () => {
		seedProjectGraph(database, 'proj-a', 'Project A');

		const payload: NovaContextRequestPayload = {
			projectIds: ['proj-a'],
			files: [],
		};

		const result = buildNovaContext(database, payload);

		expect(result.includedItems).toEqual([{ kind: 'project', projectId: 'proj-a', label: 'Project A' }]);
		expect(result.contextText).toContain('# Project: Project A');
		expect(result.contextText).toContain('## Chapters (1)');
		expect(result.contextText).toContain('## Scenes (1)');
		expect(result.contextText).toContain('## Characters (1)');
		expect(result.contextText).toContain('## Locations (1)');
		expect(result.contextText).toContain('## Lore Entries (1)');
		expect(result.contextText).toContain('## Plot Threads (1)');
		expect(result.contextText).toContain('## Timeline Events (1)');
		expect(result.contextText).toContain('## Story Frames (1)');
		expect(result.contextText).toContain('## Acts (1)');
		expect(result.contextText).toContain('## Arcs (1)');
		expect(result.contextText).toContain('## Milestones (1)');
		expect(result.contextText).toContain('## Writing Styles (1)');
		expect(result.contextText).toContain('## System Prompts (1)');
		expect(result.contextText).toContain('## Chat Instructions (1)');
		expect(result.contextText).toContain('characterIds: proj-a-char-1, proj-a-char-2');
		expect(result.warnings).toEqual([]);
	});

	it('supports multi-project ordering based on attachment order', () => {
		seedProjectGraph(database, 'proj-a', 'Project A');
		seedProjectGraph(database, 'proj-b', 'Project B');

		const result = buildNovaContext(database, {
			projectIds: ['proj-b', 'proj-a'],
			files: [],
		});

		const firstProjectIndex = result.contextText.indexOf('# Project: Project B');
		const secondProjectIndex = result.contextText.indexOf('# Project: Project A');
		expect(firstProjectIndex).toBeGreaterThanOrEqual(0);
		expect(secondProjectIndex).toBeGreaterThan(firstProjectIndex);
		expect(result.includedItems[0]).toEqual({ kind: 'project', projectId: 'proj-b', label: 'Project B' });
	});

	it('applies compression and hard trim when context budget is very small', () => {
		seedProjectGraph(database, 'proj-a', 'Project A');
		const longContent = 'x'.repeat(140_000);
		database
			.prepare('UPDATE scenes SET content = @content, notes = @notes WHERE id = @id')
			.run({ id: 'proj-a-sc-1', content: longContent, notes: longContent.slice(0, 10_000) });

		const result = buildNovaContext(
			database,
			{
				projectIds: ['proj-a'],
				files: [],
			},
			{ maxContextChars: 4_000 },
		);

		expect(result.truncationReport.compressionPasses).toBe(1);
		expect(result.truncationReport.finalHardTrimApplied).toBe(true);
		expect(result.truncationReport.entries.length).toBeGreaterThan(0);
		expect(result.warnings).toContain('Context exceeded the standard budget and was compressed before sending.');
		expect(result.warnings).toContain('Context still exceeded limits after compression and was hard-trimmed.');
		expect(result.contextText.length).toBeLessThanOrEqual(4_000);
	});

	it('accepts supported text files and skips unsupported binaries with warnings', () => {
		seedProjectGraph(database, 'proj-a', 'Project A');

		const result = buildNovaContext(database, {
			projectIds: ['proj-a'],
			files: [
				{
					id: 'file-1',
					name: 'notes.md',
					mimeType: 'text/markdown',
					sizeBytes: 50,
					text: '# Notes\nContext text',
				},
				{
					id: 'file-2',
					name: 'draft.pdf',
					mimeType: 'application/pdf',
					sizeBytes: 5000,
					text: 'binary-ish',
				},
			],
		});

		expect(result.contextText).toContain('# Attached Files');
		expect(result.contextText).toContain('## File: notes.md');
		expect(result.contextText).not.toContain('## File: draft.pdf');
		expect(result.includedItems.some((item) => item.kind === 'file' && item.id === 'file-1')).toBe(true);
		expect(result.includedItems.some((item) => item.kind === 'file' && item.id === 'file-2')).toBe(false);
		expect(
			result.warnings.some((warning) => warning.includes('draft.pdf') && warning.includes('not supported yet')),
		).toBe(true);
	});
});
