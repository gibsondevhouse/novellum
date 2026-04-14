import { db } from '$lib/db/index.js';
import { apiGet, apiPost } from '$lib/api-client.js';
import type { Table } from 'dexie';
import type {
	MigrationResult,
	MigrationError,
	MigrationCallbacks,
	PreCheckResult,
} from './types.js';

/**
 * Tables in dependency order: projects first, then content/bible entities, then auxiliary.
 * Each entry maps a Dexie table name to its API collection path.
 */
const MIGRATION_TABLES: { table: keyof typeof db; apiPath: string }[] = [
	{ table: 'projects', apiPath: '/api/db/projects' },
	{ table: 'chapters', apiPath: '/api/db/chapters' },
	{ table: 'scenes', apiPath: '/api/db/scenes' },
	{ table: 'beats', apiPath: '/api/db/beats' },
	{ table: 'characters', apiPath: '/api/db/characters' },
	{ table: 'character_relationships', apiPath: '/api/db/character_relationships' },
	{ table: 'locations', apiPath: '/api/db/locations' },
	{ table: 'lore_entries', apiPath: '/api/db/lore_entries' },
	{ table: 'plot_threads', apiPath: '/api/db/plot_threads' },
	{ table: 'timeline_events', apiPath: '/api/db/timeline_events' },
	{ table: 'consistency_issues', apiPath: '/api/db/consistency_issues' },
	{ table: 'export_settings', apiPath: '/api/db/export_settings' },
	{ table: 'scene_snapshots', apiPath: '/api/db/scene_snapshots' },
	{ table: 'story_frames', apiPath: '/api/db/story_frames' },
	{ table: 'acts', apiPath: '/api/db/acts' },
	{ table: 'arcs', apiPath: '/api/db/arcs' },
];

export async function preCheck(): Promise<PreCheckResult[]> {
	await db.open().catch(() => {});

	const results: PreCheckResult[] = [];

	for (const { table, apiPath } of MIGRATION_TABLES) {
		const dexieCount = await (db[table] as Table).count();
		const sqliteRows = await apiGet<unknown[]>(apiPath);
		results.push({
			table: table as string,
			dexieCount,
			sqliteCount: sqliteRows.length,
		});
	}

	return results;
}

export async function migrate(callbacks?: MigrationCallbacks): Promise<MigrationResult> {
	await db.open().catch(() => {});

	let tablesProcessed = 0;
	let rowsMigrated = 0;
	const errors: MigrationError[] = [];

	for (const { table, apiPath } of MIGRATION_TABLES) {
		const rows = await (db[table] as Table).toArray();
		callbacks?.onTableStart?.(table as string, rows.length);

		let tableMigrated = 0;
		let tableErrors = 0;

		for (const row of rows) {
			try {
				await apiPost(apiPath, row);
				tableMigrated++;
			} catch (err) {
				tableErrors++;
				const message = err instanceof Error ? err.message : String(err);
				const entityId = row.id ?? 'unknown';
				errors.push({ table: table as string, entityId, message });
				callbacks?.onError?.(table as string, entityId, message);
			}
		}

		rowsMigrated += tableMigrated;
		tablesProcessed++;
		callbacks?.onTableComplete?.(table as string, tableMigrated, tableErrors);
	}

	return { tablesProcessed, rowsMigrated, errors };
}
