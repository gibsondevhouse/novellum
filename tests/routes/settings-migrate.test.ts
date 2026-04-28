import { describe, it, expect } from 'vitest';
import {
	buildEvidenceLog,
	evidenceLogFilename,
	type MigrateTableSnapshot,
} from '../../src/routes/settings/migrate/evidence-log.js';
import type { MigrationError, MigrationResult } from '../../src/lib/migration/index.js';

describe('migration evidence log', () => {
	const sampleTables: MigrateTableSnapshot[] = [
		{
			table: 'projects',
			dexieCount: 2,
			sqliteCount: 0,
			migrated: 2,
			errors: 0,
			status: 'done',
		},
		{
			table: 'scenes',
			dexieCount: 8,
			sqliteCount: 0,
			migrated: 6,
			errors: 2,
			status: 'error',
		},
	];

	const sampleErrors: MigrationError[] = [
		{ table: 'scenes', entityId: 's1', message: 'duplicate key' },
		{ table: 'scenes', entityId: 's2', message: 'fk violation' },
	];

	const sampleResult: MigrationResult = {
		tablesProcessed: 2,
		rowsMigrated: 8,
		errors: sampleErrors,
		skipped: 0,
		alreadyComplete: false,
	};

	it('builds a stable evidence log shape', () => {
		const log = buildEvidenceLog({
			tables: sampleTables,
			errors: sampleErrors,
			result: sampleResult,
			completedAt: '2026-04-28T10:00:00.000Z',
			generatedAt: '2026-04-28T10:00:01.000Z',
		});

		expect(log).toMatchObject({
			generatedAt: '2026-04-28T10:00:01.000Z',
			completedAt: '2026-04-28T10:00:00.000Z',
			totalMigrated: 8,
			totalErrors: 2,
		});
		expect(log.tables).toHaveLength(2);
		expect(log.errors).toHaveLength(2);
		expect(log.result).not.toBeNull();
		expect(log.result?.rowsMigrated).toBe(8);
	});

	it('sums totalMigrated from per-table snapshots', () => {
		const log = buildEvidenceLog({
			tables: sampleTables,
			errors: [],
			result: null,
			completedAt: null,
		});
		expect(log.totalMigrated).toBe(8);
		expect(log.totalErrors).toBe(0);
		expect(log.result).toBeNull();
	});

	it('does not retain references to caller arrays', () => {
		const tables = [...sampleTables];
		const errors = [...sampleErrors];
		const log = buildEvidenceLog({
			tables,
			errors,
			result: null,
			completedAt: null,
			generatedAt: '2026-04-28T10:00:01.000Z',
		});
		tables.push({
			table: 'rogue',
			dexieCount: 0,
			sqliteCount: 0,
			migrated: 0,
			errors: 0,
			status: 'pending',
		});
		errors.push({ table: 'rogue', entityId: 'r', message: 'late' });
		expect(log.tables).toHaveLength(2);
		expect(log.errors).toHaveLength(2);
	});

	it('produces a filesystem-safe filename from generatedAt', () => {
		const filename = evidenceLogFilename('2026-04-28T10:00:01.123Z');
		expect(filename).toBe('novellum-migration-2026-04-28T10-00-01-123Z.json');
		expect(filename).not.toContain(':');
		// Only the .json suffix may contain a dot.
		expect(filename.replace(/\.json$/, '')).not.toContain('.');
	});

	it('falls back to a generated timestamp when none is provided', () => {
		const log = buildEvidenceLog({
			tables: [],
			errors: [],
			result: null,
			completedAt: null,
		});
		expect(log.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
	});
});
