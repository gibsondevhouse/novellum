export {
	preCheck,
	migrate,
	isMigrationComplete,
	markMigrationComplete,
	MIGRATION_COMPLETE_KEY,
} from './migration-service.js';
export type {
	TableProgress,
	MigrationResult,
	MigrationError,
	MigrationCallbacks,
	PreCheckResult,
} from './types.js';
