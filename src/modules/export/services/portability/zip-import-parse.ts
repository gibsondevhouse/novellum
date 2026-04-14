import JSZip from 'jszip';
import type { PortabilityManifest, CompatibilityResult, PortabilityErrorCode } from './types.js';
import { validateManifestShape, checkManifestCompatibility } from './manifest-policy.js';

export interface ParsedArchive {
	manifest: PortabilityManifest;
	dbPayloads: Record<string, unknown[]>;
	kvPayload: Record<string, string>;
	compatibility: CompatibilityResult;
}

export interface PreviewSummary {
	projectId: string;
	exportedAt: string;
	appVersion: string;
	dbSchemaVersion: number;
	tableCounts: Record<string, number>;
	kvKeyCount: number;
}

const ERROR_MESSAGES: Record<PortabilityErrorCode, string> = {
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

export class PortabilityParseError extends Error {
	code: PortabilityErrorCode;
	constructor(code: PortabilityErrorCode) {
		super(ERROR_MESSAGES[code]);
		this.code = code;
		this.name = 'PortabilityParseError';
	}
}

/**
 * SHA-256 hex digest of a string for checksum verification.
 */
async function sha256(content: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(content);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Parse and validate a portability backup archive from a File/Blob.
 * Returns parsed archive data or throws with a PortabilityErrorCode.
 */
export async function parseBackupArchive(file: File | Blob): Promise<ParsedArchive> {
	const zip = await JSZip.loadAsync(file);

	// Extract manifest
	const manifest = await readManifest(zip);

	// Validate shape
	const shapeResult = validateManifestShape(manifest);
	if (!shapeResult.valid) {
		throw new PortabilityParseError(shapeResult.errors[0] || 'MALFORMED_MANIFEST');
	}

	// Check compatibility
	const compatibility = checkManifestCompatibility(manifest as PortabilityManifest);
	if (!compatibility.compatible) {
		throw new PortabilityParseError(compatibility.errors[0]);
	}

	// Verify checksums
	await verifyChecksums(zip, manifest as PortabilityManifest);

	// Extract payloads
	const dbPayloads: Record<string, unknown[]> = {};
	for (const [path] of Object.entries((manifest as PortabilityManifest).checksums)) {
		if (path.startsWith('db/') && path.endsWith('.json')) {
			const tableName = path.slice(3, -5); // strip "db/" and ".json"
			const fileEntry = zip.file(path);
			if (fileEntry) {
				const content = await fileEntry.async('string');
				dbPayloads[tableName] = JSON.parse(content);
			}
		}
	}

	// Extract KV payload
	let kvPayload: Record<string, string> = {};
	const kvFile = zip.file('kv/localStorage.json');
	if (kvFile) {
		const kvContent = await kvFile.async('string');
		kvPayload = JSON.parse(kvContent);
	}

	return {
		manifest: manifest as PortabilityManifest,
		dbPayloads,
		kvPayload,
		compatibility,
	};
}

/**
 * Read and parse manifest.json from the archive.
 */
async function readManifest(zip: JSZip): Promise<unknown> {
	const manifestFile = zip.file('manifest.json');
	if (!manifestFile) {
		throw new PortabilityParseError('MISSING_MANIFEST');
	}
	const content = await manifestFile.async('string');
	try {
		return JSON.parse(content);
	} catch {
		throw new PortabilityParseError('MALFORMED_MANIFEST');
	}
}

/**
 * Verify SHA-256 checksums for all payload files listed in the manifest.
 */
async function verifyChecksums(zip: JSZip, manifest: PortabilityManifest): Promise<void> {
	for (const [path, expectedHash] of Object.entries(manifest.checksums)) {
		const fileEntry = zip.file(path);
		if (!fileEntry) {
			throw new PortabilityParseError('CHECKSUM_MISMATCH');
		}
		const content = await fileEntry.async('string');
		const actualHash = await sha256(content);
		if (actualHash !== expectedHash) {
			throw new PortabilityParseError('CHECKSUM_MISMATCH');
		}
	}
}

/**
 * Build a preview summary from a parsed archive for UI display.
 */
export function buildPreviewSummary(parsed: ParsedArchive): PreviewSummary {
	return {
		projectId: parsed.manifest.projectId,
		exportedAt: parsed.manifest.exportedAt,
		appVersion: parsed.manifest.appVersion,
		dbSchemaVersion: parsed.manifest.dbSchemaVersion,
		tableCounts: parsed.manifest.tableCounts,
		kvKeyCount: Object.keys(parsed.kvPayload).length,
	};
}
