import type { Migration } from './migration-runner.js';

/**
 * Ordered list of versioned migrations applied to the SQLite database at boot.
 *
 * Migrations are added incrementally as inline `ensureColumn` helpers in
 * `migrations.ts` are extracted into discrete files under `./migrations/`.
 * See plan-017 stage-003 phase-002 for the extraction roadmap.
 */
export const MIGRATION_REGISTRY: readonly Migration[] = [];
