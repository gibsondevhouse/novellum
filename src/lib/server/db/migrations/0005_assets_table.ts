import type { Migration } from '../migration-runner.js';

export const migration0005: Migration = {
	version: 5,
	name: '0005_assets_table',
	checksum: 'assets-table-v1',
	up(db) {
		db.exec(`
			CREATE TABLE IF NOT EXISTS assets (
				id TEXT PRIMARY KEY,
				projectId TEXT NOT NULL,
				name TEXT NOT NULL,
				mimeType TEXT NOT NULL DEFAULT '',
				data TEXT NOT NULL DEFAULT '',
				sizeBytes INTEGER NOT NULL DEFAULT 0,
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			);
		`);
		db.exec('CREATE INDEX IF NOT EXISTS idx_assets_projectId ON assets(projectId);');
	},
};
