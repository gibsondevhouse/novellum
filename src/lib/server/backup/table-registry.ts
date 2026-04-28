/**
 * Canonical registry of every SQLite table declared in `SCHEMA_SQL` and
 * its classification for `.novellum` project backups.
 *
 * Every table from the schema MUST appear here exactly once. The
 * guardrail in `tests/backup/table-registry.test.ts` parses
 * `SCHEMA_SQL` and fails CI if any declared table is missing — so
 * adding a table to the schema forces the engineer to make a
 * conscious include/exclude decision before merge.
 *
 * Phases beyond stage-004/phase-001 (backup builder, restore writer,
 * etc.) MUST drive their table loops from this registry. No other
 * file is allowed to hand-list tables.
 */

export type BackupTableScope = 'project' | 'global' | 'system';

export interface BackupTableEntry {
	/** Table name as written in `CREATE TABLE IF NOT EXISTS …`. */
	readonly name: string;
	/**
	 * - `project` — rows are scoped to a single project.
	 * - `global`  — rows are app-wide and not specific to any project.
	 * - `system`  — internal bookkeeping (migrations, snapshot
	 *   registry, etc.).
	 */
	readonly scope: BackupTableScope;
	/** Whether this table is included in `.novellum` backups. */
	readonly include: boolean;
	/** Human-readable justification for the include/exclude choice. */
	readonly reason: string;
	/**
	 * Column on this table that holds the owning project's id.
	 * Required for every `scope: 'project'` entry except `projects`
	 * itself (whose primary key IS the project id). Used by the
	 * backup builder to filter rows and by restore-as-copy to
	 * remap foreign keys.
	 */
	readonly projectIdColumn?: string;
}

export const BACKUP_TABLE_REGISTRY: readonly BackupTableEntry[] = [
	// --- project root ---
	{
		name: 'projects',
		scope: 'project',
		include: true,
		reason: 'Root project record. Backup is keyed off this row.',
	},
	// --- manuscript structure ---
	{
		name: 'chapters',
		scope: 'project',
		include: true,
		reason: 'Manuscript structure.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'scenes',
		scope: 'project',
		include: true,
		reason: 'Manuscript content.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'beats',
		scope: 'project',
		include: true,
		reason: 'Beat-level outline structure.',
		projectIdColumn: 'projectId',
	},
	// --- story bible ---
	{
		name: 'characters',
		scope: 'project',
		include: true,
		reason: 'Story bible — characters.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'character_relationships',
		scope: 'project',
		include: true,
		reason: 'Story bible — character relationships.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'locations',
		scope: 'project',
		include: true,
		reason: 'Story bible — locations.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'lore_entries',
		scope: 'project',
		include: true,
		reason: 'Story bible — lore.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'plot_threads',
		scope: 'project',
		include: true,
		reason: 'Story bible — plot threads.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'timeline_events',
		scope: 'project',
		include: true,
		reason: 'Story bible — timeline.',
		projectIdColumn: 'projectId',
	},
	// --- consistency / analysis ---
	{
		name: 'consistency_issues',
		scope: 'project',
		include: true,
		reason: 'Saved consistency analysis state.',
		projectIdColumn: 'projectId',
	},
	// --- per-project settings & history ---
	{
		name: 'export_settings',
		scope: 'project',
		include: true,
		reason: 'Per-project export preferences.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'scene_snapshots',
		scope: 'project',
		include: true,
		reason: 'Per-project scene revision history.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'story_frames',
		scope: 'project',
		include: true,
		reason: 'Per-project premise/theme frame.',
		projectIdColumn: 'projectId',
	},
	// --- outline tiers ---
	{
		name: 'acts',
		scope: 'project',
		include: true,
		reason: 'Outline tier — acts.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'arcs',
		scope: 'project',
		include: true,
		reason: 'Outline tier — arcs.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'stages',
		scope: 'project',
		include: true,
		reason: 'Outline tier — stages.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'milestones',
		scope: 'project',
		include: true,
		reason: 'Outline tier — milestones.',
		projectIdColumn: 'projectId',
	},
	// --- style / prompt assets owned by the project ---
	{
		name: 'writing_styles',
		scope: 'project',
		include: true,
		reason: 'Project-owned writing style presets.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'templates',
		scope: 'project',
		include: true,
		reason: 'Project-owned templates.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'system_prompts',
		scope: 'project',
		include: true,
		reason: 'Project-owned system prompts.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'chat_instructions',
		scope: 'project',
		include: true,
		reason: 'Project-owned chat instruction presets.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'project_metadata',
		scope: 'project',
		include: true,
		reason: 'Per-project key/value metadata.',
		projectIdColumn: 'projectId',
	},
	// --- excluded ---
	{
		name: 'app_preferences',
		scope: 'global',
		include: false,
		reason: 'App-wide UI preferences; not project-scoped data.',
	},
	{
		name: 'schema_migrations',
		scope: 'system',
		include: false,
		reason: 'Schema metadata; reconstructed by migrations on import.',
	},
	{
		name: 'backup_snapshots',
		scope: 'system',
		include: false,
		reason: 'Machine-local pre-migration snapshot registry; paths are not portable.',
	},
];

/** Return the entries that should be written into `.novellum` backups. */
export function getProjectBackupTables(): readonly BackupTableEntry[] {
	return BACKUP_TABLE_REGISTRY.filter((entry) => entry.include);
}

/** Look up a registry entry by table name; returns `undefined` if unknown. */
export function getBackupTableEntry(name: string): BackupTableEntry | undefined {
	return BACKUP_TABLE_REGISTRY.find((entry) => entry.name === name);
}
