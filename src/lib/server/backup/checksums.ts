import { createHash } from 'node:crypto';

/** SHA-256 hex digest of a string or byte array. */
export function sha256(input: string | Uint8Array): string {
	const hash = createHash('sha256');
	hash.update(typeof input === 'string' ? Buffer.from(input, 'utf8') : Buffer.from(input));
	return hash.digest('hex');
}

export interface ChecksumsFile {
	/** Canonical JSON ready to write into the archive as `checksums.json`. */
	readonly json: string;
	/** SHA-256 of `json` itself, useful for higher-level verification. */
	readonly sha256: string;
}

/**
 * Build the canonical `checksums.json` payload.
 *
 * Output is deterministic: keys are sorted lexicographically and
 * formatted with a stable two-space indent so identical inputs always
 * produce byte-identical output (and identical hashes).
 */
export function buildChecksumsFile(
	entries: Readonly<Record<string, Uint8Array | string>>,
): ChecksumsFile {
	const map: Record<string, string> = {};
	for (const key of Object.keys(entries).sort()) {
		map[key] = sha256(entries[key]);
	}
	const json = JSON.stringify(map, null, 2);
	return { json, sha256: sha256(json) };
}
