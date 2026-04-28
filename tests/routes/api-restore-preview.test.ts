/**
 * Smoke-tests the `POST /api/restore/preview` route handler with both
 * happy and error paths. Heavy lifting (parse + validate) is covered
 * by tests/backup/{parse-backup,corrupt-backup}.test.ts.
 */
import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';
import { buildProjectBackup } from '$lib/server/backup/build-project-backup.js';
import { POST } from '../../src/routes/api/restore/preview/+server.js';

function freshDb() {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	const now = '2026-04-01T00:00:00.000Z';
	db.prepare(
		"INSERT INTO projects (id, title, projectType, createdAt, updatedAt) VALUES ('p1', 'My', 'novel', ?, ?)",
	).run(now, now);
	return db;
}

function makeBinaryRequest(bytes: Uint8Array): Request {
	const body = bytes.buffer.slice(
		bytes.byteOffset,
		bytes.byteOffset + bytes.byteLength,
	) as ArrayBuffer;
	return new Request('http://localhost/api/restore/preview', {
		method: 'POST',
		headers: { 'content-type': 'application/octet-stream' },
		body,
	});
}

function makeEvent(request: Request): Parameters<typeof POST>[0] {
	return { request } as unknown as Parameters<typeof POST>[0];
}

describe('POST /api/restore/preview', () => {
	it('returns the preview JSON for a valid archive', async () => {
		const db = freshDb();
		const { archive } = await buildProjectBackup(db, 'p1');
		const response = (await POST(makeEvent(makeBinaryRequest(archive)))) as Response;
		expect(response.status).toBe(200);
		const body = (await response.json()) as { warnings: unknown[]; compatibility: { canRestore: boolean } };
		expect(body.warnings).toEqual([]);
		expect(body.compatibility.canRestore).toBe(true);
	});

	it('returns 400 with parse_failed for a truncated archive', async () => {
		const db = freshDb();
		const { archive } = await buildProjectBackup(db, 'p1');
		const truncated = archive.slice(0, 80);
		const response = (await POST(makeEvent(makeBinaryRequest(truncated)))) as Response;
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBe('parse_failed');
	});

	it('returns 400 when content-type is unsupported', async () => {
		const request = new Request('http://localhost/api/restore/preview', {
			method: 'POST',
			headers: { 'content-type': 'text/plain' },
			body: 'nope',
		});
		const response = (await POST(makeEvent(request))) as Response;
		expect(response.status).toBe(400);
	});
});
