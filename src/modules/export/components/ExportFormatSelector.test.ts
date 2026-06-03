import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import ExportFormatSelector from './ExportFormatSelector.svelte';

describe('ExportFormatSelector', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
	});

	it('renders supported formats from constants and excludes PDF', () => {
		const component = mount(ExportFormatSelector, {
			target,
			props: { value: 'markdown', onChange: vi.fn() },
		});
		flushSync();

		expect(target.textContent).toContain('Markdown');
		expect(target.textContent).toContain('DOCX');
		expect(target.textContent).toContain('EPUB');
		expect(target.textContent).toContain('Project backup');
		expect(target.textContent).not.toMatch(/\bPDF\b/);

		unmount(component);
	});

	it('calls onChange when a format is selected', () => {
		const onChange = vi.fn();
		const component = mount(ExportFormatSelector, {
			target,
			props: { value: 'markdown', onChange },
		});
		flushSync();

		const docxInput = Array.from(target.querySelectorAll('label'))
			.find((label) => label.textContent?.includes('DOCX'))
			?.querySelector('input');
		docxInput?.click();

		expect(onChange).toHaveBeenCalledWith('docx');
		unmount(component);
	});
});
