import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import JSZip from 'jszip';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';
import { buildProjectBackup } from '$lib/server/backup/build-project-backup.js';
import { parseBackup } from '$lib/server/restore/parse-backup.js';
import { validateBackup } from '$lib/server/restore/validate-backup.js';

function freshDb() {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	const now = '2026-04-01T00:00:00.000Z';
	db.prepare(
		"INSERT INTO projects (id, title, projectType, createdAt, updatedAt) VALUES ('p1', 'My', 'novel', ?, ?)",
	).run(now, now);
	return db;
}

async function buildAndParse() {
	const db = freshDb();
	const { archive } = await buildProjectBackup(db, 'p1');
	return { archive, parsed: await parseBackup(archive) };
}

describe('validateBackup', () => {
	it('produces zero warnings for a valid archive', async () => {
		const { parsed } = await buildAndParse();
		const preview = validateBackup(parsed);
		expect(preview.manifest).not.toBeNull();
		expect(preview.checksumStatus).toBe('ok');
		expect(preview.compatibility.canRestore).toBe(true);
		expect(preview.warnings).toEqual([]);
	});

	it('reports missing_required_table when a registered table is absent', async () => {
		const { parsed } = await buildAndParse();
		const trimmed = { ...parsed.tableFiles };
		delete trimmed.chapters;
		const preview = validateBackup({ ...parsed, tableFiles: trimmed });
		const codes = preview.warnings.map((w) => w.code);
		expect(codes).toContain('missing_required_table');
	});

	it('reports unknown_table for unregistered tables', async () => {
		const { parsed } = await buildAndParse();
		const augmented = {
			...parsed.tableFiles,
			mystery_table: { rows: [], rawBytes: new Uint8Array() },
		};
		const preview = validateBackup({ ...parsed, tableFiles: augmented });
		const codes = preview.warnings.map((w) => w.code);
		expect(codes).toContain('unknown_table');
	});

	it('reports checksum_mismatch when raw bytes are tampered', async () => {
		const { parsed } = await buildAndParse();
		const projects = parsed.tableFiles.projects;
		const tampered = {
			...parsed.tableFiles,
			projects: {
				rows: projects.rows,
				rawBytes: new TextEncoder().encode('[]'),
			},
		};
		const preview = validateBackup({ ...parsed, tableFiles: tampered });
		expect(preview.checksumStatus).toBe('mismatch');
		expect(preview.warnings.some((w) => w.code === 'checksum_mismatch')).toBe(true);
	});

	it('reports checksum_missing when checksums.json is absent', async () => {
		const { parsed } = await buildAndParse();
		const preview = validateBackup({ ...parsed, checksums: null });
		expect(preview.checksumStatus).toBe('absent');
		expect(preview.warnings.some((w) => w.code === 'checksum_missing')).toBe(true);
	});

	it('reports app_too_old when archive schemaVersion exceeds bundled', async () => {
		// Build an artificial archive with a future schemaVersion.
		const zip = new JSZip();
		const manifest = {
			format: 'novellum.project.backup',
			formatVersion: 1,
			appVersion: '1.0.0',
			schemaVersion: 999,
			exportedAt: new Date().toISOString(),
			project: { id: 'p1', title: 'M', type: 'novel' },
			tables: {},
			compatibility: { minAppVersion: '99.0.0', createdBy: 'Novellum' },
		};
		zip.file('manifest.json', JSON.stringify(manifest));
		const bytes = await zip.generateAsync({ type: 'uint8array' });
		const parsed = await parseBackup(bytes);

		const preview = validateBackup(parsed);
		expect(preview.compatibility.canRestore).toBe(false);
		expect(preview.warnings.some((w) => w.code === 'app_too_old')).toBe(true);
	});

	it('reports manifest_invalid when manifest fails schema check', async () => {
		const zip = new JSZip();
		zip.file('manifest.json', JSON.stringify({ format: 'wrong' }));
		const bytes = await zip.generateAsync({ type: 'uint8array' });
		const parsed = await parseBackup(bytes);

		const preview = validateBackup(parsed);
		expect(preview.manifest).toBeNull();
		expect(preview.compatibility.canRestore).toBe(false);
		expect(preview.warnings.some((w) => w.code === 'manifest_invalid')).toBe(true);
	});

	it('reports manifest_count_mismatch when manifest counts disagree with files', async () => {
		const { parsed } = await buildAndParse();
		const fakeManifest = {
			...(parsed.manifest as Record<string, unknown>),
			tables: { ...((parsed.manifest as { tables: Record<string, number> }).tables) },
		};
		(fakeManifest.tables as Record<string, number>).projects = 99;
		const preview = validateBackup({ ...parsed, manifest: fakeManifest });
		expect(preview.warnings.some((w) => w.code === 'manifest_count_mismatch')).toBe(true);
	});
});
