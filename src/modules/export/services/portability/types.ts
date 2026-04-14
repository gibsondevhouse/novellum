/** Portability manifest embedded in every backup archive */
export interface PortabilityManifest {
	formatVersion: number;
	exportedAt: string;
	appVersion: string;
	dbSchemaVersion: number;
	projectId: string;
	tableCounts: Record<string, number>;
	checksums: Record<string, string>;
}

/** Index of payload files inside the archive */
export interface BackupPayloadIndex {
	dbTables: string[];
	kvFile: string | null;
}

/** Result of compatibility check */
export interface CompatibilityResult {
	compatible: boolean;
	errors: PortabilityErrorCode[];
	warnings: string[];
}

/** Exhaustive error codes for portability failures */
export type PortabilityErrorCode =
	| 'MISSING_MANIFEST'
	| 'MALFORMED_MANIFEST'
	| 'MISSING_REQUIRED_FIELD'
	| 'FUTURE_FORMAT_VERSION'
	| 'FUTURE_DB_SCHEMA_VERSION'
	| 'INVALID_TABLE_COUNTS'
	| 'INVALID_CHECKSUMS'
	| 'CHECKSUM_MISMATCH';
