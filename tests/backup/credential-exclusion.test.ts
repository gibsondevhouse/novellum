import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import JSZip from 'jszip';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';
import { buildProjectBackup } from '$lib/server/backup/build-project-backup.js';

const SECRET = 'sk-or-v1-FAKE-CREDENTIAL-FOR-TEST-DO-NOT-LEAK';

describe('credential exclusion', () => {
	it('app_preferences (which can hold tokens) is not bundled into the backup', async () => {
		const db = new Database(':memory:');
		runMigrations(db, MIGRATION_REGISTRY);
		const now = '2026-04-01T00:00:00.000Z';

		db.prepare(
			"INSERT INTO projects (id, title, createdAt, updatedAt) VALUES ('p1', 'P', ?, ?)",
		).run(now, now);
		db.prepare(
			'INSERT INTO app_preferences (key, value, updatedAt) VALUES (?, ?, ?)',
		).run('openrouter.apiKey', SECRET, now);

		const { archive } = await buildProjectBackup(db, 'p1');
		const zip = await JSZip.loadAsync(archive);

		// Hard requirement: archive must not contain the secret in any file.
		for (const path of Object.keys(zip.files)) {
			const file = zip.file(path);
			if (!file || file.dir) continue;
			const text = await file.async('string');
			expect(text.includes(SECRET), `secret leaked into ${path}`).toBe(false);
		}

		// And there must be no app_preferences.json — that table is excluded.
		expect(zip.file('db/app_preferences.json')).toBeNull();

		db.close();
	});
});
