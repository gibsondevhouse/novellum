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
	{
		name: 'factions',
		scope: 'project',
		include: true,
		reason: 'Story bible — factions.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'themes',
		scope: 'project',
		include: true,
		reason: 'Story bible — themes.',
		projectIdColumn: 'projectId',
	},
	{
		name: 'glossary_terms',
		scope: 'project',
		include: true,
		reason: 'Story bible — glossary.',
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
	// --- project media ---
	{
		name: 'assets',
		scope: 'project',
		include: true,
		reason: 'Project-owned image and media assets (base64 data).',
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
	// --- agent runtime ledger (migration 0006) ---
	{
		name: 'agent_runs',
		scope: 'project',
		include: false,
		projectIdColumn: 'projectId',
		reason: 'Runtime-only ledger; reconstructed on re-run. Not included in portable backups.',
	},
	{
		name: 'agent_run_steps',
		scope: 'project',
		include: false,
		reason: 'Runtime-only step records; reconstructed on re-run.',
	},
	{
		name: 'agent_tool_calls',
		scope: 'project',
		include: false,
		reason: 'Runtime-only tool-call records; reconstructed on re-run.',
	},
	{
		name: 'agent_artifacts',
		scope: 'project',
		include: false,
		reason: 'Runtime artifact metadata; domain records in canonical tables are the portable form.',
	},
	{
		name: 'agent_usage',
		scope: 'project',
		include: false,
		reason: 'Token/cost usage metadata; not required for project portability.',
	},
	{
		name: 'agent_run_errors',
		scope: 'project',
		include: false,
		reason: 'Runtime error records; not required for project portability.',
	},
	{
		name: 'agent_jobs',
		scope: 'project',
		include: false,
		reason: 'Runtime job queue records; reconstructed on re-run.',
	},
	{
		name: 'agent_trace_events',
		scope: 'project',
		include: false,
		reason: 'Diagnostic trace events; not required for project portability.',
	},
	{
		name: 'agent_trace_redactions',
		scope: 'project',
		include: false,
		reason: 'Diagnostic redaction metadata; not required for project portability.',
	},
	// --- project search FTS tables (migration 0007) ---
	// FTS5 virtual tables each produce 5 shadow tables: _config, _content, _data, _docsize, _idx.
	// All are excluded from backups; the index is rebuilt from canonical tables on restore.
	{
		name: 'project_search_scenes',
		scope: 'project',
		include: false,
		projectIdColumn: 'projectId',
		reason: 'FTS5 virtual table; rebuilt from canonical scenes on restore.',
	},
	{
		name: 'project_search_scenes_config',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_scenes_content',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_scenes_data',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_scenes_docsize',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_scenes_idx',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_characters',
		scope: 'project',
		include: false,
		projectIdColumn: 'projectId',
		reason: 'FTS5 virtual table; rebuilt from canonical characters on restore.',
	},
	{
		name: 'project_search_characters_config',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_characters_content',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_characters_data',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_characters_docsize',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_characters_idx',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_locations',
		scope: 'project',
		include: false,
		projectIdColumn: 'projectId',
		reason: 'FTS5 virtual table; rebuilt from canonical locations on restore.',
	},
	{
		name: 'project_search_locations_config',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_locations_content',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_locations_data',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_locations_docsize',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_locations_idx',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_lore',
		scope: 'project',
		include: false,
		projectIdColumn: 'projectId',
		reason: 'FTS5 virtual table; rebuilt from canonical lore entries on restore.',
	},
	{
		name: 'project_search_lore_config',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_lore_content',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_lore_data',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_lore_docsize',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_lore_idx',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_plot_threads',
		scope: 'project',
		include: false,
		projectIdColumn: 'projectId',
		reason: 'FTS5 virtual table; rebuilt from canonical plot threads on restore.',
	},
	{
		name: 'project_search_plot_threads_config',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_plot_threads_content',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_plot_threads_data',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_plot_threads_docsize',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_plot_threads_idx',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_timeline_events',
		scope: 'project',
		include: false,
		projectIdColumn: 'projectId',
		reason: 'FTS5 virtual table; rebuilt from canonical timeline events on restore.',
	},
	{
		name: 'project_search_timeline_events_config',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_timeline_events_content',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_timeline_events_data',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_timeline_events_docsize',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_timeline_events_idx',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_outline_items',
		scope: 'project',
		include: false,
		projectIdColumn: 'projectId',
		reason: 'FTS5 virtual table; rebuilt from accepted outline artifacts on restore.',
	},
	{
		name: 'project_search_outline_items_config',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_outline_items_content',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_outline_items_data',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_outline_items_docsize',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_outline_items_idx',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_artifacts',
		scope: 'project',
		include: false,
		projectIdColumn: 'projectId',
		reason: 'FTS5 virtual table; rebuilt from accepted generated artifacts on restore.',
	},
	{
		name: 'project_search_artifacts_config',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_artifacts_content',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_artifacts_data',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_artifacts_docsize',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
	},
	{
		name: 'project_search_artifacts_idx',
		scope: 'system',
		include: false,
		reason: 'FTS5 shadow table; rebuilt from canonical data.',
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
