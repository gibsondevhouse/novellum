import type { Migration } from '../migration-runner.js';

/**
 * Migration 0007: Project search full-text index.
 *
 * Adds SQLite FTS5 virtual tables for local project memory retrieval.
 * Indexes are scoped by projectId so search never leaks across projects.
 *
 * Tables created:
 *   - project_search_scenes     — scene title + content
 *   - project_search_characters — character name + bio + notes
 *   - project_search_locations  — location name + description + notes
 *   - project_search_lore       — lore entry title + content
 *   - project_search_plot_threads — plot thread title + description
 *   - project_search_timeline_events — event title + description
 *   - project_search_outline_items  — outline item summary + notes
 *   - project_search_artifacts      — accepted generated artifact summary
 *
 * Each FTS table stores only the text content and a `projectId` / `entityId`
 * so the search layer can resolve full records from the canonical tables.
 *
 * plan-049 stage-004 phase-002 part-001
 */
export const migration0007: Migration = {
	version: 7,
	name: '0007_project_search_fts',
	checksum: 'project-search-fts-v1',
	up(db) {
		// Scenes
		db.exec(`
			CREATE VIRTUAL TABLE IF NOT EXISTS project_search_scenes
			USING fts5(
				projectId UNINDEXED,
				entityId UNINDEXED,
				title,
				content,
				tokenize = 'porter ascii'
			);
		`);

		// Characters
		db.exec(`
			CREATE VIRTUAL TABLE IF NOT EXISTS project_search_characters
			USING fts5(
				projectId UNINDEXED,
				entityId UNINDEXED,
				name,
				bio,
				notes,
				tokenize = 'porter ascii'
			);
		`);

		// Locations
		db.exec(`
			CREATE VIRTUAL TABLE IF NOT EXISTS project_search_locations
			USING fts5(
				projectId UNINDEXED,
				entityId UNINDEXED,
				name,
				description,
				notes,
				tokenize = 'porter ascii'
			);
		`);

		// Lore entries
		db.exec(`
			CREATE VIRTUAL TABLE IF NOT EXISTS project_search_lore
			USING fts5(
				projectId UNINDEXED,
				entityId UNINDEXED,
				title,
				content,
				tokenize = 'porter ascii'
			);
		`);

		// Plot threads
		db.exec(`
			CREATE VIRTUAL TABLE IF NOT EXISTS project_search_plot_threads
			USING fts5(
				projectId UNINDEXED,
				entityId UNINDEXED,
				title,
				description,
				tokenize = 'porter ascii'
			);
		`);

		// Timeline events
		db.exec(`
			CREATE VIRTUAL TABLE IF NOT EXISTS project_search_timeline_events
			USING fts5(
				projectId UNINDEXED,
				entityId UNINDEXED,
				title,
				description,
				tokenize = 'porter ascii'
			);
		`);

		// Outline items (summaries and notes from accepted outline proposals)
		db.exec(`
			CREATE VIRTUAL TABLE IF NOT EXISTS project_search_outline_items
			USING fts5(
				projectId UNINDEXED,
				entityId UNINDEXED,
				summary,
				notes,
				tokenize = 'porter ascii'
			);
		`);

		// Accepted generated artifacts (summary only — content lives in checkpoint tables)
		db.exec(`
			CREATE VIRTUAL TABLE IF NOT EXISTS project_search_artifacts
			USING fts5(
				projectId UNINDEXED,
				entityId UNINDEXED,
				summary,
				tokenize = 'porter ascii'
			);
		`);
	},
};
