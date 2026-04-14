import { describe, it, expect } from 'vitest';
import {
	validateManifestShape,
	checkManifestCompatibility,
	getCompatibilityMessage,
} from '../portability/manifest-policy.js';
import type { PortabilityManifest, PortabilityErrorCode } from '../portability/types.js';

const validManifest = {
	formatVersion: 1,
	exportedAt: '2026-04-13T12:00:00.000Z',
	appVersion: '0.1.0',
	dbSchemaVersion: 8,
	projectId: 'test-project-id',
	tableCounts: { projects: 1, chapters: 3, scenes: 5 },
	checksums: { 'db/projects.json': 'abc123', 'db/chapters.json': 'def456' },
};

describe('validateManifestShape', () => {
	it('accepts a valid manifest', () => {
		const result = validateManifestShape(validManifest);
		expect(result.valid).toBe(true);
		expect(result.errors).toEqual([]);
	});

	it('rejects null', () => {
		const result = validateManifestShape(null);
		expect(result.valid).toBe(false);
		expect(result.errors).toContain('MALFORMED_MANIFEST');
	});

	it('rejects undefined', () => {
		const result = validateManifestShape(undefined);
		expect(result.valid).toBe(false);
		expect(result.errors).toContain('MALFORMED_MANIFEST');
	});

	it('detects missing required fields', () => {
		const { formatVersion: _fv, ...incomplete } = validManifest;
		const result = validateManifestShape(incomplete);
		expect(result.valid).toBe(false);
		expect(result.errors).toContain('MISSING_REQUIRED_FIELD');
	});

	it('rejects negative tableCounts', () => {
		const manifest = { ...validManifest, tableCounts: { projects: -1 } };
		const result = validateManifestShape(manifest);
		expect(result.valid).toBe(false);
		expect(result.errors).toContain('INVALID_TABLE_COUNTS');
	});

	it('rejects empty checksum strings', () => {
		const manifest = { ...validManifest, checksums: { 'db/projects.json': '' } };
		const result = validateManifestShape(manifest);
		expect(result.valid).toBe(false);
		expect(result.errors).toContain('INVALID_CHECKSUMS');
	});
});

describe('checkManifestCompatibility', () => {
	it('accepts current version manifest', () => {
		const result = checkManifestCompatibility(validManifest as PortabilityManifest);
		expect(result.compatible).toBe(true);
		expect(result.errors).toEqual([]);
		expect(result.warnings).toEqual([]);
	});

	it('accepts older schema version with warning', () => {
		const manifest = { ...validManifest, dbSchemaVersion: 5 } as PortabilityManifest;
		const result = checkManifestCompatibility(manifest);
		expect(result.compatible).toBe(true);
		expect(result.errors).toEqual([]);
		expect(result.warnings.length).toBe(1);
		expect(result.warnings[0]).toContain('older database schema');
	});

	it('rejects future format version', () => {
		const manifest = { ...validManifest, formatVersion: 99 } as PortabilityManifest;
		const result = checkManifestCompatibility(manifest);
		expect(result.compatible).toBe(false);
		expect(result.errors).toContain('FUTURE_FORMAT_VERSION');
	});

	it('rejects future db schema version', () => {
		const manifest = { ...validManifest, dbSchemaVersion: 99 } as PortabilityManifest;
		const result = checkManifestCompatibility(manifest);
		expect(result.compatible).toBe(false);
		expect(result.errors).toContain('FUTURE_DB_SCHEMA_VERSION');
	});
});

describe('getCompatibilityMessage', () => {
	it('returns correct message for each code', () => {
		const codes: PortabilityErrorCode[] = [
			'MISSING_MANIFEST',
			'MALFORMED_MANIFEST',
			'MISSING_REQUIRED_FIELD',
			'FUTURE_FORMAT_VERSION',
			'FUTURE_DB_SCHEMA_VERSION',
			'INVALID_TABLE_COUNTS',
			'INVALID_CHECKSUMS',
			'CHECKSUM_MISMATCH',
		];

		for (const code of codes) {
			const message = getCompatibilityMessage(code);
			expect(typeof message).toBe('string');
			expect(message.length).toBeGreaterThan(0);
		}
	});
});
