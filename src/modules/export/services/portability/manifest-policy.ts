import type { PortabilityManifest, CompatibilityResult, PortabilityErrorCode } from './types.js';

const CURRENT_FORMAT_VERSION = 1;
const CURRENT_DB_SCHEMA_VERSION = 8;

const REQUIRED_MANIFEST_FIELDS: (keyof PortabilityManifest)[] = [
	'formatVersion',
	'exportedAt',
	'appVersion',
	'dbSchemaVersion',
	'projectId',
	'tableCounts',
	'checksums',
];

/** Validate that a manifest object has the correct shape and required fields */
export function validateManifestShape(manifest: unknown): {
	valid: boolean;
	errors: PortabilityErrorCode[];
} {
	const errors: PortabilityErrorCode[] = [];

	if (manifest === null || manifest === undefined || typeof manifest !== 'object') {
		return { valid: false, errors: ['MALFORMED_MANIFEST'] };
	}

	const obj = manifest as Record<string, unknown>;

	for (const field of REQUIRED_MANIFEST_FIELDS) {
		if (!(field in obj)) {
			errors.push('MISSING_REQUIRED_FIELD');
			break;
		}
	}

	if (errors.length > 0) {
		return { valid: false, errors };
	}

	if (
		typeof obj.formatVersion !== 'number' ||
		!Number.isInteger(obj.formatVersion) ||
		obj.formatVersion < 1
	) {
		errors.push('MALFORMED_MANIFEST');
	}

	if (
		typeof obj.dbSchemaVersion !== 'number' ||
		!Number.isInteger(obj.dbSchemaVersion) ||
		obj.dbSchemaVersion < 1
	) {
		errors.push('MALFORMED_MANIFEST');
	}

	if (typeof obj.tableCounts === 'object' && obj.tableCounts !== null) {
		const counts = obj.tableCounts as Record<string, unknown>;
		for (const value of Object.values(counts)) {
			if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
				errors.push('INVALID_TABLE_COUNTS');
				break;
			}
		}
	} else {
		errors.push('INVALID_TABLE_COUNTS');
	}

	if (typeof obj.checksums === 'object' && obj.checksums !== null) {
		const sums = obj.checksums as Record<string, unknown>;
		for (const value of Object.values(sums)) {
			if (typeof value !== 'string' || value.length === 0) {
				errors.push('INVALID_CHECKSUMS');
				break;
			}
		}
	} else {
		errors.push('INVALID_CHECKSUMS');
	}

	return { valid: errors.length === 0, errors };
}

/** Check whether a validated manifest is compatible with the current runtime */
export function checkManifestCompatibility(manifest: PortabilityManifest): CompatibilityResult {
	const errors: PortabilityErrorCode[] = [];
	const warnings: string[] = [];

	if (manifest.formatVersion > CURRENT_FORMAT_VERSION) {
		errors.push('FUTURE_FORMAT_VERSION');
	}

	if (manifest.dbSchemaVersion > CURRENT_DB_SCHEMA_VERSION) {
		errors.push('FUTURE_DB_SCHEMA_VERSION');
	}

	if (manifest.dbSchemaVersion < CURRENT_DB_SCHEMA_VERSION) {
		warnings.push(
			`Backup uses older database schema version ${manifest.dbSchemaVersion} (current: ${CURRENT_DB_SCHEMA_VERSION}). Data will be migrated on import.`,
		);
	}

	return { compatible: errors.length === 0, errors, warnings };
}

/** Map error codes to human-readable messages */
export function getCompatibilityMessage(code: PortabilityErrorCode): string {
	const messages: Record<PortabilityErrorCode, string> = {
		MISSING_MANIFEST: 'Archive does not contain a manifest file.',
		MALFORMED_MANIFEST: 'Manifest file is not valid JSON.',
		MISSING_REQUIRED_FIELD: 'Manifest is missing one or more required fields.',
		FUTURE_FORMAT_VERSION:
			'This backup was created with a newer version of Novellum and cannot be imported.',
		FUTURE_DB_SCHEMA_VERSION: 'This backup uses a newer database schema and cannot be imported.',
		INVALID_TABLE_COUNTS: 'Manifest contains invalid table count values.',
		INVALID_CHECKSUMS: 'Manifest contains invalid checksum entries.',
		CHECKSUM_MISMATCH: 'Archive payload integrity check failed — file may be corrupted.',
	};
	return messages[code];
}
