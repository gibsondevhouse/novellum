import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';
import { buildProjectBackup } from '$lib/server/backup/build-project-backup.js';
import { parseBackup } from '$lib/server/restore/parse-backup.js';
import { restoreProject } from '$lib/server/restore/restore-project.js';

function withSnapshotsDir<T>(fn: () => T): T {
	const dir = mkdtempSync(join(tmpdir(), 'novellum-restore-'));
	const previous = process.env.NOVELLUM_SNAPSHOTS_DIR;
	process.env.NOVELLUM_SNAPSHOTS_DIR = dir;
	try {
		return fn();
	} finally {
		if (previous === undefined) delete process.env.NOVELLUM_SNAPSHOTS_DIR;
		else process.env.NOVELLUM_SNAPSHOTS_DIR = previous;
		rmSync(dir, { recursive: true, force: true });
	}
}

function freshDb(seed = true) {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	if (!seed) return db;
	const now = '2026-04-01T00:00:00.000Z';
	db.prepare(
		"INSERT INTO projects (id, title, projectType, createdAt, updatedAt) VALUES ('p1', 'My', 'novel', ?, ?)",
	).run(now, now);
	db.prepare(
		"INSERT INTO chapters (id, projectId, title, \"order\", createdAt, updatedAt) VALUES ('c1', 'p1', 'C1', 0, ?, ?)",
	).run(now, now);
	db.prepare(
		"INSERT INTO scenes (id, chapterId, projectId, title, \"order\", content, summary, createdAt, updatedAt, characterIds, arcRefs) VALUES ('s1', 'c1', 'p1', 'Scene', 0, 'hello world', '', ?, ?, '[\"ch1\"]', '[]')",
	).run(now, now);
	db.prepare(
		"INSERT INTO characters (id, projectId, name, createdAt, updatedAt) VALUES ('ch1', 'p1', 'Alice', ?, ?)",
	).run(now, now);
	return db;
}

describe('restoreProject — overwrite mode', () => {
	it('replaces all rows for the target project with archive contents', async () => {
		await withSnapshotsDir(async () => {
			const db = freshDb();
			const { archive } = await buildProjectBackup(db, 'p1');
			const parsed = await parseBackup(archive);

			// Mutate live state so we can detect the overwrite.
			db.prepare('UPDATE chapters SET title = ? WHERE id = ?').run('CHANGED', 'c1');
			db.prepare(
				"INSERT INTO chapters (id, projectId, title, \"order\", createdAt, updatedAt) VALUES ('c-extra', 'p1', 'extra', 1, ?, ?)",
			).run('2026-04-02', '2026-04-02');

			const result = restoreProject(db, parsed, { mode: 'overwrite', targetProjectId: 'p1' });
			expect(result.ok).toBe(true);
			if (!result.ok) return;

			const chapters = db
				.prepare('SELECT id, title FROM chapters WHERE projectId = ? ORDER BY id')
				.all('p1') as { id: string; title: string }[];
			expect(chapters).toHaveLength(1);
			expect(chapters[0]).toEqual({ id: 'c1', title: 'C1' });
		});
	});

	it('refuses with project_id_mismatch when target differs from archive', async () => {
		await withSnapshotsDir(async () => {
			const db = freshDb();
			const { archive } = await buildProjectBackup(db, 'p1');
			const parsed = await parseBackup(archive);
			const result = restoreProject(db, parsed, {
				mode: 'overwrite',
				targetProjectId: 'wrong-id',
			});
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe('project_id_mismatch');
		});
	});

	it('rolls back on insert error leaving the DB unchanged', async () => {
		await withSnapshotsDir(async () => {
			const db = freshDb();
			const { archive } = await buildProjectBackup(db, 'p1');
			const parsed = await parseBackup(archive);

			// Inject a poisoned row that will fail on INSERT (NOT NULL violation).
			const projects = parsed.tableFiles.projects;
			const newRows = projects.rows.map((r) => ({
				...(r as Record<string, unknown>),
				createdAt: null,
			}));
			const tampered = {
				...parsed,
				tableFiles: {
					...parsed.tableFiles,
					projects: { rows: newRows, rawBytes: projects.rawBytes },
				},
			};

			const before = db.prepare('SELECT COUNT(*) AS n FROM chapters').get() as { n: number };
			const result = restoreProject(db, tampered, { mode: 'overwrite', targetProjectId: 'p1' });
			expect(result.ok).toBe(false);
			const after = db.prepare('SELECT COUNT(*) AS n FROM chapters').get() as { n: number };
			expect(after.n).toBe(before.n);
		});
	});
});

describe('restoreProject — copy mode', () => {
	it('imports the archive as a fresh project leaving the source untouched', async () => {
		await withSnapshotsDir(async () => {
			const db = freshDb();
			const { archive } = await buildProjectBackup(db, 'p1');
			const parsed = await parseBackup(archive);

			const before = db
				.prepare('SELECT id, title FROM chapters ORDER BY id')
				.all() as { id: string; title: string }[];

			const result = restoreProject(db, parsed, { mode: 'copy' });
			expect(result.ok).toBe(true);
			if (!result.ok) return;
			expect(result.projectId).not.toBe('p1');

			// Source project untouched.
			const original = db
				.prepare('SELECT id, title FROM chapters WHERE projectId = ? ORDER BY id')
				.all('p1');
			expect(original).toEqual(before);

			// New project rows present and isolated.
			const copied = db
				.prepare('SELECT id, projectId FROM chapters WHERE projectId = ?')
				.all(result.projectId) as { id: string; projectId: string }[];
			expect(copied).toHaveLength(1);
			expect(copied[0].id).not.toBe('c1');
			expect(copied[0].projectId).toBe(result.projectId);

			// FK in scenes.chapterId is remapped to the new chapter id.
			const copiedScenes = db
				.prepare('SELECT id, chapterId, characterIds FROM scenes WHERE projectId = ?')
				.all(result.projectId) as { id: string; chapterId: string; characterIds: string }[];
			expect(copiedScenes).toHaveLength(1);
			expect(copiedScenes[0].chapterId).toBe(copied[0].id);

			// JSON id-array remapped: must not contain the original 'ch1'.
			expect(copiedScenes[0].characterIds).not.toContain('ch1');
			const characterIds = JSON.parse(copiedScenes[0].characterIds) as string[];
			expect(characterIds).toHaveLength(1);
			const newChars = db
				.prepare('SELECT id FROM characters WHERE projectId = ?')
				.all(result.projectId) as { id: string }[];
			expect(characterIds[0]).toBe(newChars[0].id);
		});
	});

	it('refuses with project_id_collision when explicit newProjectId already exists', async () => {
		await withSnapshotsDir(async () => {
			const db = freshDb();
			const { archive } = await buildProjectBackup(db, 'p1');
			const parsed = await parseBackup(archive);
			const result = restoreProject(db, parsed, { mode: 'copy', newProjectId: 'p1' });
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.code).toBe('project_id_collision');
		});
	});
});
