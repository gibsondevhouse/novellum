import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import {
	OUTLINE_CONFLICT_CODE,
	getOutlineConflictPreflight,
} from '../../../src/lib/server/outline/outline-conflict-preflight.js';

function createDb(): Database.Database {
	const database = new Database(':memory:');
	database.exec(`
		CREATE TABLE arcs (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE acts (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE milestones (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE chapters (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE scenes (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE beats (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE stages (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
	`);
	return database;
}

function insertRow(database: Database.Database, table: string, id: string, projectId = 'project-1'): void {
	database.prepare(`INSERT INTO ${table} (id, projectId) VALUES (?, ?)`).run(id, projectId);
}

describe('getOutlineConflictPreflight', () => {
	it('classifies an empty hierarchy as accept-safe', () => {
		const result = getOutlineConflictPreflight('project-1', createDb());

		expect(result).toMatchObject({
			code: OUTLINE_CONFLICT_CODE,
			state: 'empty',
			hasConflict: false,
			total: 0,
		});
		expect(Object.values(result.counts).every((count) => count === 0)).toBe(true);
	});

	it('classifies orphaned or partial hierarchy rows as conflicts', () => {
		const database = createDb();
		insertRow(database, 'scenes', 'orphan-scene');

		const result = getOutlineConflictPreflight('project-1', database);

		expect(result).toMatchObject({
			state: 'partial',
			hasConflict: true,
			total: 1,
		});
		expect(result.counts.scenes).toBe(1);
		expect(result.message).toContain('partially populated');
	});

	it('classifies an existing core outline spine as populated', () => {
		const database = createDb();
		insertRow(database, 'arcs', 'arc-1');
		insertRow(database, 'acts', 'act-1');
		insertRow(database, 'chapters', 'chapter-1');
		insertRow(database, 'scenes', 'scene-1');

		const result = getOutlineConflictPreflight('project-1', database);

		expect(result).toMatchObject({
			state: 'populated',
			hasConflict: true,
			total: 4,
		});
		expect(result.counts).toMatchObject({
			arcs: 1,
			acts: 1,
			chapters: 1,
			scenes: 1,
		});
	});

	it('counts only the requested project', () => {
		const database = createDb();
		insertRow(database, 'arcs', 'arc-other', 'other-project');

		expect(getOutlineConflictPreflight('project-1', database).state).toBe('empty');
		expect(getOutlineConflictPreflight('other-project', database).state).toBe('partial');
	});
});

describe('outline conflict preflight source contract', () => {
	const source = readFileSync(
		resolve(process.cwd(), 'src/lib/server/outline/outline-conflict-preflight.ts'),
		'utf-8',
	);

	it('does not perform writes', () => {
		expect(source).not.toMatch(/\b(?:INSERT|UPDATE|DELETE)\b/);
		expect(source).not.toContain('.run(');
	});
});
