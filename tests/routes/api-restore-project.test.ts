/**
 * Smoke-tests the `POST /api/restore/project` route handler. Mocks the
 * singleton DB so restore runs against an in-memory database with a
 * scratch snapshot directory.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import JSZip from 'jszip';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';
import { buildProjectBackup } from '$lib/server/backup/build-project-backup.js';

const snapshotsDir = mkdtempSync(join(tmpdir(), 'novellum-route-restore-'));
process.env.NOVELLUM_SNAPSHOTS_DIR = snapshotsDir;

vi.mock('$lib/server/db/index.js', async () => {
	const actual = await vi.importActual<typeof import('$lib/server/db/index.js')>(
		'$lib/server/db/index.js',
	);
	const { default: Database } = await import('better-sqlite3');
	const memDb = new Database(':memory:');
	actual.runMigrations(memDb, actual.MIGRATION_REGISTRY);
	const now = '2026-04-01T00:00:00.000Z';
	memDb
		.prepare(
			"INSERT INTO projects (id, title, projectType, createdAt, updatedAt) VALUES ('p1', 'Test', 'novel', ?, ?)",
		)
		.run(now, now);
	memDb
		.prepare(
			"INSERT INTO chapters (id, projectId, title, \"order\", createdAt, updatedAt) VALUES ('c1', 'p1', 'C1', 0, ?, ?)",
		)
		.run(now, now);
	return { ...actual, db: memDb };
});

async function loadHandler() {
	const mod = await import('../../src/routes/api/restore/project/+server.js');
	return mod.POST;
}

async function freshArchive(): Promise<Uint8Array> {
	const { default: Database } = await import('better-sqlite3');
	const sourceDb = new Database(':memory:');
	runMigrations(sourceDb, MIGRATION_REGISTRY);
	const now = '2026-04-01T00:00:00.000Z';
	sourceDb
		.prepare(
			"INSERT INTO projects (id, title, projectType, createdAt, updatedAt) VALUES ('p1', 'Test', 'novel', ?, ?)",
		)
		.run(now, now);
	sourceDb
		.prepare(
			"INSERT INTO chapters (id, projectId, title, \"order\", createdAt, updatedAt) VALUES ('c1', 'p1', 'Restored', 0, ?, ?)",
		)
		.run(now, now);
	const { archive } = await buildProjectBackup(sourceDb, 'p1');
	return archive;
}

function makeRequest(bytes: Uint8Array, params: Record<string, string>): Request {
	const search = new URLSearchParams(params).toString();
	const body = bytes.buffer.slice(
		bytes.byteOffset,
		bytes.byteOffset + bytes.byteLength,
	) as ArrayBuffer;
	return new Request(`http://localhost/api/restore/project?${search}`, {
		method: 'POST',
		headers: { 'content-type': 'application/octet-stream' },
		body,
	});
}

function makeEvent(req: Request) {
	return { request: req } as unknown as Parameters<Awaited<ReturnType<typeof loadHandler>>>[0];
}

describe('POST /api/restore/project', () => {
	beforeEach(() => {
		// each test gets the same mocked DB; nothing to reset here.
	});

	it('overwrites the project and returns 200 with snapshotPath', async () => {
		const POST = await loadHandler();
		const archive = await freshArchive();
		const response = (await POST(makeEvent(makeRequest(archive, { mode: 'overwrite', targetProjectId: 'p1' })))) as Response;
		expect(response.status).toBe(200);
		const body = (await response.json()) as { projectId: string; snapshotPath: string };
		expect(body.projectId).toBe('p1');
		expect(typeof body.snapshotPath).toBe('string');
	});

	it('copies the project under a fresh id and returns 200', async () => {
		const POST = await loadHandler();
		const archive = await freshArchive();
		const response = (await POST(makeEvent(makeRequest(archive, { mode: 'copy' })))) as Response;
		expect(response.status).toBe(200);
		const body = (await response.json()) as { projectId: string };
		expect(body.projectId).not.toBe('p1');
	});

	it('rejects an archive that is not a ZIP with 400', async () => {
		const POST = await loadHandler();
		const garbage = new Uint8Array([1, 2, 3, 4]);
		const response = (await POST(makeEvent(makeRequest(garbage, { mode: 'overwrite' })))) as Response;
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBe('restore_refused');
	});

	it('refuses an archive whose schema is too new with 422', async () => {
		const POST = await loadHandler();
		const zip = new JSZip();
		zip.file(
			'manifest.json',
			JSON.stringify({
				format: 'novellum.project.backup',
				formatVersion: 1,
				appVersion: '1.0.0',
				schemaVersion: 999,
				exportedAt: new Date().toISOString(),
				project: { id: 'p1', title: 'X', type: 'novel' },
				tables: {},
				compatibility: { minAppVersion: '99.0.0', createdBy: 'Novellum' },
			}),
		);
		const bytes = await zip.generateAsync({ type: 'uint8array' });
		const response = (await POST(makeEvent(makeRequest(bytes, { mode: 'overwrite' })))) as Response;
		expect(response.status).toBe(422);
	});
});
