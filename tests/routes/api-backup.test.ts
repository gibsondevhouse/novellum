/**
 * Smoke-tests the `POST /api/backup/projects/[id]` route handler.
 * Replaces the singleton `db` export with an in-memory database so
 * the handler runs end-to-end without touching disk. Deeper behaviour
 * is covered by tests/backup/project-backup.test.ts.
 */
import { describe, it, expect, vi } from 'vitest';
import JSZip from 'jszip';

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

	return { ...actual, db: memDb };
});

async function loadHandler() {
	const mod = await import('../../src/routes/api/backup/projects/[id]/+server.js');
	return mod.POST;
}

function makeEvent(id: string): Parameters<Awaited<ReturnType<typeof loadHandler>>>[0] {
	return { params: { id } } as unknown as Parameters<
		Awaited<ReturnType<typeof loadHandler>>
	>[0];
}

describe('POST /api/backup/projects/[id]', () => {
	it('returns a .novellum archive for an existing project', async () => {
		const POST = await loadHandler();
		const response = (await POST(makeEvent('p1'))) as Response;

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toContain('zip');
		expect(response.headers.get('X-Novellum-Backup-Format')).toBe('novellum.project.backup');
		expect(response.headers.get('Content-Disposition')).toMatch(/\.novellum"$/);

		const buffer = new Uint8Array(await response.arrayBuffer());
		const zip = await JSZip.loadAsync(buffer);
		expect(zip.file('manifest.json')).not.toBeNull();
	});

	it('returns 404 for a missing project', async () => {
		const POST = await loadHandler();
		const response = (await POST(makeEvent('nope'))) as Response;
		expect(response.status).toBe(404);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBe('project_not_found');
	});
});
