export { encodeJson, decodeJson } from './serialize.js';
export { runMigrations as runLegacyEnsureColumns } from './migrations.js';
export {
	runMigrations,
	getAppliedMigrations,
	MigrationVersionAheadError,
	MigrationFailedError,
} from './migration-runner.js';
export type { Migration, RunMigrationsResult, RunMigrationsOptions } from './migration-runner.js';
export { MIGRATION_REGISTRY } from './migration-registry.js';
export { SCHEMA_SQL, INDEX_SQL } from './schema.js';
export { db } from './client.js';
