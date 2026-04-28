import type { MigrationError, MigrationResult } from '$lib/migration/index.js';

export interface MigrateTableSnapshot {
	table: string;
	dexieCount: number;
	sqliteCount: number;
	migrated: number;
	errors: number;
	status: 'pending' | 'migrating' | 'done' | 'error';
}

export interface MigrationEvidenceLog {
	generatedAt: string;
	completedAt: string | null;
	totalMigrated: number;
	totalErrors: number;
	tables: MigrateTableSnapshot[];
	errors: MigrationError[];
	result: MigrationResult | null;
}

/**
 * Builds a portable evidence log of the migration run for download.
 *
 * The shape is stable and consumed only by the user (and support staff)
 * inspecting the JSON file; tests pin the field set so downstream tooling
 * can rely on it.
 */
export function buildEvidenceLog(input: {
	tables: MigrateTableSnapshot[];
	errors: MigrationError[];
	result: MigrationResult | null;
	completedAt: string | null;
	generatedAt?: string;
}): MigrationEvidenceLog {
	const generatedAt = input.generatedAt ?? new Date().toISOString();
	const totalMigrated = input.tables.reduce((sum, t) => sum + t.migrated, 0);
	const totalErrors = input.errors.length;

	return {
		generatedAt,
		completedAt: input.completedAt,
		totalMigrated,
		totalErrors,
		tables: input.tables.map((t) => ({ ...t })),
		errors: input.errors.map((e) => ({ ...e })),
		result: input.result ? { ...input.result, errors: [...input.result.errors] } : null,
	};
}

export function evidenceLogFilename(generatedAt: string): string {
	const stamp = generatedAt.replace(/[:.]/g, '-');
	return `novellum-migration-${stamp}.json`;
}
