import { describe, it, expect, beforeEach } from 'vitest';
import { mount, unmount } from 'svelte';
import SaveStatus from '$modules/editor/components/SaveStatus.svelte';
import type { AutosaveResult } from '$modules/editor/services/autosave-types.js';

function render(result: AutosaveResult, now?: () => number) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const component = mount(SaveStatus, { target, props: { result, now } });
	return {
		target,
		component,
		text: () => target.textContent?.trim() ?? '',
		el: () => target.querySelector('.save-status') as HTMLElement,
		cleanup: () => {
			unmount(component);
			target.remove();
		},
	};
}

describe('SaveStatus.svelte', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('renders idle by default', () => {
		const r = render({ status: 'idle', savedAt: null, error: null, pendingDraft: null, attempt: 0 });
		expect(r.text()).toBe('Idle');
		expect(r.el().dataset.tone).toBe('idle');
		expect(r.el().getAttribute('aria-live')).toBe('polite');
		r.cleanup();
	});

	it('renders saving on first attempt', () => {
		const r = render({ status: 'saving', savedAt: null, error: null, pendingDraft: null, attempt: 0 });
		expect(r.text()).toBe('Saving…');
		expect(r.el().dataset.tone).toBe('saving');
		r.cleanup();
	});

	it('renders retrying with attempt count', () => {
		const r = render({ status: 'saving', savedAt: null, error: null, pendingDraft: null, attempt: 2 });
		expect(r.text()).toContain('Retrying');
		expect(r.text()).toContain('attempt 2');
		r.cleanup();
	});

	it('renders saved with relative time', () => {
		const fixedNow = 1_700_000_000_000;
		const savedIso = new Date(fixedNow - 30_000).toISOString();
		const r = render(
			{ status: 'saved', savedAt: savedIso, error: null, pendingDraft: null, attempt: 0 },
			() => fixedNow,
		);
		expect(r.text()).toContain('Saved');
		expect(r.text()).toContain('30s ago');
		expect(r.el().dataset.tone).toBe('saved');
		r.cleanup();
	});

	it('renders failed with sanitised error message', () => {
		const r = render({
			status: 'failed',
			savedAt: null,
			error: 'Network unreachable',
			pendingDraft: '<p>x</p>',
			attempt: 3,
		});
		expect(r.text()).toBe('Network unreachable');
		expect(r.el().dataset.tone).toBe('failed');
		r.cleanup();
	});
});
