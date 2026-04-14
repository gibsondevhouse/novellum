import JSZip from 'jszip';
import type { PortabilityManifest } from './types.js';
import { buildPortabilitySnapshot } from './snapshot-service.js';

const CURRENT_FORMAT_VERSION = 1;
const CURRENT_DB_SCHEMA_VERSION = 8;
const APP_VERSION = '0.1.0';

/**
 * Compute a SHA-256 hex digest of a string payload.
 * Uses the Web Crypto API (available in browsers and Node 18+).
 */
async function sha256(content: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(content);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Build a complete backup archive for a project.
 * Returns the archive as a Blob and the manifest for inspection.
 */
export async function buildBackupArchive(
	projectId: string,
): Promise<{ blob: Blob; manifest: PortabilityManifest }> {
	const snapshot = await buildPortabilitySnapshot(projectId);
	const zip = new JSZip();
	const checksums: Record<string, string> = {};

	// Add each table as db/<table>.json
	for (const [tableName, rows] of Object.entries(snapshot.dexie)) {
		const path = `db/${tableName}.json`;
		const content = JSON.stringify(rows, null, 2);
		zip.file(path, content);
		checksums[path] = await sha256(content);
	}

	// Add KV snapshot
	const kvContent = JSON.stringify(snapshot.kv, null, 2);
	const kvPath = 'kv/localStorage.json';
	zip.file(kvPath, kvContent);
	checksums[kvPath] = await sha256(kvContent);

	// Build manifest
	const manifest: PortabilityManifest = {
		formatVersion: CURRENT_FORMAT_VERSION,
		exportedAt: new Date().toISOString(),
		appVersion: APP_VERSION,
		dbSchemaVersion: CURRENT_DB_SCHEMA_VERSION,
		projectId,
		tableCounts: snapshot.tableCounts,
		checksums,
	};

	zip.file('manifest.json', JSON.stringify(manifest, null, 2));

	const blob = await zip.generateAsync({
		type: 'blob',
		compression: 'DEFLATE',
		compressionOptions: { level: 6 },
	});
	return { blob, manifest };
}

/**
 * Generate a safe filename for a backup archive.
 */
export function createBackupFilename(projectTitle: string, exportedAt?: string): string {
	const safeName =
		projectTitle
			.replace(/[^a-z0-9\s-]/gi, '')
			.replace(/\s+/g, '_')
			.toLowerCase()
			.slice(0, 50) || 'project';
	const datePart = (exportedAt ?? new Date().toISOString()).slice(0, 10);
	return `${safeName}_${datePart}.novellum.zip`;
}
