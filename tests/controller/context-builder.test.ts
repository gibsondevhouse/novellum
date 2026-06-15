import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { MIGRATION_REGISTRY, runMigrations } from '$lib/server/db';
import {
	createControllerContextBuilder,
	type AiControllerRequest,
} from '../../src/lib/server/ai/controller/index.js';

function createDb(): Database.Database {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	db.prepare(
		`INSERT INTO projects (id, title, genre, logline, synopsis, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
	).run(
		'project-1',
		'The Glass Archive',
		'speculative',
		'A historian breaks a citywide memory monopoly.',
		'A compact synopsis with enough detail for a context packet.',
		'2026-06-15T00:00:00.000Z',
		'2026-06-15T00:00:00.000Z',
	);
	db.prepare(
		`INSERT INTO chapters (id, projectId, title, "order", createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?)`,
	).run('chapter-1', 'project-1', 'Chapter One', 1, '2026-06-15T00:00:00.000Z', '2026-06-15T00:00:00.000Z');
	db.prepare(
		`INSERT INTO scenes (id, chapterId, projectId, title, summary, "order", content, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	).run(
		'scene-1',
		'chapter-1',
		'project-1',
		'Opening',
		'The historian enters the archive.',
		1,
		'Full scene prose should be represented only as a bounded preview in controller context.',
		'2026-06-15T00:00:00.000Z',
		'2026-06-15T00:00:00.000Z',
	);
	return db;
}

describe('controller context builder', () => {
	it('builds deterministic bounded context packets with source disclosure', () => {
		const db = createDb();
		try {
			const builder = createControllerContextBuilder({
				db,
				now: () => '2026-06-15T12:00:00.000Z',
				maxTokens: 1_000,
			});
			const request: AiControllerRequest = {
				requestId: 'request-1',
				projectId: 'project-1',
				requestedBy: 'user',
				action: {
					source: 'nova',
					id: 'authorDraft.generate_scene_draft_checkpoint',
					instruction: 'Draft the next version.',
				},
				target: { kind: 'scene', id: 'scene-1', projectId: 'project-1' },
				createdAt: '2026-06-15T00:00:00.000Z',
			};

			const packet = builder.build({ request });

			expect(packet.contextHash).toMatch(/^sha256:/);
			expect(packet.disclosure.includedSources).toEqual(
				expect.arrayContaining(['request', 'project', 'scene']),
			);
			expect(packet.snippets.some((snippet) => snippet.id === 'scene:scene-1')).toBe(true);
			expect(packet.tokenBudget.estimatedTokens).toBeLessThanOrEqual(1_000);
		} finally {
			db.close();
		}
	});
});
