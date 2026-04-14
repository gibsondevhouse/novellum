import { describe, it, expect, beforeEach } from 'vitest';
import JSZip from 'jszip';
import { db, resetDb } from '$lib/db/index.js';
import { buildBackupArchive } from '$modules/export/services/portability/zip-export.js';
import {
	parseBackupArchive,
	PortabilityParseError,
} from '$modules/export/services/portability/zip-import-parse.js';

describe('portability failure modes', () => {
	beforeEach(async () => {
		await resetDb();
	});

	it('rejects non-ZIP file', async () => {
		const file = new File(['not a zip'], 'fake.zip', { type: 'application/zip' });
		await expect(parseBackupArchive(file)).rejects.toThrow();
	});

	it('rejects ZIP without manifest.json', async () => {
		const zip = new JSZip();
		zip.file('readme.txt', 'hello');
		const blob = await zip.generateAsync({ type: 'blob' });

		try {
			await parseBackupArchive(new File([blob], 'no-manifest.zip'));
			expect.fail('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(PortabilityParseError);
			expect((e as PortabilityParseError).code).toBe('MISSING_MANIFEST');
		}
	});

	it('rejects archive with invalid JSON manifest', async () => {
		const zip = new JSZip();
		zip.file('manifest.json', '{{invalid json');
		const blob = await zip.generateAsync({ type: 'blob' });

		try {
			await parseBackupArchive(new File([blob], 'bad-json.zip'));
			expect.fail('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(PortabilityParseError);
			expect((e as PortabilityParseError).code).toBe('MALFORMED_MANIFEST');
		}
	});

	it('rejects archive with unsupported future format version', async () => {
		await db.projects.add({
			id: 'future-proj',
			title: 'Future',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			systemPrompt: '',
			negativePrompt: '',
			status: 'draft',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		const { blob } = await buildBackupArchive('future-proj');

		// Tamper manifest
		const zip = await JSZip.loadAsync(blob);
		const manifestJson = await zip.file('manifest.json')!.async('string');
		const manifest = JSON.parse(manifestJson);
		manifest.formatVersion = 999;
		zip.file('manifest.json', JSON.stringify(manifest));
		const tampered = await zip.generateAsync({ type: 'blob' });

		try {
			await parseBackupArchive(new File([tampered], 'future.zip'));
			expect.fail('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(PortabilityParseError);
			expect((e as PortabilityParseError).code).toBe('FUTURE_FORMAT_VERSION');
		}
	});

	it('rejects archive with corrupted payload (checksum mismatch)', async () => {
		await db.projects.add({
			id: 'corrupt-proj',
			title: 'Corrupt',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			systemPrompt: '',
			negativePrompt: '',
			status: 'draft',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		const { blob } = await buildBackupArchive('corrupt-proj');

		// Tamper a payload file
		const zip = await JSZip.loadAsync(blob);
		zip.file('db/projects.json', '[{"id":"corrupt","tampered":true}]');
		const tampered = await zip.generateAsync({ type: 'blob' });

		try {
			await parseBackupArchive(new File([tampered], 'corrupt.zip'));
			expect.fail('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(PortabilityParseError);
			expect((e as PortabilityParseError).code).toBe('CHECKSUM_MISMATCH');
		}
	});

	it('rejects archive with future DB schema version', async () => {
		await db.projects.add({
			id: 'schema-proj',
			title: 'Schema',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			systemPrompt: '',
			negativePrompt: '',
			status: 'draft',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		const { blob } = await buildBackupArchive('schema-proj');

		const zip = await JSZip.loadAsync(blob);
		const manifestJson = await zip.file('manifest.json')!.async('string');
		const manifest = JSON.parse(manifestJson);
		manifest.dbSchemaVersion = 999;
		zip.file('manifest.json', JSON.stringify(manifest));
		const tampered = await zip.generateAsync({ type: 'blob' });

		try {
			await parseBackupArchive(new File([tampered], 'future-schema.zip'));
			expect.fail('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(PortabilityParseError);
			expect((e as PortabilityParseError).code).toBe('FUTURE_DB_SCHEMA_VERSION');
		}
	});
});
