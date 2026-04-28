import { db } from '$lib/legacy/dexie/db';
import { isKeyAllowed } from './kv-registry.js';

/** All Dexie table names that should be included in a portability snapshot */
const SNAPSHOT_TABLES = [
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

export type DexieSnapshot = Record<string, unknown[]>;
export type KeyValueSnapshot = Record<string, string>;

export interface PortabilitySnapshot {
	dexie: DexieSnapshot;
	kv: KeyValueSnapshot;
	tableCounts: Record<string, number>;
}

/**
 * Extract all rows from configured Dexie tables for a given project.
 * Tables with projectId field are filtered; tables without (like projects) return all.
 * Results are sorted by `id` for deterministic output.
 */
export async function buildDexieSnapshot(projectId: string): Promise<DexieSnapshot> {
	const snapshot: DexieSnapshot = {};

	for (const tableName of SNAPSHOT_TABLES) {
		const table = db.table(tableName);
		let rows: unknown[];

		// Projects table: filter by id = projectId
		if (tableName === 'projects') {
			const project = await table.get(projectId);
			rows = project ? [project] : [];
		}
		// All other tables: filter by projectId
		else {
			try {
				rows = await table.where('projectId').equals(projectId).sortBy('id');
			} catch {
				// Table might not have projectId index — fall back to toArray + filter
				const all = await table.toArray();
				rows = (all as Array<Record<string, unknown>>)
					.filter((row) => row.projectId === projectId)
					.sort((a, b) => String(a.id ?? '').localeCompare(String(b.id ?? '')));
			}
		}

		snapshot[tableName] = rows;
	}

	return snapshot;
}

/**
 * Extract allowlisted localStorage keys.
 * Returns empty object if localStorage is unavailable.
 */
export function buildKeyValueSnapshot(): KeyValueSnapshot {
	const snapshot: KeyValueSnapshot = {};

	try {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && isKeyAllowed(key)) {
				const value = localStorage.getItem(key);
				if (value !== null) {
					snapshot[key] = value;
				}
			}
		}
	} catch {
		// localStorage may be unavailable in private browsing or restricted contexts
	}

	return snapshot;
}

/**
 * Build complete portability snapshot for a project.
 */
export async function buildPortabilitySnapshot(projectId: string): Promise<PortabilitySnapshot> {
	const dexie = await buildDexieSnapshot(projectId);
	const kv = buildKeyValueSnapshot();

	const tableCounts: Record<string, number> = {};
	for (const [table, rows] of Object.entries(dexie)) {
		tableCounts[table] = rows.length;
	}

	return { dexie, kv, tableCounts };
}
