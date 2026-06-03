import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import type { ExportChapterOption } from '../services/export-chapter-options.js';

const mocks = vi.hoisted(() => ({
	getExportChapterOptions: vi.fn(),
	exportProject: vi.fn(),
	deliverExportBlob: vi.fn(),
}));

vi.mock('../services/export-chapter-options.js', () => ({
	getExportChapterOptions: mocks.getExportChapterOptions,
}));

vi.mock('../services/export-service.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../services/export-service.js')>();
	return {
		...actual,
		exportProject: mocks.exportProject,
	};
});

vi.mock('../services/export-delivery.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../services/export-delivery.js')>();
	return {
		...actual,
		deliverExportBlob: mocks.deliverExportBlob,
	};
});

import ManuscriptExportDialog from './ManuscriptExportDialog.svelte';

const chapters: ExportChapterOption[] = [
	{ id: 'c1', title: 'One', order: 0, label: 'Chapter 1 - One' },
	{ id: 'c2', title: 'Two', order: 1, label: 'Chapter 2 - Two' },
];

async function settle(): Promise<void> {
	await tick();
	await Promise.resolve();
	await tick();
	flushSync();
}

function mountDialog(target: HTMLElement, onClose = vi.fn()) {
	return mount(ManuscriptExportDialog, {
		target,
		props: {
			projectId: 'p1',
			projectTitle: 'Project Novel',
			open: true,
			onClose,
		},
	});
}

describe('ManuscriptExportDialog', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		mocks.getExportChapterOptions.mockReset();
		mocks.exportProject.mockReset();
		mocks.deliverExportBlob.mockReset();
		mocks.getExportChapterOptions.mockResolvedValue(chapters);
		mocks.exportProject.mockResolvedValue({
			filename: 'project_novel.md',
			blob: new Blob(['markdown']),
		});
		mocks.deliverExportBlob.mockResolvedValue({
			status: 'downloaded',
			method: 'browser',
			filename: 'project_novel.md',
		});
	});

	it('renders nothing when closed', () => {
		const component = mount(ManuscriptExportDialog, {
			target,
			props: {
				projectId: 'p1',
				projectTitle: 'Project Novel',
				open: false,
				onClose: vi.fn(),
			},
		});
		flushSync();

		expect(target.textContent).toBe('');
		unmount(component);
	});

	it('renders the dialog sections and project title default', async () => {
		const component = mountDialog(target);
		await settle();

		expect(target.textContent).toContain('Export manuscript');
		expect(target.textContent).toContain('Format');
		expect(target.textContent).toContain('Profile');
		expect(target.textContent).toContain('Metadata');
		expect(target.textContent).toContain('Chapters');
		expect(target.textContent).toContain('Formatting');
		expect((target.querySelector('input[name="title"]') as HTMLInputElement).value).toBe(
			'Project Novel',
		);

		unmount(component);
	});

	it('calls onClose from the close control', async () => {
		const onClose = vi.fn();
		const component = mountDialog(target, onClose);
		await settle();

		const closeButton = Array.from(target.querySelectorAll('button')).find((button) =>
			button.textContent?.includes('Close'),
		);
		closeButton?.click();

		expect(onClose).toHaveBeenCalledOnce();
		unmount(component);
	});

	it('exports and delivers a manuscript successfully', async () => {
		const component = mountDialog(target);
		await settle();

		const exportButton = Array.from(target.querySelectorAll('button')).find((button) =>
			button.textContent?.includes('Export manuscript'),
		);
		exportButton?.click();
		await settle();

		expect(mocks.exportProject).toHaveBeenCalledWith(
			'p1',
			expect.objectContaining({
				compileOptions: expect.objectContaining({
					profileId: 'standard_manuscript',
					selectedChapterIds: undefined,
				}),
			}),
		);
		expect(mocks.deliverExportBlob).toHaveBeenCalledWith(expect.any(Blob), 'project_novel.md', {
			preference: 'browser_download',
		});
		expect(target.textContent).toContain('Downloaded project_novel.md');

		unmount(component);
	});

	it('includes selected chapter IDs when selected scope is active', async () => {
		const component = mountDialog(target);
		await settle();

		const selectedRadio = target.querySelectorAll<HTMLInputElement>(
			'input[name="chapter-scope"]',
		)[2];
		selectedRadio?.click();
		await settle();

		const exportButton = Array.from(target.querySelectorAll('button')).find((button) =>
			button.textContent?.includes('Export manuscript'),
		);
		exportButton?.click();
		await settle();

		expect(mocks.exportProject).toHaveBeenCalledWith(
			'p1',
			expect.objectContaining({
				compileOptions: expect.objectContaining({
					selectedChapterIds: ['c1', 'c2'],
				}),
			}),
		);

		unmount(component);
	});

	it('blocks export for empty manuscripts before calling the service', async () => {
		mocks.getExportChapterOptions.mockResolvedValue([]);
		const component = mountDialog(target);
		await settle();

		expect(target.textContent).toContain('Add at least one chapter');
		const exportButton = Array.from(target.querySelectorAll('button')).find((button) =>
			button.textContent?.includes('Export manuscript'),
		);
		expect(exportButton?.disabled).toBe(true);
		expect(mocks.exportProject).not.toHaveBeenCalled();

		unmount(component);
	});

	it('shows generation failure with retry', async () => {
		mocks.exportProject.mockRejectedValue(new Error('Generation failed.'));
		const component = mountDialog(target);
		await settle();

		const exportButton = Array.from(target.querySelectorAll('button')).find((button) =>
			button.textContent?.includes('Export manuscript'),
		);
		exportButton?.click();
		await settle();

		expect(target.textContent).toContain('Generation failed.');
		expect(target.textContent).toContain('Retry');

		unmount(component);
	});

	it('shows neutral cancellation from delivery', async () => {
		mocks.deliverExportBlob.mockResolvedValue({
			status: 'cancelled',
			method: 'desktop',
			filename: 'project_novel.md',
		});
		const component = mountDialog(target);
		await settle();

		const exportButton = Array.from(target.querySelectorAll('button')).find((button) =>
			button.textContent?.includes('Export manuscript'),
		);
		exportButton?.click();
		await settle();

		expect(target.textContent).toContain('Save cancelled.');
		expect(target.querySelector('[role="alert"]')?.textContent ?? '').not.toContain(
			'Save cancelled',
		);

		unmount(component);
	});
});
