/**
 * Apply a parsed `.novellum` archive to the live SQLite database
 * inside a single transaction.
 *
 * Two modes:
 * - `'overwrite'`: replace every row owned by `targetProjectId` with
 *   the rows in the archive. The project's id is preserved.
 * - `'copy'`: mint a fresh project id, remap every primary key and
 *   foreign key (including JSON id arrays) to fresh values, and
 *   insert the rewritten rows alongside any existing project.
 *
 * On any error the transaction rolls back; the live DB is byte-identical
 * to its pre-call state. A pre-restore SQLite snapshot is taken first
 * so a forensic recovery copy exists outside the transaction.
 */
import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import {
	getProjectBackupTables,
	getBackupTableEntry,
	type BackupTableEntry,
} from '$lib/server/backup/table-registry.js';
import { writePreMigrationSnapshot } from '$lib/server/db/snapshot.js';
import type { ParsedBackup } from './parse-backup.js';

export type RestoreMode = 'overwrite' | 'copy';

export interface RestoreInput {
	readonly mode: RestoreMode;
	/**
	 * Project id to overwrite. Required when `mode === 'overwrite'`.
	 * Ignored when `mode === 'copy'` (a fresh id is minted).
	 */
	readonly targetProjectId?: string;
	/** When `mode === 'copy'`, an explicit id to assign (otherwise UUID). */
	readonly newProjectId?: string;
}

export type RestoreErrorCode =
	| 'manifest_invalid'
	| 'project_id_mismatch'
	| 'project_id_collision'
	| 'unknown_table'
	| 'restore_failed';

export interface RestoreOk {
	readonly ok: true;
	readonly projectId: string;
	readonly snapshotPath: string;
	readonly mode: RestoreMode;
	readonly tableRowCounts: Readonly<Record<string, number>>;
}

export interface RestoreFail {
	readonly ok: false;
	readonly code: RestoreErrorCode;
	readonly message: string;
	readonly snapshotPath?: string;
}

export type RestoreResult = RestoreOk | RestoreFail;

interface ManifestShape {
	readonly project: { readonly id: string };
	readonly schemaVersion: number;
}

function readManifest(parsed: ParsedBackup): ManifestShape | null {
	const m = parsed.manifest;
	if (
		typeof m !== 'object' ||
		m === null ||
		typeof (m as { project?: unknown }).project !== 'object' ||
		(m as { project?: unknown }).project === null
	) {
		return null;
	}
	const project = (m as { project: Record<string, unknown> }).project;
	const schemaVersion = (m as { schemaVersion?: unknown }).schemaVersion;
	if (typeof project.id !== 'string' || typeof schemaVersion !== 'number') return null;
	return {
		project: { id: project.id },
		schemaVersion,
	};
}

/**
 * JSON-encoded id arrays declared per table. The restore-as-copy
 * rewriter parses these columns, remaps each id, and re-serialises.
 */
const JSON_ID_COLUMNS: Readonly<Record<string, readonly string[]>> = {
	chapters: ['arcRefs'],
	scenes: ['characterIds', 'locationIds', 'arcRefs'],
	locations: ['landmarkIds', 'factionIds', 'characterIds', 'threadIds'],
	plot_threads: ['relatedSceneIds', 'relatedCharacterIds'],
	timeline_events: ['relatedCharacterIds', 'relatedSceneIds'],
	consistency_issues: ['entityIds'],
	milestones: ['chapterIds'],
};

function isLikelyIdColumn(name: string): boolean {
	// e.g. "projectId", "characterAId", "sceneId", "ownerId", "actId".
	// Excludes plain "id" — that's the row's own primary key, handled separately.
	if (name === 'id') return false;
	return /Id$/.test(name);
}

function listAllRows(parsed: ParsedBackup): { entry: BackupTableEntry; rows: Record<string, unknown>[] }[] {
	const out: { entry: BackupTableEntry; rows: Record<string, unknown>[] }[] = [];
	for (const entry of getProjectBackupTables()) {
		const file = parsed.tableFiles[entry.name];
		if (!file) continue;
		const rows = file.rows.filter(
			(row): row is Record<string, unknown> =>
				typeof row === 'object' && row !== null && !Array.isArray(row),
		);
		out.push({ entry, rows });
	}
	return out;
}

function getColumnNames(db: Database.Database, table: string): string[] {
	const rows = db.prepare(`PRAGMA table_info("${table}")`).all() as { name: string }[];
	return rows.map((r) => r.name);
}

function buildInsertSql(table: string, columns: readonly string[]): string {
	const cols = columns.map((c) => `"${c}"`).join(', ');
	const placeholders = columns.map(() => '?').join(', ');
	return `INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`;
}

function coerceParam(value: unknown): string | number | bigint | Buffer | null {
	if (value === null || value === undefined) return null;
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return value;
	if (typeof value === 'boolean') return value ? 1 : 0;
	if (typeof value === 'bigint') return value;
	// JSON-serialise nested objects/arrays (registry-declared columns will
	// already be strings, so this is a defensive fallback).
	return JSON.stringify(value);
}

export function restoreProject(
	db: Database.Database,
	parsed: ParsedBackup,
	input: RestoreInput,
): RestoreResult {
	const manifest = readManifest(parsed);
	if (!manifest) {
		return { ok: false, code: 'manifest_invalid', message: 'archive manifest is unusable' };
	}

	// Sanity-check unknown tables before opening the transaction so we
	// don't roll back work just to surface a forwards-compat hint.
	for (const tableName of Object.keys(parsed.tableFiles)) {
		const entry = getBackupTableEntry(tableName);
		if (!entry || !entry.include) {
			return {
				ok: false,
				code: 'unknown_table',
				message: `archive contains table "${tableName}" not registered for restore`,
			};
		}
	}

	let snapshotPath: string;
	try {
		const snap = writePreMigrationSnapshot(db, manifest.schemaVersion, {
			kind: 'pre-restore',
			note: input.mode,
		});
		snapshotPath = snap.path;
	} catch (cause) {
		return {
			ok: false,
			code: 'restore_failed',
			message: `pre-restore snapshot failed: ${
				cause instanceof Error ? cause.message : String(cause)
			}`,
		};
	}

	const sourceProjectId = manifest.project.id;
	let effectiveProjectId: string;
	let rowsByTable: { entry: BackupTableEntry; rows: Record<string, unknown>[] }[];

	if (input.mode === 'overwrite') {
		const target = input.targetProjectId ?? sourceProjectId;
		if (target !== sourceProjectId) {
			return {
				ok: false,
				code: 'project_id_mismatch',
				message: `archive holds project "${sourceProjectId}" but target is "${target}"`,
				snapshotPath,
			};
		}
		effectiveProjectId = target;
		rowsByTable = listAllRows(parsed);
	} else {
		// copy mode
		effectiveProjectId = input.newProjectId ?? randomUUID();
		// Verify the new id does not collide with an existing project.
		const exists = db
			.prepare('SELECT 1 FROM projects WHERE id = ?')
			.get(effectiveProjectId) as { 1: number } | undefined;
		if (exists) {
			return {
				ok: false,
				code: 'project_id_collision',
				message: `project id "${effectiveProjectId}" already exists`,
				snapshotPath,
			};
		}
		rowsByTable = rewriteIdsForCopy(parsed, sourceProjectId, effectiveProjectId);
	}

	const tableRowCounts: Record<string, number> = {};
	const tx = db.transaction(() => {
		// Delete order: children first, then `projects` last, so the
		// project row is removed only after every dependent row.
		const projectsEntry = rowsByTable.find((r) => r.entry.name === 'projects')?.entry;
		const childEntries = rowsByTable.filter((r) => r.entry.name !== 'projects');

		if (input.mode === 'overwrite') {
			for (const { entry } of childEntries) {
				if (!entry.projectIdColumn) continue;
				db.prepare(
					`DELETE FROM "${entry.name}" WHERE "${entry.projectIdColumn}" = ?`,
				).run(effectiveProjectId);
			}
			if (projectsEntry) {
				db.prepare(`DELETE FROM "projects" WHERE id = ?`).run(effectiveProjectId);
			}
		}
		// In copy mode we skip deletions — fresh id avoids conflicts.

		// Insert order: parent first, then children.
		const insertEntry = (name: string, rows: Record<string, unknown>[]) => {
			if (rows.length === 0) {
				tableRowCounts[name] = 0;
				return;
			}
			const columns = getColumnNames(db, name);
			const sql = buildInsertSql(name, columns);
			const stmt = db.prepare(sql);
			for (const row of rows) {
				const params = columns.map((col) => coerceParam(row[col]));
				stmt.run(params);
			}
			tableRowCounts[name] = rows.length;
		};

		const projectsRows = rowsByTable.find((r) => r.entry.name === 'projects')?.rows ?? [];
		insertEntry('projects', projectsRows);
		for (const { entry, rows } of childEntries) {
			insertEntry(entry.name, rows);
		}
	});

	try {
		tx();
	} catch (cause) {
		return {
			ok: false,
			code: 'restore_failed',
			message: cause instanceof Error ? cause.message : String(cause),
			snapshotPath,
		};
	}

	return {
		ok: true,
		projectId: effectiveProjectId,
		snapshotPath,
		mode: input.mode,
		tableRowCounts,
	};
}

/**
 * Walk every row of every backup table, mint a fresh UUID for each
 * primary-key id, and rewrite all foreign-key references (including
 * JSON id arrays) to use the new ids. The mapping also rewrites the
 * source project's id to the freshly-minted one.
 */
function rewriteIdsForCopy(
	parsed: ParsedBackup,
	sourceProjectId: string,
	newProjectId: string,
): { entry: BackupTableEntry; rows: Record<string, unknown>[] }[] {
	const idMap = new Map<string, string>();
	idMap.set(sourceProjectId, newProjectId);

	const tables = listAllRows(parsed);

	// Pass 1: collect every `id` value as an old-PK and mint a new UUID.
	for (const { entry, rows } of tables) {
		if (entry.name === 'projects') continue; // already mapped above
		for (const row of rows) {
			const id = row.id;
			if (typeof id !== 'string' || id.length === 0) continue;
			if (!idMap.has(id)) idMap.set(id, randomUUID());
		}
	}

	// Pass 2: rewrite columns.
	const remapped: { entry: BackupTableEntry; rows: Record<string, unknown>[] }[] = [];
	for (const { entry, rows } of tables) {
		const jsonCols = JSON_ID_COLUMNS[entry.name] ?? [];
		const out: Record<string, unknown>[] = rows.map((row) => {
			const next: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(row)) {
				if (key === 'id' && typeof value === 'string') {
					next[key] = idMap.get(value) ?? value;
				} else if (key === 'projectId') {
					next[key] = newProjectId;
				} else if (jsonCols.includes(key) && typeof value === 'string') {
					next[key] = remapJsonIdArray(value, idMap);
				} else if (typeof value === 'string' && isLikelyIdColumn(key)) {
					next[key] = idMap.get(value) ?? value;
				} else {
					next[key] = value;
				}
			}
			return next;
		});
		remapped.push({ entry, rows: out });
	}

	return remapped;
}

function remapJsonIdArray(raw: string, idMap: ReadonlyMap<string, string>): string {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return raw;
	}
	if (!Array.isArray(parsed)) return raw;
	const remapped = parsed.map((item) =>
		typeof item === 'string' ? (idMap.get(item) ?? item) : item,
	);
	return JSON.stringify(remapped);
}
