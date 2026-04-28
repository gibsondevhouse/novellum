import { APP_VERSION } from '$lib/version.js';

/** Wire format identifier embedded in every `.novellum` manifest. */
export const BACKUP_FORMAT = 'novellum.project.backup' as const;

/**
 * Manifest format version. Bump when we change the manifest shape in
 * a backwards-incompatible way. The reader (`validateManifest`)
 * refuses any value greater than this.
 */
export const BACKUP_FORMAT_VERSION = 1 as const;

export interface BackupManifestProject {
	readonly id: string;
	readonly title: string;
	readonly type: string;
}

export interface BackupManifestCompatibility {
	readonly minAppVersion: string;
	readonly createdBy: string;
}

export interface BackupManifest {
	readonly format: typeof BACKUP_FORMAT;
	readonly formatVersion: number;
	readonly appVersion: string;
	readonly schemaVersion: number;
	readonly exportedAt: string;
	readonly project: BackupManifestProject;
	readonly tables: Readonly<Record<string, number>>;
	readonly compatibility: BackupManifestCompatibility;
}

export interface BuildManifestInput {
	readonly project: BackupManifestProject;
	readonly schemaVersion: number;
	readonly tableCounts: Readonly<Record<string, number>>;
	readonly exportedAt?: string;
	readonly minAppVersion?: string;
}

/** Build a fresh manifest for a new backup archive. */
export function buildManifest(input: BuildManifestInput): BackupManifest {
	return {
		format: BACKUP_FORMAT,
		formatVersion: BACKUP_FORMAT_VERSION,
		appVersion: APP_VERSION,
		schemaVersion: input.schemaVersion,
		exportedAt: input.exportedAt ?? new Date().toISOString(),
		project: { ...input.project },
		tables: { ...input.tableCounts },
		compatibility: {
			minAppVersion: input.minAppVersion ?? APP_VERSION,
			createdBy: 'Novellum',
		},
	};
}

export type ValidateManifestResult =
	| { ok: true; manifest: BackupManifest }
	| { ok: false; reason: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate an arbitrary value parsed from a backup archive's
 * `manifest.json`. Never throws — returns a structured result so
 * callers can surface a precise reason to the user.
 */
export function validateManifest(value: unknown): ValidateManifestResult {
	if (!isPlainObject(value)) return { ok: false, reason: 'manifest is not an object' };

	if (value.format !== BACKUP_FORMAT) {
		return { ok: false, reason: `unsupported format: ${String(value.format)}` };
	}
	if (typeof value.formatVersion !== 'number' || !Number.isInteger(value.formatVersion)) {
		return { ok: false, reason: 'formatVersion must be an integer' };
	}
	if (value.formatVersion < 1 || value.formatVersion > BACKUP_FORMAT_VERSION) {
		return {
			ok: false,
			reason: `unsupported formatVersion: ${value.formatVersion} (this build supports up to ${BACKUP_FORMAT_VERSION})`,
		};
	}
	if (typeof value.appVersion !== 'string' || value.appVersion.length === 0) {
		return { ok: false, reason: 'appVersion missing or empty' };
	}
	if (typeof value.schemaVersion !== 'number' || !Number.isInteger(value.schemaVersion)) {
		return { ok: false, reason: 'schemaVersion must be an integer' };
	}
	if (typeof value.exportedAt !== 'string' || Number.isNaN(Date.parse(value.exportedAt))) {
		return { ok: false, reason: 'exportedAt must be an ISO timestamp' };
	}

	if (!isPlainObject(value.project)) {
		return { ok: false, reason: 'project must be an object' };
	}
	const project = value.project;
	if (typeof project.id !== 'string' || project.id.length === 0) {
		return { ok: false, reason: 'project.id missing or empty' };
	}
	if (typeof project.title !== 'string') {
		return { ok: false, reason: 'project.title must be a string' };
	}
	if (typeof project.type !== 'string') {
		return { ok: false, reason: 'project.type must be a string' };
	}

	if (!isPlainObject(value.tables)) {
		return { ok: false, reason: 'tables must be an object' };
	}
	for (const [name, count] of Object.entries(value.tables)) {
		if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
			return {
				ok: false,
				reason: `tables.${name} must be a non-negative integer (got ${String(count)})`,
			};
		}
	}

	if (!isPlainObject(value.compatibility)) {
		return { ok: false, reason: 'compatibility must be an object' };
	}
	const compat = value.compatibility;
	if (typeof compat.minAppVersion !== 'string' || compat.minAppVersion.length === 0) {
		return { ok: false, reason: 'compatibility.minAppVersion missing or empty' };
	}
	if (typeof compat.createdBy !== 'string' || compat.createdBy.length === 0) {
		return { ok: false, reason: 'compatibility.createdBy missing or empty' };
	}

	return {
		ok: true,
		manifest: {
			format: BACKUP_FORMAT,
			formatVersion: value.formatVersion,
			appVersion: value.appVersion,
			schemaVersion: value.schemaVersion,
			exportedAt: value.exportedAt,
			project: {
				id: project.id,
				title: project.title,
				type: project.type,
			},
			tables: { ...(value.tables as Record<string, number>) },
			compatibility: {
				minAppVersion: compat.minAppVersion,
				createdBy: compat.createdBy,
			},
		},
	};
}
