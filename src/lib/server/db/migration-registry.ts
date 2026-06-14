import type { Migration } from './migration-runner.js';
import { migration0001 } from './migrations/0001_baseline.js';
import { migration0002 } from './migrations/0002_add_backup_metadata.js';
import { migration0003 } from './migrations/0003_scene_snapshot_metadata.js';
import { migration0004 } from './migrations/0004_pipeline_entities.js';
import { migration0005 } from './migrations/0005_assets_table.js';
import { migration0006 } from './migrations/0006_agent_runtime_ledger.js';

/**
 * Ordered list of versioned migrations applied to the SQLite database at boot.
 *
 * Add new migrations to this array in strictly increasing `version` order.
 * Never edit a previously-shipped migration; author a new file instead.
 */
export const MIGRATION_REGISTRY: readonly Migration[] = [
	migration0001,
	migration0002,
	migration0003,
	migration0004,
	migration0005,
	migration0006,
];
