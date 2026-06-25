import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createProseDiff } from '../../src/lib/ai/pipeline/prose-diff-helper.js';
import {
	PROSE_PARTIAL_INJECTION_EVENT,
	dispatchProsePartialInjection,
	type ProsePartialInjectionRange,
} from '../../src/lib/events/prose-injection.js';
import {
	applyPartialProseInjection,
	injectPartialProseIntoEditor,
	type ProseCursorBounds,
	type ProsePartialInjectorCommandChain,
	type ProsePartialInjectorEditor,
} from '../../src/modules/editor/services/prose-partial-injector.js';

function insertionRangesFromDiff(currentText: string, generatedText: string): ProsePartialInjectionRange[] {
	return createProseDiff(currentText, generatedText).segments.map((segment, index) => ({
		id: `segment-${index}`,
		text: segment.text,
		selected: segment.operation === 'insert',
		order: index,
	}));
}

describe('prose diff injection flow', () => {
	it('turns generated diff insertions into appendable prose without direct persistence', () => {
		const ranges = insertionRangesFromDiff('Alpha.', 'Alpha.\n\nBeta.');
		const result = applyPartialProseInjection({
			currentText: 'Alpha.',
			ranges,
			cursorBounds: null,
		});

		expect(result.nextText).toBe('Alpha.\n\nBeta.');
		expect(result.selectedRangeIds).toEqual(['segment-1']);
		expect(result.usedAppendFallback).toBe(true);
	});

	it('injects selected diff insertions through a single editor command chain', () => {
		const ranges = insertionRangesFromDiff('Alpha.', 'Alpha.\n\nBeta.');
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
			state: {
				selection: { from: 6, to: 6 },
				doc: { content: { size: 6 } },
			},
			chain: () => chain,
		};

		const result = injectPartialProseIntoEditor({ editor, ranges });

		expect(insertContentAt).toHaveBeenCalledWith({ from: 6, to: 6 }, 'Beta.');
		expect(result).toMatchObject({
			applied: true,
			selectedRangeIds: ['segment-1'],
			cursorPosition: 11,
		});
	});

	it('dispatches selected prose injection requests through the window event bridge', () => {
		const listener = vi.fn();
		window.addEventListener(PROSE_PARTIAL_INJECTION_EVENT, listener);
		const ranges = [{ id: 'segment-1', text: 'Beta.', selected: true, order: 1 }];

		dispatchProsePartialInjection({
			projectId: 'project-1',
			sceneId: 'scene-1',
			ranges,
		});

		expect(listener).toHaveBeenCalledTimes(1);
		const event = listener.mock.calls[0]?.[0] as CustomEvent | undefined;
		expect(event?.detail).toEqual({
			projectId: 'project-1',
			sceneId: 'scene-1',
			ranges,
		});
		window.removeEventListener(PROSE_PARTIAL_INJECTION_EVENT, listener);
	});

	it('keeps the editor shell wired to the injection event and service boundary', () => {
		const shell = readFileSync(
			resolve(process.cwd(), 'src/modules/editor/components/EditorShell.svelte'),
			'utf-8',
		);
		expect(shell).toContain('PROSE_PARTIAL_INJECTION_EVENT');
		expect(shell).toContain('handleProsePartialInjection');
		expect(shell).toContain('injectPartialProseIntoEditor');
		expect(shell).not.toContain('updateScene(detail.sceneId');
	});
});
