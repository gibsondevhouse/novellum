import { beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import {
	AuthorDraftCheckpointError,
	createAuthorDraftCheckpointService,
} from '$lib/ai/pipeline/author-draft-checkpoint-service.js';
import {
	AUTHOR_DRAFT_ARTIFACT_TYPE,
	AUTHOR_DRAFT_ARTIFACT_VERSION,
	AUTHOR_DRAFT_TASK_KEY,
	authorDraftArtifactSchema,
	authorDraftCheckpointSchema,
} from '$lib/ai/pipeline/author-draft-contract.js';

function createTestDb(): Database.Database {
	const database = new Database(':memory:');
	database.pragma('journal_mode = WAL');
	database.pragma('foreign_keys = ON');
	database.exec(SCHEMA_SQL);
	database.exec(INDEX_SQL);
	return database;
}

function seedProject(database: Database.Database, projectId = 'proj-1'): void {
	const now = new Date().toISOString();
	database
		.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, systemPrompt, negativePrompt, projectType, lastOpenedAt, stylePresetId, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @systemPrompt, @negativePrompt, @projectType, @lastOpenedAt, @stylePresetId, @createdAt, @updatedAt)`,
		)
		.run({
			id: projectId,
			title: 'Draft Engine Test Project',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			status: 'draft',
			systemPrompt: '',
			negativePrompt: '',
			projectType: 'novel',
			lastOpenedAt: '',
			stylePresetId: '',
			createdAt: now,
			updatedAt: now,
		});
}

function seedChapter(database: Database.Database, projectId = 'proj-1', chapterId = 'ch-1'): void {
	const now = new Date().toISOString();
	database
		.prepare(
			`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, actId, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @actId, @arcRefs, @createdAt, @updatedAt)`,
		)
		.run({
			id: chapterId,
			projectId,
			title: 'Chapter 1',
			order: 0,
			summary: '',
			wordCount: 0,
			actId: null,
			arcRefs: '[]',
			createdAt: now,
			updatedAt: now,
		});
}

function seedScene(
	database: Database.Database,
	projectId = 'proj-1',
	chapterId = 'ch-1',
	sceneId = 'sc-1',
	content = '',
): void {
	const now = new Date().toISOString();
	database
		.prepare(
			`INSERT INTO scenes (id, chapterId, projectId, title, summary, povCharacterId, locationId, timelineEventId, "order", content, wordCount, notes, characterIds, locationIds, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @chapterId, @projectId, @title, @summary, @povCharacterId, @locationId, @timelineEventId, @order, @content, @wordCount, @notes, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
		)
		.run({
			id: sceneId,
			chapterId,
			projectId,
			title: 'Scene 1',
			summary: '',
			povCharacterId: null,
			locationId: null,
			timelineEventId: null,
			order: 0,
			content,
			wordCount: 0,
			notes: '',
			characterIds: '[]',
			locationIds: '[]',
			arcRefs: '[]',
			createdAt: now,
			updatedAt: now,
		});
}

function getScene(database: Database.Database, sceneId: string): { content: string; wordCount: number; updatedAt: string } {
	return database.prepare('SELECT content, wordCount, updatedAt FROM scenes WHERE id = ?').get(sceneId) as {
		content: string;
		wordCount: number;
		updatedAt: string;
	};
}

function countWords(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).filter(Boolean).length;
}

describe('author-draft checkpoint contracts', () => {
	it('validates canonical AuthorDraftArtifact shape', () => {
		const artifact = {
			type: AUTHOR_DRAFT_ARTIFACT_TYPE,
			version: AUTHOR_DRAFT_ARTIFACT_VERSION,
			projectId: 'proj-1',
			chapterId: 'ch-1',
			sceneId: 'sc-1',
			title: 'Scene 1',
			prose: 'Hello world.',
			wordCount: 2,
			sidecar: {
				sceneId: 'sc-1',
				chapterId: 'ch-1',
				povCharacterId: null,
				wordCount: 2,
				usedCanonRefs: ['characterId:char-1'],
				uncertainties: ['What time of day is it?'],
				continuityRisks: ['Character arrives before they left.'],
			},
		};

		const parsed = authorDraftArtifactSchema.parse(artifact);
		expect(parsed.type).toBe(AUTHOR_DRAFT_ARTIFACT_TYPE);
		expect(parsed.version).toBe(1);
		expect(parsed.sidecar.usedCanonRefs).toEqual(['characterId:char-1']);
	});

	it('validates canonical AuthorDraftCheckpoint shape', () => {
		const checkpoint = {
			id: 'cp-1',
			projectId: 'proj-1',
			taskKey: AUTHOR_DRAFT_TASK_KEY,
			sceneId: 'sc-1',
			chapterId: 'ch-1',
			artifactEnvelope: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId: 'proj-1',
				chapterId: 'ch-1',
				sceneId: 'sc-1',
				prose: 'Hello world.',
				wordCount: 2,
				sidecar: {
					sceneId: 'sc-1',
					chapterId: 'ch-1',
					povCharacterId: null,
					wordCount: 2,
					usedCanonRefs: [],
					uncertainties: [],
					continuityRisks: [],
				},
			},
			lifecycle: 'review',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			baseSceneUpdatedAt: new Date().toISOString(),
			baseSceneContentHash: 'deadbeef',
		};

		const parsed = authorDraftCheckpointSchema.parse(checkpoint);
		expect(parsed.taskKey).toBe(AUTHOR_DRAFT_TASK_KEY);
		expect(parsed.lifecycle).toBe('review');
	});
});

describe('author-draft checkpoint service', () => {
	let database: Database.Database;

	beforeEach(() => {
		database = createTestDb();
		seedProject(database);
		seedChapter(database);
		seedScene(database);
	});

	it('enforces one active checkpoint per scene unless regenerated', () => {
		const service = createAuthorDraftCheckpointService(database);
		const base = service.getSceneBaseGuard('proj-1', 'sc-1');

		const first = service.createCheckpoint({
			projectId: 'proj-1',
			sceneId: 'sc-1',
			chapterId: base.chapterId,
			artifact: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId: 'proj-1',
				chapterId: base.chapterId,
				sceneId: 'sc-1',
				title: 'Scene 1',
				prose: 'Draft one.',
				sidecar: { sceneId: 'sc-1', chapterId: base.chapterId, povCharacterId: null },
			},
			baseSceneUpdatedAt: base.baseSceneUpdatedAt,
			baseSceneContentHash: base.baseSceneContentHash,
		});

		const reused = service.createCheckpoint({
			projectId: 'proj-1',
			sceneId: 'sc-1',
			chapterId: base.chapterId,
			artifact: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId: 'proj-1',
				chapterId: base.chapterId,
				sceneId: 'sc-1',
				title: 'Scene 1',
				prose: 'Draft two.',
				sidecar: { sceneId: 'sc-1', chapterId: base.chapterId, povCharacterId: null },
			},
			baseSceneUpdatedAt: base.baseSceneUpdatedAt,
			baseSceneContentHash: base.baseSceneContentHash,
		});

		expect(reused.id).toBe(first.id);

		const regenerated = service.createCheckpoint({
			projectId: 'proj-1',
			sceneId: 'sc-1',
			chapterId: base.chapterId,
			artifact: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId: 'proj-1',
				chapterId: base.chapterId,
				sceneId: 'sc-1',
				title: 'Scene 1',
				prose: 'Draft regenerated.',
				sidecar: { sceneId: 'sc-1', chapterId: base.chapterId, povCharacterId: null },
			},
			baseSceneUpdatedAt: base.baseSceneUpdatedAt,
			baseSceneContentHash: base.baseSceneContentHash,
			forceRegenerate: true,
		});

		expect(regenerated.id).not.toBe(first.id);

		const all = service.listCheckpoints('proj-1');
		const superseded = all.find((cp) => cp.id === first.id);
		expect(superseded?.lifecycle).toBe('rejected');
		expect(superseded?.rejectReason).toBe('Superseded by regeneration');
	});

	it('accept is idempotent and applies prose to scenes.content', () => {
		const service = createAuthorDraftCheckpointService(database);
		const base = service.getSceneBaseGuard('proj-1', 'sc-1');

		const checkpoint = service.createCheckpoint({
			projectId: 'proj-1',
			sceneId: 'sc-1',
			chapterId: base.chapterId,
			artifact: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId: 'proj-1',
				chapterId: base.chapterId,
				sceneId: 'sc-1',
				title: 'Scene 1',
				prose: 'One line.\n\nSecond paragraph.',
				sidecar: { sceneId: 'sc-1', chapterId: base.chapterId, povCharacterId: null },
			},
			baseSceneUpdatedAt: base.baseSceneUpdatedAt,
			baseSceneContentHash: base.baseSceneContentHash,
		});

		const first = service.acceptCheckpoint({
			projectId: 'proj-1',
			checkpointId: checkpoint.id,
			sceneId: 'sc-1',
		});

		expect(first.lifecycle).toBe('accepted');
		const scene = getScene(database, 'sc-1');
		expect(scene.content).toContain('<p>');
		expect(scene.wordCount).toBe(countWords(checkpoint.artifactEnvelope.prose));

		const second = service.acceptCheckpoint({
			projectId: 'proj-1',
			checkpointId: checkpoint.id,
			sceneId: 'sc-1',
		});

		expect(second.lifecycle).toBe('accepted');
		const sceneAfter = getScene(database, 'sc-1');
		expect(sceneAfter.updatedAt).toBe(scene.updatedAt);
	});

	it('reject blocks accept until regenerated', () => {
		const service = createAuthorDraftCheckpointService(database);
		const base = service.getSceneBaseGuard('proj-1', 'sc-1');
		const checkpoint = service.createCheckpoint({
			projectId: 'proj-1',
			sceneId: 'sc-1',
			chapterId: base.chapterId,
			artifact: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId: 'proj-1',
				chapterId: base.chapterId,
				sceneId: 'sc-1',
				title: 'Scene 1',
				prose: 'Draft that will be rejected.',
				sidecar: { sceneId: 'sc-1', chapterId: base.chapterId, povCharacterId: null },
			},
			baseSceneUpdatedAt: base.baseSceneUpdatedAt,
			baseSceneContentHash: base.baseSceneContentHash,
		});

		const rejected = service.rejectCheckpoint({
			projectId: 'proj-1',
			checkpointId: checkpoint.id,
			reason: 'Not the right direction.',
		});
		expect(rejected.lifecycle).toBe('rejected');

		expect(() =>
			service.acceptCheckpoint({
				projectId: 'proj-1',
				checkpointId: checkpoint.id,
				sceneId: 'sc-1',
			}),
		).toThrow(AuthorDraftCheckpointError);
	});

	it('stale write guard returns stale_target unless forced', () => {
		const service = createAuthorDraftCheckpointService(database);
		const base = service.getSceneBaseGuard('proj-1', 'sc-1');

		const checkpoint = service.createCheckpoint({
			projectId: 'proj-1',
			sceneId: 'sc-1',
			chapterId: base.chapterId,
			artifact: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId: 'proj-1',
				chapterId: base.chapterId,
				sceneId: 'sc-1',
				title: 'Scene 1',
				prose: 'Draft prose.',
				sidecar: { sceneId: 'sc-1', chapterId: base.chapterId, povCharacterId: null },
			},
			baseSceneUpdatedAt: base.baseSceneUpdatedAt,
			baseSceneContentHash: base.baseSceneContentHash,
		});

		database
			.prepare('UPDATE scenes SET content = ?, updatedAt = ? WHERE id = ?')
			.run('<p>New local edit</p>', new Date(Date.now() + 1000).toISOString(), 'sc-1');

		let err: unknown = null;
		try {
			service.acceptCheckpoint({
				projectId: 'proj-1',
				checkpointId: checkpoint.id,
				sceneId: 'sc-1',
			});
		} catch (e) {
			err = e;
		}
		expect(err).toBeInstanceOf(AuthorDraftCheckpointError);
		expect((err as AuthorDraftCheckpointError).code).toBe('stale_target');

		const forced = service.acceptCheckpoint({
			projectId: 'proj-1',
			checkpointId: checkpoint.id,
			sceneId: 'sc-1',
			forceOverwrite: true,
		});
		expect(forced.lifecycle).toBe('accepted');
	});

	it('accept validation rejects empty prose and mismatched scene ids', () => {
		const service = createAuthorDraftCheckpointService(database);
		const base = service.getSceneBaseGuard('proj-1', 'sc-1');

		const empty = service.createCheckpoint({
			projectId: 'proj-1',
			sceneId: 'sc-1',
			chapterId: base.chapterId,
			artifact: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId: 'proj-1',
				chapterId: base.chapterId,
				sceneId: 'sc-1',
				title: 'Scene 1',
				prose: '',
				sidecar: { sceneId: 'sc-1', chapterId: base.chapterId, povCharacterId: null },
			},
			baseSceneUpdatedAt: base.baseSceneUpdatedAt,
			baseSceneContentHash: base.baseSceneContentHash,
		});

		expect(() =>
			service.acceptCheckpoint({
				projectId: 'proj-1',
				checkpointId: empty.id,
				sceneId: 'sc-1',
			}),
		).toThrow(AuthorDraftCheckpointError);

		const valid = service.createCheckpoint({
			projectId: 'proj-1',
			sceneId: 'sc-1',
			chapterId: base.chapterId,
			artifact: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId: 'proj-1',
				chapterId: base.chapterId,
				sceneId: 'sc-1',
				title: 'Scene 1',
				prose: 'Valid prose.',
				sidecar: { sceneId: 'sc-1', chapterId: base.chapterId, povCharacterId: null },
			},
			baseSceneUpdatedAt: base.baseSceneUpdatedAt,
			baseSceneContentHash: base.baseSceneContentHash,
			forceRegenerate: true,
		});

		expect(() =>
			service.acceptCheckpoint({
				projectId: 'proj-1',
				checkpointId: valid.id,
				sceneId: 'sc-2',
			}),
		).toThrow(AuthorDraftCheckpointError);
	});
});
