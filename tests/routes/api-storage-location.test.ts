import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'novellum-storage-loc-'));
	process.env.NOVELLUM_APP_DATA_DIR = dir;
	process.env.NOVELLUM_DB_PATH = join(dir, 'novellum.db');
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
	delete process.env.NOVELLUM_APP_DATA_DIR;
	delete process.env.NOVELLUM_DB_PATH;
	vi.restoreAllMocks();
	vi.resetModules();
});

async function loadHandler() {
	return import('../../src/routes/api/settings/storage-location/+server.js');
}

describe('GET /api/settings/storage-location', () => {
	it('returns the resolved DB + app-data + backup + log paths', async () => {
		const { GET } = await loadHandler();
		const res = await GET({} as Parameters<typeof GET>[0]);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.mode).toBe('override');
		expect(body.databasePath).toBe(join(dir, 'novellum.db'));
		expect(body.appDataDirectory).toBe(dir);
		expect(body.backupDirectory).toBe(join(dir, 'backups'));
		expect(body.logDirectory).toBe(join(dir, 'logs'));
	});

	it('reports a disk-space block on a real volume', async () => {
		const { GET } = await loadHandler();
		const res = await GET({} as Parameters<typeof GET>[0]);
		const body = await res.json();

		// Real volumes return a positive bytesTotal; CI mounts can return
		// null or zero — both are acceptable, but the shape must hold.
		if (body.diskSpace !== null) {
			expect(body.diskSpace).toHaveProperty('bytesFree');
			expect(body.diskSpace).toHaveProperty('bytesTotal');
			expect(typeof body.diskSpace.bytesFree).toBe('number');
			expect(typeof body.diskSpace.bytesTotal).toBe('number');
		}
	});

	it('falls back to diskSpace=null when statfs cannot read the path', async () => {
		// Point at a non-existent directory so statfs raises ENOENT.
		const ghost = join(dir, 'never-created');
		process.env.NOVELLUM_APP_DATA_DIR = ghost;

		const { GET } = await loadHandler();
		const res = await GET({} as Parameters<typeof GET>[0]);
		const body = await res.json();

		expect(body.diskSpace).toBeNull();
	});

	it('never echoes credential or environment-variable values', async () => {
		process.env.NOVELLUM_SOMETHING_SECRET = 'sk-or-v1-NEVER-LEAK-1234567890';
		try {
			const { GET } = await loadHandler();
			const res = await GET({} as Parameters<typeof GET>[0]);
			const text = await res.text();
			expect(text).not.toContain('sk-or-v1-NEVER-LEAK-1234567890');
		} finally {
			delete process.env.NOVELLUM_SOMETHING_SECRET;
		}
	});
});
