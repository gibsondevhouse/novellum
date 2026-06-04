import { db, type SqliteDatabase } from '$lib/server/db/index.js';

export const OUTLINE_CONFLICT_CODE = 'outline_conflict' as const;

export type OutlineHierarchyTable =
	| 'arcs'
	| 'acts'
	| 'milestones'
	| 'chapters'
	| 'scenes'
	| 'beats'
	| 'stages';

export type OutlineConflictState = 'empty' | 'partial' | 'populated';

export type OutlineHierarchyCounts = Record<OutlineHierarchyTable, number>;

export interface OutlineConflictPreflightResult {
	code: typeof OUTLINE_CONFLICT_CODE;
	state: OutlineConflictState;
	hasConflict: boolean;
	counts: OutlineHierarchyCounts;
	total: number;
	message: string;
}

export const OUTLINE_HIERARCHY_TABLES: readonly OutlineHierarchyTable[] = [
	'arcs',
	'acts',
	'milestones',
	'chapters',
	'scenes',
	'beats',
	'stages',
];

const CORE_OUTLINE_TABLES: readonly OutlineHierarchyTable[] = [
	'arcs',
	'acts',
	'chapters',
	'scenes',
];

function countTableRows(
	database: SqliteDatabase,
	table: OutlineHierarchyTable,
	projectId: string,
): number {
	const row = database
		.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE projectId = ?`)
		.get(projectId) as { count: number };
	return row.count;
}

function classifyOutlineState(counts: OutlineHierarchyCounts): OutlineConflictState {
	const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
	if (total === 0) return 'empty';

	const hasCoreSpine = CORE_OUTLINE_TABLES.every((table) => counts[table] > 0);
	return hasCoreSpine ? 'populated' : 'partial';
}

function messageForState(state: OutlineConflictState): string {
	switch (state) {
		case 'empty':
			return 'No existing outline hierarchy rows were found.';
		case 'partial':
			return 'Existing outline hierarchy is partially populated.';
		case 'populated':
			return 'Existing outline hierarchy is populated.';
	}
}

export function getOutlineConflictPreflight(
	projectId: string,
	database: SqliteDatabase = db,
): OutlineConflictPreflightResult {
	const counts = {} as OutlineHierarchyCounts;
	for (const table of OUTLINE_HIERARCHY_TABLES) {
		counts[table] = countTableRows(database, table, projectId);
	}

	const state = classifyOutlineState(counts);
	const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
	return {
		code: OUTLINE_CONFLICT_CODE,
		state,
		hasConflict: state !== 'empty',
		counts,
		total,
		message: messageForState(state),
	};
}
