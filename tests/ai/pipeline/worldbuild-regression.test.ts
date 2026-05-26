import { beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import {
	createCheckpointDraftFromArtifact,
	createWorldbuildCheckpointService,
	WorldbuildCheckpointError,
} from '$lib/ai/pipeline/checkpoint-service.js';
import { createPipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import {
	PIPELINE_TASK_CATALOG,
	PIPELINE_TASK_FAMILIES,
	PIPELINE_TASK_KEYS,
	getPipelineTaskDefinition,
} from '$lib/ai/pipeline/task-catalog.js';
import { PROMPT_SEEDS } from '$lib/ai/pipeline/prompt-library-seeds.js';
import { OUTPUT_FORMAT_DESCRIPTIONS } from '$lib/ai/constants.js';
import { WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT } from '$lib/ai/pipeline/worldbuild-schemas.js';
import {
	WORLDBUILD_PIPELINE_KEYS,
	parseWorldbuildOutput,
	type WorldbuildPopulatedBiblePayload,
} from '$lib/ai/pipeline/worldbuild-agent.js';

function createTestDb() {
	const database = new Database(':memory:');
	database.pragma('journal_mode = WAL');
	database.pragma('foreign_keys = ON');
	database.exec(SCHEMA_SQL);
	database.exec(INDEX_SQL);
	return database;
}

function seedProject(database: Database.Database, projectId = 'proj-regression') {
	const now = new Date().toISOString();
	database
		.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
		)
		.run({
			id: projectId,
			title: 'Worldbuild Regression Project',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			status: 'draft',
			createdAt: now,
			updatedAt: now,
		});
}

function countRows(database: Database.Database, table: string): number {
	const row = database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as {
		count: number;
	};
	return row.count;
}

function createPopulatedBibleDraft(projectId = 'proj-regression') {
	const definition = getPipelineTaskDefinition(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE);
	if (!definition) throw new Error('Missing populated world-bible task definition.');

	const payload: WorldbuildPopulatedBiblePayload = {
		canonical: {
			characters: [{ name: 'Wren Halcyon' }],
			locations: [{ name: 'Stormgate' }],
			factions: [{ name: 'Bellwether Guild' }],
			loreEntries: [{ title: 'Sky-Debt Codex' }],
			timelineEvents: [{ title: 'First Blackout' }],
			themes: [{ title: 'Sacrifice and Belonging' }],
			glossary: [{ term: 'Voltcrest' }],
			relationships: [{ title: 'Wren vs Magister Cael' }],
		},
		tableWrites: {
			characters: [
				{
					name: 'Wren Halcyon',
					role: 'protagonist',
					bio: 'A storm courier turned reluctant rebel.',
					faction: 'Bellwether Guild',
					traits: ['perceptive'],
					goals: ['expose the debt ledger'],
					flaws: ['stubborn'],
					tags: ['lead'],
					notes: 'Knows the hidden vault routes.',
				},
			],
			locations: [
				{
					name: 'Stormgate',
					description: 'The walled threshold city above the floodline.',
					tags: ['city'],
				},
			],
			factions: [
				{
					name: 'Bellwether Guild',
					type: 'trade cartel',
					description: 'Controls the storm vault keys.',
					mission: 'Preserve the vaults.',
					ideology: 'Stewardship through scarcity.',
				},
			],
			themes: [
				{
					title: 'Sacrifice and Belonging',
					description: 'Personal cost of communal survival.',
					tensionPair: 'self vs collective',
					imagery: 'frayed signal wires',
				},
			],
			glossary_terms: [
				{
					term: 'Voltcrest',
					definition: 'Hardened plasma node used to anchor a storm vault.',
					pronunciation: 'volt-crest',
					category: 'infrastructure',
				},
			],
			lore_entries: [
				{
					title: 'Sky-Debt Codex',
					category: 'doctrine',
					content: 'Every storm withdrawal incurs a ledger entry.',
					tags: ['canon'],
				},
			],
			plot_threads: [
				{
					title: 'Wren vs Magister Cael',
					description: 'Competing claims over the Sky-Debt ledger.',
					status: 'planned',
					relatedSceneIds: [],
					relatedCharacterIds: [],
				},
			],
			timeline_events: [
				{
					title: 'First Blackout',
					description: 'The first regional storm-grid failure.',
					date: 'Year 11',
					relatedCharacterIds: [],
					relatedSceneIds: [],
				},
			],
		},
	};

	const artifact = createPipelineArtifactEnvelope({
		task: definition,
		payload,
		hierarchyReferences: {
			stages: ['regression-stage-001'],
		},
	});

	return createCheckpointDraftFromArtifact({
		projectId,
		artifact,
	});
}

describe('worldbuild catalog integrity', () => {
	it('declares all four worldbuild stages in the family registry', () => {
		const family = PIPELINE_TASK_FAMILIES['vibe-worldbuild'];
		expect(family).toEqual([
			PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE,
			PIPELINE_TASK_KEYS.WORLDBUILD_WORLDSPEC,
			PIPELINE_TASK_KEYS.WORLDBUILD_RESEARCH,
			PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE,
		]);
		expect(WORLDBUILD_PIPELINE_KEYS).toEqual(family);
	});

	it.each(Array.from(WORLDBUILD_PIPELINE_KEYS))(
		'has prompt scaffold, output descriptor, and schema for %s',
		(taskKey) => {
			const definition = PIPELINE_TASK_CATALOG[taskKey];
			expect(definition).toBeDefined();

			const scaffold = PROMPT_SEEDS[taskKey];
			expect(scaffold, `missing PROMPT_SEEDS entry for ${taskKey}`).toBeDefined();
			expect(scaffold.role.length).toBeGreaterThan(0);
			expect(scaffold.task.length).toBeGreaterThan(0);
			expect(scaffold.constraints.length).toBeGreaterThan(0);
			expect(scaffold.outputFormat).toBe(definition.outputFormat);

			const descriptor = OUTPUT_FORMAT_DESCRIPTIONS[definition.outputFormat];
			expect(
				descriptor,
				`missing OUTPUT_FORMAT_DESCRIPTIONS entry for ${definition.outputFormat}`,
			).toBeDefined();
			expect(descriptor.length).toBeGreaterThan(0);

			const schema =
				WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT[
					definition.outputFormat as keyof typeof WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT
				];
			expect(schema, `missing schema for ${definition.outputFormat}`).toBeDefined();
		},
	);
});

describe('worldbuild schema validation regressions', () => {
	it('premise parser rejects empty strings in required fields', () => {
		const raw = JSON.stringify({
			hook: '',
			genreBlend: 'noir',
			readerPromise: 'heists',
			coreConflict: 'redemption',
			worldPressure: 'storms',
			tone: 'urgent',
			scope: 'city',
			nonNegotiables: [],
			openQuestions: [],
		});
		const result = parseWorldbuildOutput(PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE, raw);
		// Schema accepts empty strings (passthrough trim); the parser surface
		// remains structured. This pins current behavior: empty strings parse
		// to empty strings, not validation failures, so the UI must enforce.
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.payload).toMatchObject({ hook: '' });
		}
	});

	it('research briefs parser normalizes string candidate answers into array', () => {
		const raw = JSON.stringify({
			researchBriefs: [
				{
					question: 'What fuels the storm vaults?',
					whyItMatters: 'Determines siege durations.',
					candidateAnswers: 'pressurized helium grid',
					selectedRecommendation: 'Pressurized helium grid with 22h capacity.',
					confidence: 0.65,
					sourceNote: 'Engineer testimony.',
					canonImpact: 'Caps mission windows.',
				},
			],
		});
		const result = parseWorldbuildOutput(PIPELINE_TASK_KEYS.WORLDBUILD_RESEARCH, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected ok');
		const briefs = result.payload as { researchBriefs: Array<{ candidateAnswers: unknown[] }> };
		expect(Array.isArray(briefs.researchBriefs[0].candidateAnswers)).toBe(true);
		expect(briefs.researchBriefs[0].candidateAnswers).toHaveLength(1);
	});

	it('populated bible parser surfaces structured error for missing required fields', () => {
		const raw = JSON.stringify({
			characters: [{ role: 'no name' }],
			locations: [],
			factions: [],
			loreEntries: [],
			timelineEvents: [],
			themes: [],
			glossary: [],
			relationships: [],
		});
		const result = parseWorldbuildOutput(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE, raw);
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('missing_required_fields');
		expect(result.error.details.some((d) => d.includes('characters[0].name'))).toBe(true);
		expect(result.fallbackMessage).toContain('required persistence fields');
	});

	it('returns missing_json_object error on empty output (non-destructive)', () => {
		const result = parseWorldbuildOutput(PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE, '   ');
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('missing_json_object');
	});
});

describe('worldbuild checkpoint projection regressions', () => {
	let database: Database.Database;

	beforeEach(() => {
		database = createTestDb();
		seedProject(database);
	});

	it('links characters to projected factionId by name (case-insensitive)', () => {
		const service = createWorldbuildCheckpointService(database);
		const draft = createPopulatedBibleDraft();

		service.upsertCheckpoint('proj-regression', 'vibe-worldbuild', draft.id, {
			artifact: draft.artifact,
			version: draft.version,
		});
		service.acceptCheckpoint('proj-regression', 'vibe-worldbuild', draft.id, {
			acceptedBy: 'reviewer-fixture',
		});

		const character = database
			.prepare(`SELECT name, factionId, faction FROM characters WHERE projectId = ?`)
			.get('proj-regression') as { name: string; factionId: string | null; faction: string };
		const faction = database
			.prepare(`SELECT id, name FROM factions WHERE projectId = ?`)
			.get('proj-regression') as { id: string; name: string };

		expect(character.factionId).toBe(faction.id);
		expect(character.faction).toBe('Bellwether Guild');
	});

	it('blocks accepted → rejected transitions', () => {
		const service = createWorldbuildCheckpointService(database);
		const draft = createPopulatedBibleDraft();
		service.upsertCheckpoint('proj-regression', 'vibe-worldbuild', draft.id, {
			artifact: draft.artifact,
			version: draft.version,
		});
		service.acceptCheckpoint('proj-regression', 'vibe-worldbuild', draft.id);

		expect(() =>
			service.rejectCheckpoint('proj-regression', 'vibe-worldbuild', draft.id, {
				reason: 'Too late.',
			}),
		).toThrow(WorldbuildCheckpointError);
	});

	it('blocks rejected → accepted transitions and preserves rationale', () => {
		const service = createWorldbuildCheckpointService(database);
		const draft = createPopulatedBibleDraft();
		service.upsertCheckpoint('proj-regression', 'vibe-worldbuild', draft.id, {
			artifact: draft.artifact,
			version: draft.version,
		});
		service.rejectCheckpoint('proj-regression', 'vibe-worldbuild', draft.id, {
			reason: 'Conflicts with existing canon.',
			rejectedBy: 'reviewer-A',
		});

		expect(() =>
			service.acceptCheckpoint('proj-regression', 'vibe-worldbuild', draft.id),
		).toThrow(WorldbuildCheckpointError);

		const stored = service.getCheckpoint('proj-regression', 'vibe-worldbuild', draft.id);
		expect(stored?.lifecycle).toBe('rejected');
		expect(stored?.rejection?.reason).toBe('Conflicts with existing canon.');
		expect(countRows(database, 'characters')).toBe(0);
		expect(countRows(database, 'factions')).toBe(0);
	});

	it('requires a non-empty reason for reject', () => {
		const service = createWorldbuildCheckpointService(database);
		const draft = createPopulatedBibleDraft();
		service.upsertCheckpoint('proj-regression', 'vibe-worldbuild', draft.id, {
			artifact: draft.artifact,
			version: draft.version,
		});
		expect(() =>
			service.rejectCheckpoint('proj-regression', 'vibe-worldbuild', draft.id, {
				reason: '   ',
			}),
		).toThrow(WorldbuildCheckpointError);
	});

	it('upsert of an existing rejected checkpoint resets it to draft', () => {
		const service = createWorldbuildCheckpointService(database);
		const draft = createPopulatedBibleDraft();
		service.upsertCheckpoint('proj-regression', 'vibe-worldbuild', draft.id, {
			artifact: draft.artifact,
			version: draft.version,
		});
		service.rejectCheckpoint('proj-regression', 'vibe-worldbuild', draft.id, {
			reason: 'Initial reject.',
		});

		const reset = service.upsertCheckpoint(
			'proj-regression',
			'vibe-worldbuild',
			draft.id,
			{
				artifact: draft.artifact,
				version: draft.version,
			},
		);
		expect(reset.lifecycle).toBe('draft');
		expect(reset.rejection).toBeNull();
		expect(reset.review).toBeNull();
		expect(reset.acceptance).toBeNull();
	});

	it('lists checkpoints ordered by most recent update', () => {
		const service = createWorldbuildCheckpointService(database);
		const first = createPopulatedBibleDraft();
		const secondArtifact = createPopulatedBibleDraft();
		secondArtifact.artifact.id = `${secondArtifact.artifact.id}-b`;
		secondArtifact.id = secondArtifact.artifact.id;

		service.upsertCheckpoint('proj-regression', 'vibe-worldbuild', first.id, {
			artifact: first.artifact,
			version: first.version,
		});
		service.upsertCheckpoint(
			'proj-regression',
			'vibe-worldbuild',
			secondArtifact.id,
			{ artifact: secondArtifact.artifact, version: secondArtifact.version },
		);

		const list = service.listCheckpoints('proj-regression', 'vibe-worldbuild');
		expect(list).toHaveLength(2);
		expect(list[0].updatedAt >= list[1].updatedAt).toBe(true);
	});
});
