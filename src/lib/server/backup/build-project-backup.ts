import JSZip from 'jszip';
import type Database from 'better-sqlite3';
import {
	getProjectBackupTables,
	type BackupTableEntry,
} from './table-registry.js';
import { buildManifest, type BackupManifest } from './manifest.js';
import { buildChecksumsFile } from './checksums.js';
import { MIGRATION_REGISTRY } from '../db/migration-registry.js';

export class ProjectNotFoundError extends Error {
	constructor(public readonly projectId: string) {
		super(`Project not found: ${projectId}`);
		this.name = 'ProjectNotFoundError';
	}
}

export interface BuildProjectBackupResult {
	readonly archive: Uint8Array;
	readonly manifest: BackupManifest;
	readonly filename: string;
}

/**
 * Stable, deterministic JSON for a row set: object keys sorted,
 * `undefined` coerced to `null`. The archive checksums depend on
 * this output being byte-stable across runs.
 */
function stableRowJson(rows: ReadonlyArray<Record<string, unknown>>): string {
	const normalized = rows.map((row) => {
		const out: Record<string, unknown> = {};
		for (const key of Object.keys(row).sort()) {
			const value = row[key];
			out[key] = value === undefined ? null : value;
		}
		return out;
	});
	return JSON.stringify(normalized, null, 2);
}

function loadRows(
	db: Database.Database,
	entry: BackupTableEntry,
	projectId: string,
): Array<Record<string, unknown>> {
	if (entry.name === 'projects') {
		const row = db
			.prepare('SELECT * FROM projects WHERE id = ?')
			.get(projectId) as Record<string, unknown> | undefined;
		if (!row) throw new ProjectNotFoundError(projectId);
		return [row];
	}
	const column = entry.projectIdColumn;
	if (!column) {
		throw new Error(
			`Registry entry for ${entry.name} is missing projectIdColumn but is included in backups`,
		);
	}
	// Table and column come from a code-controlled registry, never
	// from user input — safe to interpolate.
	return db
		.prepare(`SELECT * FROM "${entry.name}" WHERE "${column}" = ?`)
		.all(projectId) as Array<Record<string, unknown>>;
}

function slugifyTitle(title: string): string {
	const base = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return base.length > 0 ? base : 'project';
}

function todayIso(): string {
	return new Date().toISOString().slice(0, 10);
}

function maxRegistryVersion(): number {
	return MIGRATION_REGISTRY.reduce((max, m) => (m.version > max ? m.version : max), 0);
}

/**
 * Build a complete `.novellum` archive for the given project, reading
 * exclusively from SQLite. The archive layout follows research §6:
 *
 *     manifest.json
 *     db/<table>.json   (one per registered project table)
 *     checksums.json
 *     assets/
 *
 * Throws `ProjectNotFoundError` when the project row does not exist.
 */
export async function buildProjectBackup(
	db: Database.Database,
	projectId: string,
): Promise<BuildProjectBackupResult> {
	const tables = getProjectBackupTables();

	const tableJson: Record<string, string> = {};
	const tableCounts: Record<string, number> = {};
	let projectRow: Record<string, unknown> | undefined;

	for (const entry of tables) {
		const rows = loadRows(db, entry, projectId);
		if (entry.name === 'projects') projectRow = rows[0];
		tableJson[`db/${entry.name}.json`] = stableRowJson(rows);
		tableCounts[entry.name] = rows.length;
	}

	if (!projectRow) throw new ProjectNotFoundError(projectId);

	const manifest = buildManifest({
		project: {
			id: String(projectRow.id ?? projectId),
			title: String(projectRow.title ?? ''),
			type: String(projectRow.projectType ?? 'novel'),
		},
		schemaVersion: maxRegistryVersion(),
		tableCounts,
	});
	const manifestJson = JSON.stringify(manifest, null, 2);

	// Checksums cover the manifest and every db/*.json file. We do
	// not self-reference checksums.json itself.
	const checksumInputs: Record<string, string> = { 'manifest.json': manifestJson, ...tableJson };
	const { json: checksumsJson } = buildChecksumsFile(checksumInputs);

	const zip = new JSZip();
	zip.file('manifest.json', manifestJson);
	zip.file('checksums.json', checksumsJson);
	for (const [path, content] of Object.entries(tableJson)) zip.file(path, content);
	zip.folder('assets');

	const archive = await zip.generateAsync({ type: 'uint8array' });

	return {
		archive,
		manifest,
		filename: `${slugifyTitle(manifest.project.title)}_${todayIso()}.novellum`,
	};
}
