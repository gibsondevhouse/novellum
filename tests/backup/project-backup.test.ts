import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import JSZip from 'jszip';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';
import {
	buildProjectBackup,
	ProjectNotFoundError,
} from '$lib/server/backup/build-project-backup.js';
import {
	getProjectBackupTables,
} from '$lib/server/backup/table-registry.js';
import { validateManifest } from '$lib/server/backup/manifest.js';

function makeDb(): Database.Database {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	return db;
}

function seedProject(db: Database.Database, projectId: string, title = 'My Project'): void {
	const now = '2026-04-01T00:00:00.000Z';
	db.prepare(
		"INSERT INTO projects (id, title, projectType, createdAt, updatedAt) VALUES (?, ?, 'novel', ?, ?)",
	).run(projectId, title, now, now);
	db.prepare(
		`INSERT INTO chapters (id, projectId, title, "order", createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
	).run('c1', projectId, 'Ch 1', 1, now, now);
	db.prepare(
		`INSERT INTO scenes (id, chapterId, projectId, title, "order", createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
	).run('s1', 'c1', projectId, 'Scene 1', 1, now, now);
	db.prepare(
		`INSERT INTO characters (id, projectId, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
	).run('ch1', projectId, 'Alice', now, now);
}

describe('buildProjectBackup', () => {
	it('produces an archive containing manifest, checksums, and a db/*.json per registered table', async () => {
		const db = makeDb();
		seedProject(db, 'p1');

		const { archive, manifest, filename } = await buildProjectBackup(db, 'p1');
		expect(archive.byteLength).toBeGreaterThan(0);
		expect(filename).toMatch(/^my-project_\d{4}-\d{2}-\d{2}\.novellum$/);

		const zip = await JSZip.loadAsync(archive);
		expect(zip.file('manifest.json')).not.toBeNull();
		expect(zip.file('checksums.json')).not.toBeNull();

		for (const entry of getProjectBackupTables()) {
			const file = zip.file(`db/${entry.name}.json`);
			expect(file, `missing db/${entry.name}.json`).not.toBeNull();
		}

		const manifestText = await zip.file('manifest.json')!.async('string');
		const validated = validateManifest(JSON.parse(manifestText));
		expect(validated.ok).toBe(true);
		if (validated.ok) {
			expect(validated.manifest.project.id).toBe('p1');
			expect(validated.manifest.tables.projects).toBe(1);
			expect(validated.manifest.tables.chapters).toBe(1);
			expect(validated.manifest.tables.scenes).toBe(1);
			expect(validated.manifest.tables.characters).toBe(1);
			expect(validated.manifest.schemaVersion).toBeGreaterThanOrEqual(2);
		}

		// Round-trip: every reported table count matches the rows in db/<table>.json.
		expect(manifest.project.title).toBe('My Project');
		for (const entry of getProjectBackupTables()) {
			const text = await zip.file(`db/${entry.name}.json`)!.async('string');
			const rows = JSON.parse(text) as unknown[];
			expect(rows.length, `count mismatch for ${entry.name}`).toBe(manifest.tables[entry.name]);
		}

		db.close();
	});

	it('throws ProjectNotFoundError when the project does not exist', async () => {
		const db = makeDb();
		await expect(buildProjectBackup(db, 'missing')).rejects.toBeInstanceOf(ProjectNotFoundError);
		db.close();
	});

	it('emits empty arrays for tables with no rows', async () => {
		const db = makeDb();
		seedProject(db, 'p1');
		const { archive } = await buildProjectBackup(db, 'p1');
		const zip = await JSZip.loadAsync(archive);
		const text = await zip.file('db/lore_entries.json')!.async('string');
		expect(JSON.parse(text)).toEqual([]);
		db.close();
	});

	it('checksums.json hashes match the actual file contents', async () => {
		const db = makeDb();
		seedProject(db, 'p1');
		const { archive } = await buildProjectBackup(db, 'p1');
		const zip = await JSZip.loadAsync(archive);

		const { sha256 } = await import('$lib/server/backup/checksums.js');
		const checksums = JSON.parse(await zip.file('checksums.json')!.async('string')) as Record<
			string,
			string
		>;

		for (const [path, expected] of Object.entries(checksums)) {
			const file = zip.file(path);
			expect(file, `checksum entry ${path} has no file`).not.toBeNull();
			const text = await file!.async('string');
			expect(sha256(text), `${path} hash mismatch`).toBe(expected);
		}
		db.close();
	});
});
