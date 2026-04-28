import { db } from '$lib/legacy/dexie/db';
import type { ParsedArchive } from './zip-import-parse.js';

/** All table names that participate in portability restore */
const RESTORE_TABLES = [
	'projects',
	'chapters',
	'scenes',
	'beats',
	'characters',
	'character_relationships',
	'locations',
	'lore_entries',
	'plot_threads',
	'timeline_events',
	'consistency_issues',
	'export_settings',
	'scene_snapshots',
	'story_frames',
	'acts',
	'arcs',
] as const;

export interface RestoreResult {
	success: boolean;
	tablesRestored: number;
	rowsRestored: number;
	kvKeysRestored: number;
	error?: string;
}

/**
 * Restore a parsed backup archive into the current browser database.
 * V1 semantics: replace all data for the imported project.
 *
 * Strategy:
 * 1. Delete existing data for the project across all tables
 * 2. Bulk-insert imported rows
 * 3. Restore localStorage keys from KV payload
 *
 * All DB writes happen inside a single Dexie transaction for atomicity.
 */
export async function restoreBackupSnapshot(parsed: ParsedArchive): Promise<RestoreResult> {
	const { manifest, dbPayloads, kvPayload } = parsed;
	const projectId = manifest.projectId;
	let totalRows = 0;
	let tablesRestored = 0;

	try {
		// Run all DB writes in a single transaction
		await db.transaction('rw', db.tables, async () => {
			for (const tableName of RESTORE_TABLES) {
				const table = db.table(tableName);
				const rows = dbPayloads[tableName] ?? [];

				// Delete existing rows for this project
				if (tableName === 'projects') {
					await table.delete(projectId);
				} else {
					// Delete by projectId index
					try {
						await table.where('projectId').equals(projectId).delete();
					} catch {
						// Table might not have projectId index — delete matched rows manually
						const existing = (await table.toArray()) as Array<Record<string, unknown>>;
						const toDelete = existing
							.filter((row) => row.projectId === projectId)
							.map((row) => row.id as string);
						if (toDelete.length > 0) {
							await table.bulkDelete(toDelete);
						}
					}
				}

				// Bulk insert imported rows
				if (rows.length > 0) {
					await table.bulkAdd(rows);
					tablesRestored++;
					totalRows += rows.length;
				}
			}
		});

		// Restore localStorage keys (outside transaction — not Dexie)
		let kvKeysRestored = 0;
		for (const [key, value] of Object.entries(kvPayload)) {
			try {
				localStorage.setItem(key, value);
				kvKeysRestored++;
			} catch {
				// localStorage may be restricted
			}
		}

		return {
			success: true,
			tablesRestored,
			rowsRestored: totalRows,
			kvKeysRestored,
		};
	} catch (err) {
		return {
			success: false,
			tablesRestored: 0,
			rowsRestored: 0,
			kvKeysRestored: 0,
			error: err instanceof Error ? err.message : 'Restore failed',
		};
	}
}
