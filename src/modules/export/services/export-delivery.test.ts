import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	deliverExportBlob,
	downloadBlobToBrowser,
	ExportDeliveryError,
} from './export-delivery.js';

const createObjectURL = vi.fn(() => 'blob:test-url');
const revokeObjectURL = vi.fn();

beforeEach(() => {
	vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
	document.body.innerHTML = '';
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('downloadBlobToBrowser', () => {
	it('creates an object URL, clicks an anchor, and revokes the URL', () => {
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

		downloadBlobToBrowser(new Blob(['hello']), 'novel.md');

		expect(createObjectURL).toHaveBeenCalledOnce();
		expect(click).toHaveBeenCalledOnce();
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
		expect(document.querySelector('a')).toBeNull();
	});
});

describe('deliverExportBlob', () => {
	it('uses browser download when desktop is not requested', async () => {
		const download = vi.fn();

		const result = await deliverExportBlob(
			new Blob(['x']),
			'novel.md',
			{ preference: 'browser_download' },
			{ download, isDesktopRuntime: () => false },
		);

		expect(download).toHaveBeenCalledWith(expect.any(Blob), 'novel.md');
		expect(result).toEqual({ status: 'downloaded', method: 'browser', filename: 'novel.md' });
	});

	it('returns cancelled when the desktop save picker is cancelled', async () => {
		const download = vi.fn();

		const result = await deliverExportBlob(
			new Blob(['x']),
			'novel.md',
			{ preference: 'desktop_save' },
			{
				download,
				isDesktopRuntime: () => true,
				desktop: {
					openDataFolder: vi.fn(),
					revealItemInFolder: vi.fn(),
					pickOpenLocation: vi.fn(),
					pickSaveLocation: vi.fn(async () => null),
				},
			},
		);

		expect(result.status).toBe('cancelled');
		expect(download).not.toHaveBeenCalled();
	});

	it('falls back to browser download when desktop save is unimplemented', async () => {
		const download = vi.fn();

		const result = await deliverExportBlob(
			new Blob(['x']),
			'novel.md',
			{ preference: 'auto' },
			{
				download,
				isDesktopRuntime: () => true,
				desktop: {
					openDataFolder: vi.fn(),
					revealItemInFolder: vi.fn(),
					pickOpenLocation: vi.fn(),
					pickSaveLocation: vi.fn(async () => {
						throw new Error('desktop.pickSaveLocation is not implemented yet.');
					}),
				},
			},
		);

		expect(result.status).toBe('downloaded');
		expect(download).toHaveBeenCalledOnce();
	});

	it('returns saved when an existing desktop writer is supplied', async () => {
		const writeDesktopFile = vi.fn(async () => {});

		const result = await deliverExportBlob(
			new Blob(['x']),
			'novel.md',
			{ preference: 'desktop_save' },
			{
				isDesktopRuntime: () => true,
				writeDesktopFile,
				desktop: {
					openDataFolder: vi.fn(),
					revealItemInFolder: vi.fn(),
					pickOpenLocation: vi.fn(),
					pickSaveLocation: vi.fn(async () => '/tmp/novel.md'),
				},
			},
		);

		expect(writeDesktopFile).toHaveBeenCalledWith('/tmp/novel.md', expect.any(Blob));
		expect(result).toEqual({
			status: 'saved',
			method: 'desktop',
			filename: 'novel.md',
			path: '/tmp/novel.md',
		});
	});

	it('surfaces browser fallback failures', async () => {
		await expect(
			deliverExportBlob(
				new Blob(['x']),
				'novel.md',
				{ preference: 'browser_download' },
				{
					download: () => {
						throw new Error('blocked');
					},
					isDesktopRuntime: () => false,
				},
			),
		).rejects.toBeInstanceOf(ExportDeliveryError);
	});
});
