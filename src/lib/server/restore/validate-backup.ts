/**
 * Validate a parsed `.novellum` archive without touching the live DB.
 *
 * `validateBackup` is total — it never throws on malformed-but-parseable
 * input. Every issue surfaces as a structured warning so the UI can
 * present a clear preview before any restore is committed.
 */
import { sha256 } from '$lib/server/backup/checksums.js';
import { getProjectBackupTables } from '$lib/server/backup/table-registry.js';
import {
	validateManifest,
	type BackupManifest,
} from '$lib/server/backup/manifest.js';
import { MIGRATION_REGISTRY } from '$lib/server/db/migration-registry.js';
import type { ParsedBackup } from './parse-backup.js';

export type RestoreWarningCode =
	| 'manifest_invalid'
	| 'missing_required_table'
	| 'unknown_table'
	| 'checksum_mismatch'
	| 'checksum_missing'
	| 'manifest_count_mismatch'
	| 'app_too_old';

export interface RestoreWarning {
	readonly code: RestoreWarningCode;
	readonly message: string;
	readonly detail?: Readonly<Record<string, string | number>>;
}

export type ChecksumStatus = 'ok' | 'mismatch' | 'absent';

export interface RestoreCompatibility {
	readonly canRestore: boolean;
	readonly bundledSchemaVersion: number;
	readonly archiveSchemaVersion: number;
}

export interface RestorePreview {
	readonly manifest: BackupManifest | null;
	readonly tableCounts: Readonly<Record<string, number>>;
	readonly checksumStatus: ChecksumStatus;
	readonly compatibility: RestoreCompatibility;
	readonly warnings: readonly RestoreWarning[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function bundledSchemaVersion(): number {
	return MIGRATION_REGISTRY.reduce((max, migration) => Math.max(max, migration.version), 0);
}

/** Produce a `RestorePreview` from a parsed backup. */
export function validateBackup(parsed: ParsedBackup): RestorePreview {
	const warnings: RestoreWarning[] = [];

	const manifestResult = validateManifest(parsed.manifest);
	const manifest = manifestResult.ok ? manifestResult.manifest : null;
	if (!manifestResult.ok) {
		warnings.push({
			code: 'manifest_invalid',
			message: manifestResult.reason,
		});
	}

	const tableCounts: Record<string, number> = {};
	for (const [name, file] of Object.entries(parsed.tableFiles)) {
		tableCounts[name] = file.rows.length;
	}

	// Missing required tables and unknown tables.
	const requiredTables = new Set(getProjectBackupTables().map((t) => t.name));
	for (const required of requiredTables) {
		if (!(required in parsed.tableFiles)) {
			warnings.push({
				code: 'missing_required_table',
				message: `archive is missing required table "${required}"`,
				detail: { table: required },
			});
		}
	}
	for (const present of Object.keys(parsed.tableFiles)) {
		if (!requiredTables.has(present)) {
			warnings.push({
				code: 'unknown_table',
				message: `archive contains unknown table "${present}" (will be ignored on restore)`,
				detail: { table: present },
			});
		}
	}

	// Checksums.
	const checksumStatus = verifyChecksums(parsed, warnings);

	// Manifest table-count cross-check.
	if (manifest) {
		for (const [tableName, manifestCount] of Object.entries(manifest.tables)) {
			const actual = tableCounts[tableName];
			if (actual === undefined) continue; // already reported as missing
			if (actual !== manifestCount) {
				warnings.push({
					code: 'manifest_count_mismatch',
					message: `manifest claims ${manifestCount} rows in "${tableName}" but archive contains ${actual}`,
					detail: { table: tableName, manifest: manifestCount, archive: actual },
				});
			}
		}
	}

	// Compatibility.
	const bundled = bundledSchemaVersion();
	const archiveVersion = manifest?.schemaVersion ?? 0;
	let canRestore = manifestResult.ok;
	if (manifest && manifest.schemaVersion > bundled) {
		canRestore = false;
		warnings.push({
			code: 'app_too_old',
			message: `archive was created with schema v${manifest.schemaVersion} but this build only understands up to v${bundled}`,
			detail: { archive: manifest.schemaVersion, bundled },
		});
	}

	return {
		manifest,
		tableCounts,
		checksumStatus,
		compatibility: {
			canRestore,
			bundledSchemaVersion: bundled,
			archiveSchemaVersion: archiveVersion,
		},
		warnings,
	};
}

function verifyChecksums(parsed: ParsedBackup, warnings: RestoreWarning[]): ChecksumStatus {
	if (parsed.checksums === null || parsed.checksums === undefined) {
		warnings.push({
			code: 'checksum_missing',
			message: 'archive does not contain checksums.json',
		});
		return 'absent';
	}
	if (!isPlainObject(parsed.checksums)) {
		warnings.push({
			code: 'checksum_missing',
			message: 'checksums.json is not an object',
		});
		return 'absent';
	}

	const expectations = parsed.checksums as Record<string, unknown>;
	const checked = new Map<string, { expected: string; actual: string }>();

	const manifestExpected = expectations['manifest.json'];
	if (typeof manifestExpected === 'string') {
		checked.set('manifest.json', {
			expected: manifestExpected,
			actual: sha256(parsed.manifestBytes),
		});
	}

	for (const [tableName, file] of Object.entries(parsed.tableFiles)) {
		const path = `db/${tableName}.json`;
		const expected = expectations[path];
		if (typeof expected !== 'string') continue;
		checked.set(path, {
			expected,
			actual: sha256(file.rawBytes),
		});
	}

	let anyMismatch = false;
	for (const [path, { expected, actual }] of checked) {
		if (expected !== actual) {
			anyMismatch = true;
			warnings.push({
				code: 'checksum_mismatch',
				message: `checksum mismatch for ${path}`,
				detail: { path, expected, actual },
			});
		}
	}

	return anyMismatch ? 'mismatch' : 'ok';
}
