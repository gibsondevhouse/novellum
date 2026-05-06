import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import ClassicReaderView from '$modules/reader/components/ClassicReaderView.svelte';

/**
 * plan-023 stage-003 phase-004 — ClassicReaderView deep-link.
 *
 * On mount, when `targetSceneId` matches a rendered `#scene-<id>`
 * anchor, the component schedules a single rAF and then calls
 * `Element.prototype.scrollIntoView({ behavior: 'instant', block: 'start' })`
 * on the matching node. Unknown ids are no-ops.
 */

const project = {
	id: 'p1',
	title: 'Deep-Link Test',
	genre: 'Test',
	logline: 'fixture',
};

const chapters = [
	{
		id: 'c1',
		title: 'Chapter 1',
		order: 1,
		scenes: [
			{ id: 'scene-1', title: 'Scene 1', order: 1, content: '<p>Body 1.</p>' },
			{ id: 'scene-2', title: 'Scene 2', order: 2, content: '<p>Body 2.</p>' },
			{ id: 'scene-3', title: 'Scene 3', order: 3, content: '<p>Body 3.</p>' },
		],
	},
];

describe('ClassicReaderView deep-link (targetSceneId)', () => {
	let target: HTMLElement;
	let scrollSpy: ReturnType<typeof vi.spyOn>;
	let rafSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);

		// jsdom does not implement scrollIntoView; install a stub before spying.
		if (typeof Element.prototype.scrollIntoView !== 'function') {
			Object.defineProperty(Element.prototype, 'scrollIntoView', {
				configurable: true,
				writable: true,
				value: function scrollIntoView(): void {},
			});
		}
		scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});

		// Run the rAF callback synchronously so the spy resolves before assertions.
		rafSpy = vi
			.spyOn(window, 'requestAnimationFrame')
			.mockImplementation((cb: FrameRequestCallback) => {
				cb(0);
				return 0;
			});
	});

	afterEach(() => {
		scrollSpy.mockRestore();
		rafSpy.mockRestore();
	});

	it('scrolls the matching scene anchor into view on mount', () => {
		const cmp = mount(ClassicReaderView, {
			target,
			props: { project, chapters, targetSceneId: 'scene-2' },
		});
		flushSync();

		expect(scrollSpy).toHaveBeenCalledTimes(1);
		const callContext = scrollSpy.mock.contexts[0] as HTMLElement;
		expect(callContext.id).toBe('scene-scene-2');
		expect(scrollSpy.mock.calls[0][0]).toEqual({ behavior: 'instant', block: 'start' });

		unmount(cmp);
	});

	it('does not call scrollIntoView when targetSceneId is unknown', () => {
		const cmp = mount(ClassicReaderView, {
			target,
			props: { project, chapters, targetSceneId: 'does-not-exist' },
		});
		flushSync();

		expect(scrollSpy).not.toHaveBeenCalled();

		unmount(cmp);
	});

	it('does not call scrollIntoView when targetSceneId is null', () => {
		const cmp = mount(ClassicReaderView, {
			target,
			props: { project, chapters, targetSceneId: null },
		});
		flushSync();

		expect(scrollSpy).not.toHaveBeenCalled();

		unmount(cmp);
	});
});
