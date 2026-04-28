import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import {
	runMigrations,
	MIGRATION_REGISTRY,
} from '$lib/server/db';
import { buildProjectBackup } from '$lib/server/backup/build-project-backup.js';
import { parseBackup, BackupParseError } from '$lib/server/restore/parse-backup.js';

function freshDb() {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	const now = '2026-04-01T00:00:00.000Z';
	db.prepare(
		"INSERT INTO projects (id, title, projectType, createdAt, updatedAt) VALUES ('p1', 'My', 'novel', ?, ?)",
	).run(now, now);
	db.prepare(
		"INSERT INTO chapters (id, projectId, title, \"order\", createdAt, updatedAt) VALUES ('c1', 'p1', 'C1', 0, ?, ?)",
	).run(now, now);
	return db;
}

describe('parseBackup', () => {
	it('round-trips a builder output', async () => {
		const db = freshDb();
		const { archive, manifest } = await buildProjectBackup(db, 'p1');

		const parsed = await parseBackup(archive);
		expect(parsed.manifest).toEqual(manifest);
		expect(parsed.tableFiles).toHaveProperty('projects');
		expect(parsed.tableFiles).toHaveProperty('chapters');
		expect(parsed.checksums).not.toBeNull();
		expect(Array.isArray(parsed.tableFiles.projects.rows)).toBe(true);
		expect(parsed.tableFiles.projects.rows.length).toBe(1);
	});

	it('rejects archives larger than the configured limit', async () => {
		const db = freshDb();
		const { archive } = await buildProjectBackup(db, 'p1');
		await expect(parseBackup(archive, { maxBytes: 10 })).rejects.toBeInstanceOf(
			BackupParseError,
		);
	});

	it('rejects truncated bytes', async () => {
		const db = freshDb();
		const { archive } = await buildProjectBackup(db, 'p1');
		const truncated = archive.slice(0, 50);
		await expect(parseBackup(truncated)).rejects.toBeInstanceOf(BackupParseError);
	});

	it('rejects archives missing manifest.json', async () => {
		// Build a minimal zip with no manifest.
		const { default: JSZip } = await import('jszip');
		const zip = new JSZip();
		zip.file('readme.txt', 'no manifest here');
		const bytes = await zip.generateAsync({ type: 'uint8array' });
		await expect(parseBackup(bytes)).rejects.toThrowError(/missing manifest\.json/);
	});

	it('rejects malformed manifest JSON', async () => {
		const { default: JSZip } = await import('jszip');
		const zip = new JSZip();
		zip.file('manifest.json', '{ not json');
		const bytes = await zip.generateAsync({ type: 'uint8array' });
		await expect(parseBackup(bytes)).rejects.toThrowError(/manifest\.json is not valid JSON/);
	});

	it('rejects table files that are not arrays', async () => {
		const { default: JSZip } = await import('jszip');
		const zip = new JSZip();
		zip.file('manifest.json', '{}');
		zip.file('db/projects.json', '{"not":"an array"}');
		const bytes = await zip.generateAsync({ type: 'uint8array' });
		await expect(parseBackup(bytes)).rejects.toThrowError(/must contain an array/);
	});
});
