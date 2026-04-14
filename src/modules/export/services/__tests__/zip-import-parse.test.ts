import { describe, it, expect, beforeEach } from 'vitest';
import JSZip from 'jszip';
import { db, resetDb } from '$lib/db/index.js';
import { buildBackupArchive } from '../portability/zip-export.js';
import {
	parseBackupArchive,
	buildPreviewSummary,
	PortabilityParseError,
} from '../portability/zip-import-parse.js';

describe('zip-import-parse', () => {
	const projectId = 'parse-test-1';

	beforeEach(async () => {
		await resetDb();
		await db.projects.add({
			id: projectId,
			title: 'Parse Test',
			genre: 'Mystery',
			logline: '',
			synopsis: '',
			targetWordCount: 60000,
			status: 'draft',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		await db.chapters.add({
			id: 'ch-parse-1',
			projectId,
			title: 'Opening',
			order: 1,
			summary: '',
			wordCount: 100,
			arcRefs: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
	});

	it('parses a valid archive successfully', async () => {
		const { blob } = await buildBackupArchive(projectId);
		const file = new File([blob], 'test.novellum.zip');

		const parsed = await parseBackupArchive(file);
		expect(parsed.manifest.projectId).toBe(projectId);
		expect(parsed.manifest.formatVersion).toBe(1);
		expect(parsed.dbPayloads.projects).toHaveLength(1);
		expect(parsed.dbPayloads.chapters).toHaveLength(1);
		expect(parsed.compatibility.compatible).toBe(true);
	});

	it('builds preview summary from parsed archive', async () => {
		const { blob } = await buildBackupArchive(projectId);
		const parsed = await parseBackupArchive(new File([blob], 'test.zip'));
		const preview = buildPreviewSummary(parsed);

		expect(preview.projectId).toBe(projectId);
		expect(preview.tableCounts.projects).toBe(1);
		expect(preview.tableCounts.chapters).toBe(1);
		expect(typeof preview.exportedAt).toBe('string');
		expect(typeof preview.kvKeyCount).toBe('number');
	});

	it('rejects archive with missing manifest', async () => {
		const zip = new JSZip();
		zip.file('random.txt', 'hello');
		const blob = await zip.generateAsync({ type: 'blob' });

		await expect(parseBackupArchive(new File([blob], 'bad.zip'))).rejects.toThrow(
			PortabilityParseError,
		);

		try {
			await parseBackupArchive(new File([blob], 'bad.zip'));
		} catch (e) {
			expect((e as PortabilityParseError).code).toBe('MISSING_MANIFEST');
		}
	});

	it('rejects archive with malformed manifest JSON', async () => {
		const zip = new JSZip();
		zip.file('manifest.json', '{not valid json!!!');
		const blob = await zip.generateAsync({ type: 'blob' });

		await expect(parseBackupArchive(new File([blob], 'bad.zip'))).rejects.toThrow(
			PortabilityParseError,
		);
	});

	it('rejects archive with future format version', async () => {
		const { blob: goodBlob } = await buildBackupArchive(projectId);
		const zip = await JSZip.loadAsync(goodBlob);

		// Tamper the manifest to a future version
		const manifestContent = await zip.file('manifest.json')!.async('string');
		const manifest = JSON.parse(manifestContent);
		manifest.formatVersion = 999;
		zip.file('manifest.json', JSON.stringify(manifest));

		const tamperedBlob = await zip.generateAsync({ type: 'blob' });
		await expect(parseBackupArchive(new File([tamperedBlob], 'future.zip'))).rejects.toThrow(
			PortabilityParseError,
		);
	});

	it('rejects archive with checksum mismatch', async () => {
		const { blob: goodBlob } = await buildBackupArchive(projectId);
		const zip = await JSZip.loadAsync(goodBlob);

		// Tamper a payload file after archive creation
		zip.file('db/projects.json', '[{"tampered": true}]');

		const tamperedBlob = await zip.generateAsync({ type: 'blob' });
		await expect(parseBackupArchive(new File([tamperedBlob], 'corrupt.zip'))).rejects.toThrow(
			PortabilityParseError,
		);
	});
});
