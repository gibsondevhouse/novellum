export interface TableProgress {
	table: string;
	total: number;
	migrated: number;
	errors: number;
	status: 'pending' | 'migrating' | 'done' | 'error';
}

export interface MigrationResult {
	tablesProcessed: number;
	rowsMigrated: number;
	errors: MigrationError[];
	skipped: number;
	alreadyComplete: boolean;
}

export interface MigrationError {
	table: string;
	entityId: string;
	message: string;
}

export interface MigrationCallbacks {
	onTableStart?: (table: string, count: number) => void;
	onTableComplete?: (table: string, migrated: number, errors: number) => void;
	onError?: (table: string, entityId: string, error: string) => void;
}

export interface PreCheckResult {
	table: string;
	dexieCount: number;
	sqliteCount: number;
}
