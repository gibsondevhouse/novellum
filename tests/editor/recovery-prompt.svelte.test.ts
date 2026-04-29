import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import RecoveryPrompt from '$modules/editor/components/RecoveryPrompt.svelte';
import * as recoveryService from '$modules/editor/services/recovery-service.js';
import * as autosaveService from '$modules/editor/services/autosave-service.js';
import * as sceneRepo from '$modules/editor/services/scene-repository.js';
import * as snapshotRepo from '$modules/editor/services/snapshot-repository.js';
import type { PendingDraft } from '$modules/editor/services/recovery-service.js';

describe('RecoveryPrompt.svelte (pull-the-plug)', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		window.localStorage.clear();
	});

	afterEach(() => {
		window.localStorage.clear();
		vi.restoreAllMocks();
		autosaveService.unmount();
	});

	function makeDraft(): PendingDraft {
		return {
			sceneId: 'scene-1',
			projectId: 'project-1',
			text: '<p>recovered</p>',
			savedAt: new Date(Date.now() - 30_000).toISOString(),
		};
	}

	it('renders the recovery dialog with the draft age', () => {
		const draft = makeDraft();
		const cmp = mount(RecoveryPrompt, {
			target,
			props: { draft, onRestore: () => {}, onDiscard: () => {} },
		});
		const dialog = target.querySelector('[role="alertdialog"]');
		expect(dialog).not.toBeNull();
		expect(dialog?.getAttribute('aria-modal')).toBe('true');
		expect(target.textContent).toContain('Recover unsaved draft?');
		expect(target.textContent).toMatch(/\d+s ago|\d+m ago/);
		unmount(cmp);
	});

	it('Restore button invokes onRestore with the draft', () => {
		const draft = makeDraft();
		const onRestore = vi.fn();
		const cmp = mount(RecoveryPrompt, {
			target,
			props: { draft, onRestore, onDiscard: () => {} },
		});
		const restoreBtn = target.querySelector('.btn-primary') as HTMLButtonElement;
		restoreBtn.click();
		expect(onRestore).toHaveBeenCalledWith(draft);
		unmount(cmp);
	});

	it('Discard button invokes onDiscard with the draft', () => {
		const draft = makeDraft();
		const onDiscard = vi.fn();
		const cmp = mount(RecoveryPrompt, {
			target,
			props: { draft, onRestore: () => {}, onDiscard },
		});
		const discardBtn = target.querySelector('.btn-secondary') as HTMLButtonElement;
		discardBtn.click();
		expect(onDiscard).toHaveBeenCalledWith(draft);
		unmount(cmp);
	});

	it('end-to-end: surviving keystroke is detected after a simulated crash', () => {
		// 1. Author types into a scene; autosave mirrors the pending
		//    draft to localStorage on every keystroke.
		vi.spyOn(sceneRepo, 'updateScene').mockResolvedValue(undefined as never);
		vi.spyOn(snapshotRepo, 'createSnapshot').mockResolvedValue(undefined as never);

		autosaveService.mount('scene-1', 'project-1');
		autosaveService.schedule('<p>survived the crash</p>');

		// 2. Process dies before the debounce window flushes.
		//    Simulate by unmounting without flushNow().
		autosaveService.unmount();

		// 3. App relaunches and the editor route mounts the same scene.
		//    The stored server text is still the pre-crash value.
		const recovered = recoveryService.inspectDraft('scene-1', '<p>before crash</p>');
		expect(recovered).not.toBeNull();
		expect(recovered?.text).toBe('<p>survived the crash</p>');

		// 4. Recovery prompt offers the restore.
		const onRestore = vi.fn();
		const cmp = mount(RecoveryPrompt, {
			target,
			props: { draft: recovered as PendingDraft, onRestore, onDiscard: () => {} },
		});
		flushSync();
		(target.querySelector('.btn-primary') as HTMLButtonElement).click();
		expect(onRestore).toHaveBeenCalledWith(recovered);
		unmount(cmp);
	});
});
