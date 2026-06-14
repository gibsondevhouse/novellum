/**
 * Project Search Index
 *
 * Low-level FTS5 index operations: upsert, delete, and rebuild for each
 * indexed entity kind. All writes are project-scoped.
 *
 * plan-049 stage-004 phase-002 part-001
 */

import type Database from 'better-sqlite3';
import { db as globalDb } from '$lib/server/db/index.js';

// ── Entity Kinds ─────────────────────────────────────────────────────────────

export const SEARCH_ENTITY_KINDS = [
	'scene',
	'character',
	'location',
	'lore',
	'plot_thread',
	'timeline_event',
	'outline_item',
	'artifact',
] as const;

export type SearchEntityKind = (typeof SEARCH_ENTITY_KINDS)[number];

const FTS_TABLE: Record<SearchEntityKind, string> = {
	scene: 'project_search_scenes',
	character: 'project_search_characters',
	location: 'project_search_locations',
	lore: 'project_search_lore',
	plot_thread: 'project_search_plot_threads',
	timeline_event: 'project_search_timeline_events',
	outline_item: 'project_search_outline_items',
	artifact: 'project_search_artifacts',
};

// ── Index Document Types ──────────────────────────────────────────────────────

export interface SceneIndexDoc {
	projectId: string;
	entityId: string;
	title: string;
	content: string;
}

export interface CharacterIndexDoc {
	projectId: string;
	entityId: string;
	name: string;
	bio: string;
	notes: string;
}

export interface LocationIndexDoc {
	projectId: string;
	entityId: string;
	name: string;
	description: string;
	notes: string;
}

export interface LoreIndexDoc {
	projectId: string;
	entityId: string;
	title: string;
	content: string;
}

export interface PlotThreadIndexDoc {
	projectId: string;
	entityId: string;
	title: string;
	description: string;
}

export interface TimelineEventIndexDoc {
	projectId: string;
	entityId: string;
	title: string;
	description: string;
}

export interface OutlineItemIndexDoc {
	projectId: string;
	entityId: string;
	summary: string;
	notes: string;
}

export interface ArtifactIndexDoc {
	projectId: string;
	entityId: string;
	summary: string;
}

// ── Index Operations ──────────────────────────────────────────────────────────

/**
 * Removes all existing FTS rows for `entityId` in the given table, then inserts fresh content.
 * Safe to call on create, update, or restore — always idempotent.
 */
function upsertFtsRow(
	db: Database.Database,
	table: string,
	entityId: string,
	projectId: string,
	fields: Record<string, string>,
): void {
	// FTS5 does not support UPDATE; delete + insert is the standard pattern.
	db.prepare(`DELETE FROM ${table} WHERE entityId = ?`).run(entityId);
	const cols = ['projectId', 'entityId', ...Object.keys(fields)];
	const placeholders = cols.map(() => '?').join(', ');
	db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`).run(
		projectId,
		entityId,
		...Object.values(fields),
	);
}

/**
 * Removes all FTS rows for `entityId` from the given table.
 */
function deleteFtsRow(db: Database.Database, table: string, entityId: string): void {
	db.prepare(`DELETE FROM ${table} WHERE entityId = ?`).run(entityId);
}

// ── Public Index API ─────────────────────────────────────────────────────────

export interface ProjectSearchIndexOptions {
	db?: Database.Database;
}

export function indexScene(doc: SceneIndexDoc, opts: ProjectSearchIndexOptions = {}): void {
	const database = opts.db ?? globalDb;
	upsertFtsRow(database, FTS_TABLE.scene, doc.entityId, doc.projectId, {
		title: doc.title,
		content: doc.content,
	});
}

export function removeScene(entityId: string, opts: ProjectSearchIndexOptions = {}): void {
	deleteFtsRow(opts.db ?? globalDb, FTS_TABLE.scene, entityId);
}

export function indexCharacter(doc: CharacterIndexDoc, opts: ProjectSearchIndexOptions = {}): void {
	const database = opts.db ?? globalDb;
	upsertFtsRow(database, FTS_TABLE.character, doc.entityId, doc.projectId, {
		name: doc.name,
		bio: doc.bio,
		notes: doc.notes,
	});
}

export function removeCharacter(entityId: string, opts: ProjectSearchIndexOptions = {}): void {
	deleteFtsRow(opts.db ?? globalDb, FTS_TABLE.character, entityId);
}

export function indexLocation(doc: LocationIndexDoc, opts: ProjectSearchIndexOptions = {}): void {
	const database = opts.db ?? globalDb;
	upsertFtsRow(database, FTS_TABLE.location, doc.entityId, doc.projectId, {
		name: doc.name,
		description: doc.description,
		notes: doc.notes,
	});
}

export function removeLocation(entityId: string, opts: ProjectSearchIndexOptions = {}): void {
	deleteFtsRow(opts.db ?? globalDb, FTS_TABLE.location, entityId);
}

export function indexLore(doc: LoreIndexDoc, opts: ProjectSearchIndexOptions = {}): void {
	const database = opts.db ?? globalDb;
	upsertFtsRow(database, FTS_TABLE.lore, doc.entityId, doc.projectId, {
		title: doc.title,
		content: doc.content,
	});
}

export function removeLore(entityId: string, opts: ProjectSearchIndexOptions = {}): void {
	deleteFtsRow(opts.db ?? globalDb, FTS_TABLE.lore, entityId);
}

export function indexPlotThread(doc: PlotThreadIndexDoc, opts: ProjectSearchIndexOptions = {}): void {
	const database = opts.db ?? globalDb;
	upsertFtsRow(database, FTS_TABLE.plot_thread, doc.entityId, doc.projectId, {
		title: doc.title,
		description: doc.description,
	});
}

export function removePlotThread(entityId: string, opts: ProjectSearchIndexOptions = {}): void {
	deleteFtsRow(opts.db ?? globalDb, FTS_TABLE.plot_thread, entityId);
}

export function indexTimelineEvent(
	doc: TimelineEventIndexDoc,
	opts: ProjectSearchIndexOptions = {},
): void {
	const database = opts.db ?? globalDb;
	upsertFtsRow(database, FTS_TABLE.timeline_event, doc.entityId, doc.projectId, {
		title: doc.title,
		description: doc.description,
	});
}

export function removeTimelineEvent(entityId: string, opts: ProjectSearchIndexOptions = {}): void {
	deleteFtsRow(opts.db ?? globalDb, FTS_TABLE.timeline_event, entityId);
}

export function indexOutlineItem(doc: OutlineItemIndexDoc, opts: ProjectSearchIndexOptions = {}): void {
	const database = opts.db ?? globalDb;
	upsertFtsRow(database, FTS_TABLE.outline_item, doc.entityId, doc.projectId, {
		summary: doc.summary,
		notes: doc.notes,
	});
}

export function removeOutlineItem(entityId: string, opts: ProjectSearchIndexOptions = {}): void {
	deleteFtsRow(opts.db ?? globalDb, FTS_TABLE.outline_item, entityId);
}

export function indexArtifact(doc: ArtifactIndexDoc, opts: ProjectSearchIndexOptions = {}): void {
	const database = opts.db ?? globalDb;
	upsertFtsRow(database, FTS_TABLE.artifact, doc.entityId, doc.projectId, {
		summary: doc.summary,
	});
}

export function removeArtifact(entityId: string, opts: ProjectSearchIndexOptions = {}): void {
	deleteFtsRow(opts.db ?? globalDb, FTS_TABLE.artifact, entityId);
}

// ── Full Project Rebuild ──────────────────────────────────────────────────────

/**
 * Removes all FTS rows for a project across all tables.
 * Call before a full rebuild (e.g., after restore) or on project deletion.
 */
export function clearProjectSearchIndex(
	projectId: string,
	opts: ProjectSearchIndexOptions = {},
): void {
	const database = opts.db ?? globalDb;
	for (const table of Object.values(FTS_TABLE)) {
		database.prepare(`DELETE FROM ${table} WHERE projectId = ?`).run(projectId);
	}
}
