import { beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import {
	createWorldbuildCheckpointService,
	WorldbuildCheckpointError,
} from '$lib/ai/pipeline/checkpoint-service.js';
import { createPipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import { PIPELINE_TASK_KEYS, getPipelineTaskDefinition } from '$lib/ai/pipeline/task-catalog.js';
import { checkDomainReadiness } from '../../src/modules/world-building/worldbuilding-readiness.js';
import { canGenerateDomain } from '../../src/modules/world-building/worldbuilding-generate-actions.js';
import { WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT } from '$lib/ai/pipeline/worldbuild-schemas.js';
import type { WorldbuildingDomainId } from '../../src/modules/world-building/worldbuilding-workflow.js';

function createTestDb() {
	const database = new Database(':memory:');
	database.pragma('journal_mode = WAL');
	database.pragma('foreign_keys = ON');
	database.exec(SCHEMA_SQL);
	database.exec(INDEX_SQL);
	return database;
}

function seedProject(database: Database.Database, projectId: string) {
	const now = new Date().toISOString();
	database
		.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
		)
		.run({
			id: projectId,
			title: 'Generation Test Project',
			genre: 'fantasy',
			logline: 'A reluctant heir must save the realm.',
			synopsis: '',
			targetWordCount: 0,
			status: 'draft',
			createdAt: now,
			updatedAt: now,
		});
}

function allCounts(n: number): Record<WorldbuildingDomainId, number> {
	return { personae: n, atlas: n, archive: n, threads: n, chronicles: n };
}

function createDomainArtifact(taskKey: string, payload: unknown) {
	const definition = getPipelineTaskDefinition(taskKey);
	if (!definition) throw new Error(`No task definition for ${taskKey}`);
	return createPipelineArtifactEnvelope({
		task: definition,
		payload,
		hierarchyReferences: { stages: ['test-stage-001'] },
	});
}

describe('missing-context detection', () => {
	it('allows personae generation with no deps', () => {
		const result = checkDomainReadiness('personae', allCounts(0));
		expect(result.allowed).toBe(true);
		expect(result.missingDeps).toHaveLength(0);
	});

	it('blocks atlas generation when personae count is 0', () => {
		const result = checkDomainReadiness('atlas', {
			personae: 0, atlas: 0, archive: 0, threads: 0, chronicles: 0,
		});
		expect(result.allowed).toBe(false);
		expect(result.missingDeps.length).toBeGreaterThan(0);
		expect(result.missingDeps.join(' ')).toMatch(/personae/i);
	});

	it('allows atlas generation when personae count > 0', () => {
		const result = checkDomainReadiness('atlas', {
			personae: 3, atlas: 0, archive: 0, threads: 0, chronicles: 0,
		});
		expect(result.allowed).toBe(true);
	});

	it('blocks threads when personae or atlas is missing', () => {
		const missingBoth = checkDomainReadiness('threads', allCounts(0));
		expect(missingBoth.allowed).toBe(false);

		const missingAtlas = checkDomainReadiness('threads', {
			personae: 2, atlas: 0, archive: 0, threads: 0, chronicles: 0,
		});
		expect(missingAtlas.allowed).toBe(false);
	});

	it('blocks chronicles until all upstream domains populated', () => {
		const partial = checkDomainReadiness('chronicles', {
			personae: 1, atlas: 1, archive: 0, threads: 1, chronicles: 0,
		});
		expect(partial.allowed).toBe(false);

		const full = checkDomainReadiness('chronicles', {
			personae: 1, atlas: 1, archive: 1, threads: 1, chronicles: 0,
		});
		expect(full.allowed).toBe(true);
	});
});

describe('canGenerateDomain guard', () => {
	it('returns allowed:false when no projectId', () => {
		const result = canGenerateDomain('personae', {
			projectId: '',
			domainCounts: allCounts(1),
		});
		expect(result.allowed).toBe(false);
		expect(result.reason).toBeTruthy();
	});

	it('returns allowed:false when deps missing', () => {
		const result = canGenerateDomain('atlas', {
			projectId: 'proj-1',
			domainCounts: allCounts(0),
		});
		expect(result.allowed).toBe(false);
		expect(result.reason).toBeTruthy();
	});

	it('returns allowed:true when all conditions met', () => {
		const result = canGenerateDomain('personae', {
			projectId: 'proj-1',
			domainCounts: allCounts(0),
		});
		expect(result.allowed).toBe(true);
		expect(result.reason).toBeNull();
	});
});

describe('domain proposal checkpoint accept/reject', () => {
	let database: Database.Database;

	beforeEach(() => {
		database = createTestDb();
		seedProject(database, 'proj-gen-test');
	});

	it('stores a domain proposal as draft lifecycle', () => {
		const service = createWorldbuildCheckpointService(database);
		const artifact = createDomainArtifact(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE, {
			canonical: {
				characters: [{ name: 'Elara' }],
				locations: [],
				factions: [],
				loreEntries: [],
				timelineEvents: [],
				themes: [],
				glossary: [],
				relationships: [],
			},
			tableWrites: {
				characters: [{ name: 'Elara', role: 'hero', bio: '', faction: '', traits: [], goals: [], flaws: [], tags: [], notes: '' }],
				locations: [],
				factions: [],
				themes: [],
				glossary_terms: [],
				lore_entries: [],
				plot_threads: [],
				timeline_events: [],
			},
		});

		const checkpoint = service.upsertCheckpoint(
			'proj-gen-test',
			'vibe-worldbuild',
			artifact.id,
			{ artifact, version: '1.0.0' },
		);

		expect(checkpoint.lifecycle).toBe('draft');
		expect(checkpoint.taskKey).toBe(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE);
	});

	it('accept transitions lifecycle to accepted and writes canon', () => {
		const service = createWorldbuildCheckpointService(database);
		const artifact = createDomainArtifact(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE, {
			canonical: {
				characters: [{ name: 'Rowan' }],
				locations: [],
				factions: [],
				loreEntries: [],
				timelineEvents: [],
				themes: [],
				glossary: [],
				relationships: [],
			},
			tableWrites: {
				characters: [{ name: 'Rowan', role: 'guide', bio: 'Wise elder.', faction: '', traits: ['calm'], goals: ['protect'], flaws: ['stubborn'], tags: [], notes: '' }],
				locations: [],
				factions: [],
				themes: [],
				glossary_terms: [],
				lore_entries: [],
				plot_threads: [],
				timeline_events: [],
			},
		});

		service.upsertCheckpoint('proj-gen-test', 'vibe-worldbuild', artifact.id, {
			artifact,
			version: '1.0.0',
		});
		const accepted = service.acceptCheckpoint('proj-gen-test', 'vibe-worldbuild', artifact.id);
		expect(accepted.lifecycle).toBe('accepted');
		expect(accepted.acceptance?.projectedToCanon).toBe(true);

		const row = database
			.prepare(`SELECT name FROM characters WHERE projectId = ?`)
			.get('proj-gen-test') as { name: string } | undefined;
		expect(row?.name).toBe('Rowan');
	});

	it('reject transitions lifecycle to rejected without canon write', () => {
		const service = createWorldbuildCheckpointService(database);
		const artifact = createDomainArtifact(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE, {
			canonical: {
				characters: [{ name: 'Doran' }],
				locations: [],
				factions: [],
				loreEntries: [],
				timelineEvents: [],
				themes: [],
				glossary: [],
				relationships: [],
			},
			tableWrites: {
				characters: [{ name: 'Doran', role: 'villain', bio: '', faction: '', traits: [], goals: [], flaws: [], tags: [], notes: '' }],
				locations: [],
				factions: [],
				themes: [],
				glossary_terms: [],
				lore_entries: [],
				plot_threads: [],
				timeline_events: [],
			},
		});

		service.upsertCheckpoint('proj-gen-test', 'vibe-worldbuild', artifact.id, {
			artifact,
			version: '1.0.0',
		});
		const rejected = service.rejectCheckpoint('proj-gen-test', 'vibe-worldbuild', artifact.id, {
			reason: 'Villain design conflicts with premise.',
		});
		expect(rejected.lifecycle).toBe('rejected');
		expect(rejected.rejection?.reason).toBe('Villain design conflicts with premise.');

		const count = (database.prepare(`SELECT COUNT(*) AS n FROM characters WHERE projectId = ?`).get('proj-gen-test') as { n: number }).n;
		expect(count).toBe(0);
	});

	it('blocks reject on already-accepted checkpoint', () => {
		const service = createWorldbuildCheckpointService(database);
		const artifact = createDomainArtifact(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE, {
			canonical: { characters: [], locations: [], factions: [], loreEntries: [], timelineEvents: [], themes: [], glossary: [], relationships: [] },
			tableWrites: { characters: [], locations: [], factions: [], themes: [], glossary_terms: [], lore_entries: [], plot_threads: [], timeline_events: [] },
		});

		service.upsertCheckpoint('proj-gen-test', 'vibe-worldbuild', artifact.id, {
			artifact,
			version: '1.0.0',
		});
		service.acceptCheckpoint('proj-gen-test', 'vibe-worldbuild', artifact.id);

		expect(() =>
			service.rejectCheckpoint('proj-gen-test', 'vibe-worldbuild', artifact.id, {
				reason: 'Too late.',
			}),
		).toThrow(WorldbuildCheckpointError);
	});

	it('requires non-empty reason for reject', () => {
		const service = createWorldbuildCheckpointService(database);
		const artifact = createDomainArtifact(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE, {
			canonical: { characters: [], locations: [], factions: [], loreEntries: [], timelineEvents: [], themes: [], glossary: [], relationships: [] },
			tableWrites: { characters: [], locations: [], factions: [], themes: [], glossary_terms: [], lore_entries: [], plot_threads: [], timeline_events: [] },
		});

		service.upsertCheckpoint('proj-gen-test', 'vibe-worldbuild', artifact.id, {
			artifact,
			version: '1.0.0',
		});

		expect(() =>
			service.rejectCheckpoint('proj-gen-test', 'vibe-worldbuild', artifact.id, { reason: '' }),
		).toThrow(WorldbuildCheckpointError);
	});
});

describe('domain schema validation', () => {
	it('personae schema accepts valid individuals/factions/relationships', () => {
		const schema = WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_personae'];
		const valid = {
			individuals: [{ name: 'Kira', role: 'lead', bio: '', faction: '', traits: [], goals: [], flaws: [], tags: [], notes: '' }],
			factions: [{ name: 'The Order', type: 'guild', description: '', mission: '', ideology: '' }],
			relationships: [{ source: 'Kira', target: 'The Order', type: 'member', description: '' }],
		};
		const result = schema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it('personae schema rejects individual without name', () => {
		const schema = WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_personae'];
		const invalid = {
			individuals: [{ role: 'lead', bio: '', faction: '', traits: [], goals: [], flaws: [], tags: [], notes: '' }],
			factions: [],
			relationships: [],
		};
		const result = schema.safeParse(invalid);
		expect(result.success).toBe(false);
	});

	it('atlas schema accepts valid realms/landmarks', () => {
		const schema = WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_atlas'];
		const valid = {
			realms: [{ name: 'The Highlands', description: 'Rugged terrain.', tags: ['physical'] }],
			landmarks: [{ name: 'The Spire', description: 'Ancient tower.', tags: [] }],
			travelConstraints: [{ description: 'Passes closed in winter.' }],
		};
		const result = schema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it('archive schema accepts myths/traditions/technologies', () => {
		const schema = WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_archive'];
		const valid = {
			myths: [{ title: 'The First War', category: 'myth', content: '', tags: [] }],
			traditions: [],
			technologies: [],
			themes: [],
			glossaryTerms: [],
		};
		const result = schema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it('threads schema accepts majorArcs and subplots', () => {
		const schema = WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_threads'];
		const valid = {
			majorArcs: [{ title: 'The Long Road', description: '', status: 'planned', relatedSceneIds: [], relatedCharacterIds: [] }],
			subplots: [],
			motivations: [{ characterName: 'Kira', drive: 'freedom', conflict: 'duty' }],
		};
		const result = schema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it('chronicles schema accepts eras and events', () => {
		const schema = WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_chronicles'];
		const valid = {
			eras: [{ name: 'Age of Silence', period: 'YE 0–300', description: '' }],
			keyEvents: [{ title: 'The Founding', description: '', date: 'YE 1', relatedCharacterIds: [], relatedSceneIds: [] }],
			personalHistories: [],
		};
		const result = schema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it('all five domain schemas are strict (no extra fields allowed)', () => {
		const schemas = [
			WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_personae'],
			WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_atlas'],
			WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_archive'],
			WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_threads'],
			WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT['json_worldbuild_domain_chronicles'],
		];
		for (const schema of schemas) {
			const result = schema.safeParse({ unexpectedField: true });
			expect(result.success).toBe(false);
		}
	});
});
