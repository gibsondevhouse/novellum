import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import type { ExportChapterOption } from '../services/export-chapter-options.js';
import ChapterSubsetSelector from './ChapterSubsetSelector.svelte';
import { createDefaultChapterSelection } from './chapter-selection.js';

const chapters: ExportChapterOption[] = [
	{ id: 'c1', title: 'One', order: 0, label: 'Chapter 1 - One' },
	{ id: 'c2', title: 'Two', order: 1, label: 'Chapter 2 - Two' },
];

describe('ChapterSubsetSelector', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
	});

	it('renders all/range/selected scope controls', () => {
		const component = mount(ChapterSubsetSelector, {
			target,
			props: {
				chapters,
				state: createDefaultChapterSelection(chapters),
				onChange: vi.fn(),
			},
		});
		flushSync();

		expect(target.textContent).toContain('All chapters');
		expect(target.textContent).toContain('Range');
		expect(target.textContent).toContain('Selected');
		expect(target.textContent).toContain('2 of 2 chapters selected');

		unmount(component);
	});

	it('shows empty manuscript state', () => {
		const component = mount(ChapterSubsetSelector, {
			target,
			props: {
				chapters: [],
				state: createDefaultChapterSelection([]),
				onChange: vi.fn(),
			},
		});
		flushSync();

		expect(target.textContent).toContain('Add at least one chapter');
		unmount(component);
	});

	it('switches to selected mode through callback', () => {
		const onChange = vi.fn();
		const component = mount(ChapterSubsetSelector, {
			target,
			props: {
				chapters,
				state: createDefaultChapterSelection(chapters),
				onChange,
			},
		});
		flushSync();

		const selectedInput = Array.from(target.querySelectorAll('label'))
			.find((label) => label.textContent?.includes('Selected'))
			?.querySelector('input');
		selectedInput?.click();

		expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ mode: 'selected' }));
		unmount(component);
	});
});
