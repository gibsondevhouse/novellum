import { describe, it, expect, beforeEach } from 'vitest';
import JSZip from 'jszip';
import { db, resetDb } from '$lib/db/index.js';
import { buildBackupArchive, createBackupFilename } from '../portability/zip-export.js';

describe('zip-export', () => {
	beforeEach(async () => {
		await resetDb();
	});

	it('builds a valid ZIP with manifest and table payloads', async () => {
		const projectId = 'zip-test-1';
		await db.projects.add({
			id: projectId,
			title: 'ZIP Test',
			genre: 'Sci-Fi',
			logline: '',
			synopsis: '',
			targetWordCount: 80000,
			systemPrompt: '',
			negativePrompt: '',
			status: 'draft', projectType: 'novel' as const,
			stylePresetId: '',
			lastOpenedAt: new Date().toISOString(),

			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const { blob, manifest } = await buildBackupArchive(projectId);

		expect(blob).toBeInstanceOf(Blob);
		expect(manifest.formatVersion).toBe(1);
		expect(manifest.dbSchemaVersion).toBe(8);
		expect(manifest.projectId).toBe(projectId);
		expect(manifest.tableCounts.projects).toBe(1);

		// Verify ZIP contents
		const zip = await JSZip.loadAsync(blob);
		expect(zip.file('manifest.json')).not.toBeNull();
		expect(zip.file('db/projects.json')).not.toBeNull();
		expect(zip.file('kv/localStorage.json')).not.toBeNull();
	});

	it('includes checksums for all payload files', async () => {
		await db.projects.add({
			id: 'chk-proj',
			title: 'Checksum',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			systemPrompt: '',
			negativePrompt: '',
			status: 'draft', projectType: 'novel' as const,
			stylePresetId: '',
			lastOpenedAt: new Date().toISOString(),

			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const { manifest } = await buildBackupArchive('chk-proj');
		expect(manifest.checksums['db/projects.json']).toBeDefined();
		expect(manifest.checksums['kv/localStorage.json']).toBeDefined();
		// Each checksum should be a 64-char hex string
		for (const hash of Object.values(manifest.checksums)) {
			expect(hash).toMatch(/^[a-f0-9]{64}$/);
		}
	});

	it('handles empty project gracefully', async () => {
		const { blob, manifest } = await buildBackupArchive('nonexistent');
		expect(blob.size).toBeGreaterThan(0);
		expect(manifest.tableCounts.projects).toBe(0);
	});
});

describe('createBackupFilename', () => {
	it('creates safe filename from project title', () => {
		const name = createBackupFilename('My Novel!', '2026-04-13T12:00:00.000Z');
		expect(name).toBe('my_novel_2026-04-13.novellum.zip');
	});

	it('handles special characters in title', () => {
		const name = createBackupFilename('The "Great" Novel: Part 1', '2026-04-13T00:00:00Z');
		expect(name).toBe('the_great_novel_part_1_2026-04-13.novellum.zip');
	});

	it('falls back to "project" for empty title', () => {
		const name = createBackupFilename('!!!', '2026-04-13T00:00:00Z');
		expect(name).toBe('project_2026-04-13.novellum.zip');
	});
});
