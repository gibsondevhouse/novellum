/**
 * Project Search Service
 *
 * Higher-level ranked search across all indexed entity kinds within
 * a project. Results are project-isolated and ranked by FTS BM25 score.
 *
 * plan-049 stage-004 phase-002 part-001
 */

import type Database from 'better-sqlite3';
import { db as globalDb } from '$lib/server/db/index.js';
import type { SearchEntityKind } from './project-search-index.js';

// ── Result Types ──────────────────────────────────────────────────────────────

export interface SearchHit {
	/** FTS table the hit came from. */
	kind: SearchEntityKind;
	/** Entity primary key (resolves to the canonical table). */
	entityId: string;
	/** BM25 relevance score — lower is more relevant in SQLite FTS5. */
	bm25Score: number;
	/** Snippet of matching text (may be empty if the table stores short fields). */
	snippet: string;
}

// ── Service Options ──────────────────────────────────────────────────────────

export interface SearchOptions {
	db?: Database.Database;
	/** Maximum results returned per entity kind. Defaults to 5. */
	limitPerKind?: number;
	/** Entity kinds to include. Defaults to all. */
	kinds?: SearchEntityKind[];
}

// ── Query Helpers ────────────────────────────────────────────────────────────

/**
 * Configuration per FTS table: table name, text columns for snippet extraction.
 */
const KIND_CONFIG: Record<
	SearchEntityKind,
	{ table: string; snippetCol: string; rankCols: string }
> = {
	scene: {
		table: 'project_search_scenes',
		snippetCol: 'content',
		rankCols: 'title content',
	},
	character: {
		table: 'project_search_characters',
		snippetCol: 'bio',
		rankCols: 'name bio notes',
	},
	location: {
		table: 'project_search_locations',
		snippetCol: 'description',
		rankCols: 'name description notes',
	},
	lore: {
		table: 'project_search_lore',
		snippetCol: 'content',
		rankCols: 'title content',
	},
	plot_thread: {
		table: 'project_search_plot_threads',
		snippetCol: 'description',
		rankCols: 'title description',
	},
	timeline_event: {
		table: 'project_search_timeline_events',
		snippetCol: 'description',
		rankCols: 'title description',
	},
	outline_item: {
		table: 'project_search_outline_items',
		snippetCol: 'summary',
		rankCols: 'summary notes',
	},
	artifact: {
		table: 'project_search_artifacts',
		snippetCol: 'summary',
		rankCols: 'summary',
	},
};

type FtsRow = { entityId: string; bm25: number; snippet: string };

function searchKind(
	database: Database.Database,
	projectId: string,
	query: string,
	kind: SearchEntityKind,
	limit: number,
): SearchHit[] {
	const { table, snippetCol: _snippetCol } = KIND_CONFIG[kind];

	// FTS5 MATCH query; BM25 is negative (more negative = more relevant).
	// snippet() highlights matches with <b> tags in the named column.
	const rows = database
		.prepare<[string, string, number]>(
			`SELECT entityId,
			        bm25(${table}) AS bm25,
			        snippet(${table}, -1, '<b>', '</b>', '…', 32) AS snippet
			 FROM ${table}
			 WHERE projectId = ?
			   AND ${table} MATCH ?
			 ORDER BY bm25(${table})
			 LIMIT ?`,
		)
		.all(projectId, query, limit) as FtsRow[];

	return rows.map((row) => ({
		kind,
		entityId: row.entityId,
		bm25Score: row.bm25,
		snippet: row.snippet ?? '',
	}));
}

// ── Public Search API ─────────────────────────────────────────────────────────

/**
 * Searches the project FTS indexes for `query` and returns ranked hits.
 *
 * Results are merged and re-sorted by BM25 score across all requested kinds.
 * Project isolation is enforced by the `projectId` filter in every query.
 */
export function searchProject(
	projectId: string,
	query: string,
	opts: SearchOptions = {},
): SearchHit[] {
	if (!query.trim()) return [];

	const database = opts.db ?? globalDb;
	const limit = opts.limitPerKind ?? 5;
	const kinds: SearchEntityKind[] = opts.kinds ?? (Object.keys(KIND_CONFIG) as SearchEntityKind[]);

	const allHits: SearchHit[] = [];

	for (const kind of kinds) {
		try {
			const hits = searchKind(database, projectId, query, kind, limit);
			allHits.push(...hits);
		} catch {
			// FTS table may not exist if migration hasn't run; skip this kind.
		}
	}

	// Sort by BM25 ascending (lower = more relevant in SQLite FTS5).
	allHits.sort((a, b) => a.bm25Score - b.bm25Score);

	return allHits;
}

/**
 * Searches a single entity kind.
 */
export function searchProjectKind(
	projectId: string,
	query: string,
	kind: SearchEntityKind,
	opts: SearchOptions = {},
): SearchHit[] {
	if (!query.trim()) return [];
	const database = opts.db ?? globalDb;
	const limit = opts.limitPerKind ?? 5;
	return searchKind(database, projectId, query, kind, limit);
}
