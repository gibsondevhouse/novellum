import { describe, expect, it, vi } from 'vitest';
import {
	applyPartialProseInjection,
	collectSelectedProseParagraphs,
	injectPartialProseIntoEditor,
	type ProseCursorBounds,
	type ProsePartialInjectorCommandChain,
	type ProsePartialInjectorEditor,
} from '../../src/modules/editor/services/prose-partial-injector.js';

const ranges = [
	{ id: 'p1', text: 'First selected paragraph.', selected: true, order: 2 },
	{ id: 'p2', text: '  ', selected: true, order: 1 },
	{ id: 'p3', text: 'Skipped paragraph.', selected: false, order: 3 },
	{ id: 'p4', text: 'Second selected paragraph.', selected: true, order: 1 },
];

describe('prose partial injector', () => {
	it('collects selected non-empty paragraphs in visual order', () => {
		expect(collectSelectedProseParagraphs(ranges)).toEqual([
			{ id: 'p4', text: 'Second selected paragraph.', order: 1 },
			{ id: 'p1', text: 'First selected paragraph.', order: 2 },
		]);
	});

	it('injects selected prose at active cursor bounds', () => {
		const result = applyPartialProseInjection({
			currentText: 'Alpha .',
			ranges: [{ id: 'p1', text: 'inserted', selected: true }],
			cursorBounds: { from: 6, to: 6 },
		});

		expect(result).toMatchObject({
			applied: true,
			nextText: 'Alpha inserted.',
			from: 6,
			to: 6,
			cursorPosition: 14,
			usedAppendFallback: false,
			selectedRangeIds: ['p1'],
		});
	});

	it('replaces highlighted cursor ranges and moves the cursor after the injected text', () => {
		const result = applyPartialProseInjection({
			currentText: 'Alpha beta.',
			ranges: [{ id: 'p1', text: 'omega', selected: true }],
			cursorBounds: { from: 6, to: 10 },
		});

		expect(result.nextText).toBe('Alpha omega.');
		expect(result.cursorPosition).toBe(11);
	});

	it('appends to the end when no active cursor bounds are available', () => {
		const result = applyPartialProseInjection({
			currentText: 'Alpha.',
			ranges: [{ id: 'p1', text: 'Omega.', selected: true }],
			cursorBounds: null,
		});

		expect(result.nextText).toBe('Alpha.\n\nOmega.');
		expect(result.from).toBe(6);
		expect(result.cursorPosition).toBe(14);
		expect(result.usedAppendFallback).toBe(true);
	});

	it('returns a no-op result when no highlighted paragraphs are selected', () => {
		const result = applyPartialProseInjection({
			currentText: 'Alpha.',
			ranges: [{ id: 'p1', text: 'Omega.', selected: false }],
			cursorBounds: { from: 2, to: 2 },
		});

		expect(result).toMatchObject({
			applied: false,
			reason: 'empty_selection',
			nextText: 'Alpha.',
			cursorPosition: 2,
		});
	});

	it('runs selected prose through a TipTap-like command chain at the editor selection', () => {
		const insertContentAt = vi.fn();
		const setTextSelection = vi.fn();
		const chain: ProsePartialInjectorCommandChain = {
			focus: vi.fn(() => chain),
			insertContentAt: vi.fn((position: number | ProseCursorBounds, content: string) => {
				insertContentAt(position, content);
				return chain;
			}),
			setTextSelection: vi.fn((position: number) => {
				setTextSelection(position);
				return chain;
			}),
			run: vi.fn(() => true),
		};
		const editor: ProsePartialInjectorEditor = {
			state: {
				selection: { from: 4, to: 8 },
				doc: { content: { size: 20 } },
			},
			chain: () => chain,
		};

		const result = injectPartialProseIntoEditor({
			editor,
			ranges: [{ id: 'p1', text: 'Draft text', selected: true }],
		});

		expect(insertContentAt).toHaveBeenCalledWith({ from: 4, to: 8 }, 'Draft text');
		expect(setTextSelection).toHaveBeenCalledWith(14);
		expect(result).toMatchObject({
			applied: true,
			from: 4,
			to: 8,
			cursorPosition: 14,
			usedAppendFallback: false,
		});
	});

	it('falls back to editor document end when the editor has no active selection', () => {
		const insertContentAt = vi.fn();
		const chain: ProsePartialInjectorCommandChain = {
			focus: vi.fn(() => chain),
			insertContentAt: vi.fn((position: number | ProseCursorBounds, content: string) => {
				insertContentAt(position, content);
				return chain;
			}),
			setTextSelection: vi.fn(() => chain),
			run: vi.fn(() => true),
		};
		const editor: ProsePartialInjectorEditor = {
			state: { doc: { content: { size: 12 } } },
			chain: () => chain,
		};

		const result = injectPartialProseIntoEditor({
			editor,
			ranges: [{ id: 'p1', text: 'Tail', selected: true }],
		});

		expect(insertContentAt).toHaveBeenCalledWith({ from: 12, to: 12 }, 'Tail');
		expect(result.cursorPosition).toBe(16);
		expect(result.usedAppendFallback).toBe(true);
	});
});
