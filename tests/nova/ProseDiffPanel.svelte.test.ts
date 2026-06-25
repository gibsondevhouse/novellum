import { describe, expect, it, beforeEach, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import ProseDiffPanel from '../../src/modules/nova/components/ProseDiffPanel.svelte';

describe('ProseDiffPanel', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('renders split diff columns with insertion and deletion highlights', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const component = mount(ProseDiffPanel, {
			target,
			props: {
				currentText: 'The old cat sat.',
				generatedText: 'The new cat sat.',
			},
		});
		flushSync();

		expect(target.querySelector('[data-testid="prose-diff-panel"]')?.getAttribute('data-mode')).toBe(
			'split',
		);
		expect(target.textContent).toContain('3 chars added');
		expect(target.textContent).toContain('3 chars deleted');
		expect(
			target.querySelector('[data-testid="prose-diff-current"] [data-operation="delete"]')
				?.textContent,
		).toBe('old');
		expect(
			target.querySelector('[data-testid="prose-diff-generated"] [data-operation="insert"]')
				?.textContent,
		).toBe('new');
		unmount(component);
	});

	it('toggles to unified diff layout', async () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const component = mount(ProseDiffPanel, {
			target,
			props: {
				currentText: 'old',
				generatedText: 'new',
			},
		});
		flushSync();

		const unifiedButton = target.querySelector(
			'button[aria-label="Show unified diff"]',
		) as HTMLButtonElement;
		unifiedButton.click();
		await tick();
		flushSync();

		expect(target.querySelector('[data-testid="prose-diff-panel"]')?.getAttribute('data-mode')).toBe(
			'unified',
		);
		expect(target.querySelector('[data-testid="prose-diff-unified"]')).not.toBeNull();
		expect(target.querySelector('[data-testid="prose-diff-unified"] [data-operation="delete"]')?.textContent).toBe(
			'old',
		);
		expect(target.querySelector('[data-testid="prose-diff-unified"] [data-operation="insert"]')?.textContent).toBe(
			'new',
		);
		unmount(component);
	});

	it('renders an unchanged state when prose matches', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const component = mount(ProseDiffPanel, {
			target,
			props: {
				currentText: 'same',
				generatedText: 'same',
			},
		});
		flushSync();

		expect(target.querySelector('[data-testid="prose-diff-empty"]')?.textContent).toBe(
			'No prose changes.',
		);
		unmount(component);
	});

	it('publishes selected insertion ranges for editor injection', async () => {
		const onInjectSelected = vi.fn();
		const target = document.createElement('div');
		document.body.appendChild(target);
		const component = mount(ProseDiffPanel, {
			target,
			props: {
				currentText: 'One.',
				generatedText: 'One.\n\nTwo.',
				onInjectSelected,
			},
		});
		flushSync();

		const button = target.querySelector('.diff-inject-button') as HTMLButtonElement;
		button.click();
		await tick();
		flushSync();

		expect(onInjectSelected).toHaveBeenCalledWith([
			{
				id: 'diff-segment-1',
				text: '\n\nTwo.',
				selected: true,
				order: 1,
			},
		]);

		const checkbox = target.querySelector(
			'input[aria-label="Select inserted prose"]',
		) as HTMLInputElement;
		checkbox.checked = false;
		checkbox.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();
		flushSync();

		expect(button.disabled).toBe(true);
		unmount(component);
	});
});
