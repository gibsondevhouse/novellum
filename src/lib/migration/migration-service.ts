import { db } from '$lib/legacy/dexie/db';
import { apiGet, apiPost } from '$lib/api-client.js';
import { getPreference, setPreference } from '$lib/preferences.js';
import type { Table } from 'dexie';
import type {
	MigrationResult,
	MigrationError,
	MigrationCallbacks,
	PreCheckResult,
} from './types.js';

export const MIGRATION_COMPLETE_KEY = 'migration.dexieToSqlite.completedAt';

export async function isMigrationComplete(): Promise<boolean> {
	const marker = await getPreference<string | null>(MIGRATION_COMPLETE_KEY, null);
	return typeof marker === 'string' && marker.length > 0;
}

export async function markMigrationComplete(): Promise<void> {
	await setPreference(MIGRATION_COMPLETE_KEY, new Date().toISOString());
}

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
		let dexieCount = 0;
		try {
			dexieCount = await (db[table] as Table).count();
		} catch {
			/* Dexie unavailable (e.g. fresh install, packaged app) → 0 */
		}

		let sqliteCount = 0;
		try {
			const sqliteRows = await apiGet<unknown[]>(apiPath);
			sqliteCount = sqliteRows.length;
		} catch {
			/* SQLite endpoint not reachable yet → report 0, surface in UI as
			   no-data state rather than a blocking error. */
		}

		results.push({
			table: table as string,
			dexieCount,
			sqliteCount,
		});
	}

	return results;
}

export async function migrate(callbacks?: MigrationCallbacks): Promise<MigrationResult> {
	if (await isMigrationComplete()) {
		return { tablesProcessed: 0, rowsMigrated: 0, errors: [], skipped: 0, alreadyComplete: true };
	}

	await db.open().catch(() => {});

	let tablesProcessed = 0;
	let rowsMigrated = 0;
	let rowsSkipped = 0;
	const errors: MigrationError[] = [];

	for (const { table, apiPath } of MIGRATION_TABLES) {
		const rows = await (db[table] as Table).toArray();
		callbacks?.onTableStart?.(table as string, rows.length);

		// Idempotency: load existing IDs from SQLite for this table.
		let existingIds = new Set<string>();
		try {
			const existing = await apiGet<{ id: string }[]>(apiPath);
			existingIds = new Set(existing.map((r) => r.id));
		} catch {
			/* if listing fails, fall back to per-row best-effort POST */
		}

		let tableMigrated = 0;
		let tableErrors = 0;
		let tableSkipped = 0;

		for (const row of rows) {
			const rowId = (row as { id?: string }).id ?? 'unknown';
			if (existingIds.has(rowId)) {
				tableSkipped++;
				continue;
			}
			try {
				await apiPost(apiPath, row);
				tableMigrated++;
			} catch (err) {
				tableErrors++;
				const message = err instanceof Error ? err.message : String(err);
				errors.push({ table: table as string, entityId: rowId, message });
				callbacks?.onError?.(table as string, rowId, message);
			}
		}

		rowsMigrated += tableMigrated;
		rowsSkipped += tableSkipped;
		tablesProcessed++;
		callbacks?.onTableComplete?.(table as string, tableMigrated, tableErrors);
	}

	if (errors.length === 0) {
		await markMigrationComplete();
	}

	return { tablesProcessed, rowsMigrated, errors, skipped: rowsSkipped, alreadyComplete: false };
}
