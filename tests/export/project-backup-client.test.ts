/**
 * Tests for the SQLite-backed `.novellum` backup HTTP client.
 * Heavy lifting (server semantics) is covered by tests/backup/* and
 * tests/routes/api-*.test.ts; here we just exercise the wire format.
 */
import { describe, it, expect, vi } from 'vitest';
import {
	downloadProjectBackup,
	previewProjectBackup,
	restoreProjectBackup,
	ProjectBackupClientError,
} from '$modules/export/services/project-backup-client.js';

function makeFetchOk(body: BodyInit, headers: Record<string, string> = {}) {
	return vi.fn(async (_url: string, _init?: RequestInit) =>
		new Response(body, { status: 200, headers }),
	);
}

describe('downloadProjectBackup', () => {
	it('returns the archive blob and parses the filename header', async () => {
		const fakeBytes = new Uint8Array([1, 2, 3, 4]);
		const fetchImpl = makeFetchOk(fakeBytes, {
			'content-type': 'application/x-zip-compressed',
			'content-disposition': 'attachment; filename="my-project_2026-04-01.novellum"',
		});
		const result = await downloadProjectBackup('p1', fetchImpl as unknown as typeof fetch);
		expect(result.filename).toBe('my-project_2026-04-01.novellum');
		expect(result.contentType).toContain('zip');
		expect(await result.archive.size).toBe(4);
	});

	it('throws ProjectBackupClientError with parsed reason on failure', async () => {
		const fetchImpl = vi.fn(
			async () =>
				new Response(JSON.stringify({ error: 'project_not_found' }), {
					status: 404,
					headers: { 'content-type': 'application/json' },
				}),
		);
		await expect(
			downloadProjectBackup('missing', fetchImpl as unknown as typeof fetch),
		).rejects.toBeInstanceOf(ProjectBackupClientError);
	});

	it('falls back to a default filename when the header is absent', async () => {
		const fetchImpl = makeFetchOk(new Uint8Array(), {
			'content-type': 'application/x-zip-compressed',
		});
		const result = await downloadProjectBackup('p2', fetchImpl as unknown as typeof fetch);
		expect(result.filename).toBe('project-p2.novellum');
	});
});

describe('previewProjectBackup', () => {
	it('parses the JSON body of a successful response', async () => {
		const preview = {
			manifest: null,
			tableCounts: { projects: 1 },
			checksumStatus: 'ok',
			compatibility: { canRestore: true, bundledSchemaVersion: 2, archiveSchemaVersion: 2 },
			warnings: [],
		};
		const fetchImpl = vi.fn(
			async () =>
				new Response(JSON.stringify(preview), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				}),
		);
		const file = new Blob([new Uint8Array(8)]);
		const out = await previewProjectBackup(file, fetchImpl as unknown as typeof fetch);
		expect(out.tableCounts.projects).toBe(1);
		expect(out.compatibility.canRestore).toBe(true);
	});
});

describe('restoreProjectBackup', () => {
	it('serialises mode + target into the query string', async () => {
		const fetchImpl = vi.fn(
			async (_url: string) =>
				new Response(
					JSON.stringify({
						projectId: 'p-new',
						mode: 'copy',
						snapshotPath: '/tmp/snap.sqlite',
						tableRowCounts: {},
					}),
					{ status: 200, headers: { 'content-type': 'application/json' } },
				),
		);
		const file = new Blob([new Uint8Array(8)]);
		const result = await restoreProjectBackup(
			file,
			{ mode: 'copy' },
			fetchImpl as unknown as typeof fetch,
		);
		expect(result.projectId).toBe('p-new');
		const calledWith = (fetchImpl as unknown as { mock: { calls: [string][] } }).mock.calls[0][0];
		expect(calledWith).toContain('mode=copy');
	});
});
