import { beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import {
	buildNovaContextHttpResponse,
	normalizeNovaContextRequest,
} from '../../src/routes/api/nova/context/http.js';

function createTestDb() {
	const database = new Database(':memory:');
	database.pragma('journal_mode = WAL');
	database.pragma('foreign_keys = ON');
	database.exec(SCHEMA_SQL);
	database.exec(INDEX_SQL);
	return database;
}

function seedProject(database: Database.Database, projectId: string, title: string) {
	const now = new Date().toISOString();
	database
		.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, projectType, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @projectType, @createdAt, @updatedAt)`,
		)
		.run({
			id: projectId,
			title,
			genre: 'mystery',
			logline: `${title} logline`,
			synopsis: `${title} synopsis`,
			targetWordCount: 10_000,
			status: 'planning',
			projectType: 'novel',
			createdAt: now,
			updatedAt: now,
		});
}

describe('nova context route', () => {
	let database: Database.Database;

	beforeEach(() => {
		database = createTestDb();
		seedProject(database, 'proj-1', 'Route Project');
	});

	it('normalizes a valid payload shape', () => {
		const normalized = normalizeNovaContextRequest({
			projectIds: ['proj-1', ''],
			files: [
				{
					id: 'file-1',
					name: 'notes.txt',
					mimeType: 'text/plain',
					sizeBytes: 123,
					text: 'hello',
				},
			],
			prompt: 'hello',
		});

		expect(normalized).toEqual({
			projectIds: ['proj-1'],
			files: [
				{
					id: 'file-1',
					name: 'notes.txt',
					mimeType: 'text/plain',
					sizeBytes: 123,
					text: 'hello',
				},
			],
			prompt: 'hello',
		});
	});

	it('returns 400 for invalid payload', async () => {
		const response = await buildNovaContextHttpResponse({ projectIds: 'wrong' }, database);
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: string };
		expect(body.error).toContain('Invalid payload');
	});

	it('handles project-only context request', async () => {
		const response = await buildNovaContextHttpResponse(
			{
				projectIds: ['proj-1'],
				files: [],
			},
			database,
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { contextText: string; includedItems: Array<{ kind: string }> };
		expect(body.contextText).toContain('# Project: Route Project');
		expect(body.includedItems).toEqual([{ kind: 'project', projectId: 'proj-1', label: 'Route Project' }]);
	});

	it('handles file-only context request', async () => {
		const response = await buildNovaContextHttpResponse(
			{
				projectIds: [],
				files: [
					{
						id: 'file-1',
						name: 'context.md',
						mimeType: 'text/markdown',
						sizeBytes: 99,
						text: '# Context',
					},
				],
			},
			database,
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			contextText: string;
			includedItems: Array<{ kind: string; id?: string }>;
		};
		expect(body.contextText).toContain('# Attached Files');
		expect(body.contextText).toContain('## File: context.md');
		expect(body.includedItems).toEqual([
			{ kind: 'file', id: 'file-1', name: 'context.md', mimeType: 'text/markdown', sizeBytes: 99 },
		]);
	});

	it('handles mixed project and file request', async () => {
		const response = await buildNovaContextHttpResponse(
			{
				projectIds: ['proj-1'],
				files: [
					{
						id: 'file-1',
						name: 'memo.csv',
						mimeType: 'text/csv',
						sizeBytes: 45,
						text: 'a,b\n1,2',
					},
				],
			},
			database,
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { contextText: string; includedItems: Array<{ kind: string }> };
		expect(body.contextText).toContain('# Project: Route Project');
		expect(body.contextText).toContain('## File: memo.csv');
		expect(body.includedItems.map((item) => item.kind)).toEqual(['project', 'file']);
	});

	it('returns warnings for unsupported files', async () => {
		const response = await buildNovaContextHttpResponse(
			{
				projectIds: [],
				files: [
					{
						id: 'file-1',
						name: 'book.pdf',
						mimeType: 'application/pdf',
						sizeBytes: 10,
						text: 'binary',
					},
				],
			},
			database,
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { warnings: string[]; includedItems: Array<{ kind: string }> };
		expect(body.includedItems).toEqual([]);
		expect(body.warnings.some((warning) => warning.includes('book.pdf'))).toBe(true);
	});
});
