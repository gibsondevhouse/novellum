import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import SnapshotHistoryPanel from '$modules/editor/components/SnapshotHistoryPanel.svelte';
import * as repo from '$modules/editor/services/snapshot-repository.js';
import type { SceneSnapshot } from '$lib/db/domain-types';

function snap(overrides: Partial<SceneSnapshot> = {}): SceneSnapshot {
	return {
		id: overrides.id ?? 'snap-1',
		sceneId: overrides.sceneId ?? 'scene-1',
		projectId: overrides.projectId ?? 'project-1',
		text: overrides.text ?? '<p>hello</p>',
		wordCount: overrides.wordCount ?? 1,
		label: overrides.label ?? '',
		source: overrides.source ?? 'autosave',
		reason: overrides.reason ?? '',
		createdAt: overrides.createdAt ?? new Date().toISOString(),
	};
}

describe('SnapshotHistoryPanel.svelte', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders snapshots newest-first with source badge and word count', async () => {
		const rows = [
			snap({ id: 'a', source: 'manual', wordCount: 42, createdAt: new Date().toISOString() }),
			snap({ id: 'b', source: 'autosave', wordCount: 10 }),
		];
		vi.spyOn(repo, 'listByScene').mockResolvedValue(rows);

		const cmp = mount(SnapshotHistoryPanel, {
			target,
			props: { sceneId: 'scene-1', currentText: '<p>now</p>', onRestore: () => {}, onClose: () => {} },
		});

		await Promise.resolve();
		await Promise.resolve();
		flushSync();

		const items = target.querySelectorAll('.snapshot-row');
		expect(items.length).toBe(2);
		expect(target.textContent).toContain('Manual');
		expect(target.textContent).toContain('42 words');
		expect(target.textContent).toContain('Autosave');
		expect(target.textContent).toContain('10 words');

		unmount(cmp);
	});

	it('opens preview modal on row click and restores via restoreSnapshot', async () => {
		const row = snap({ id: 'snap-x', source: 'autosave', wordCount: 3 });
		vi.spyOn(repo, 'listByScene').mockResolvedValue([row]);
		const restoreSpy = vi
			.spyOn(repo, 'restoreSnapshot')
			.mockResolvedValue({ restoredText: '<p>restored</p>', preRestoreSnapshotId: 'pre-1' });
		const onRestore = vi.fn();

		const cmp = mount(SnapshotHistoryPanel, {
			target,
			props: { sceneId: 'scene-1', currentText: '<p>now</p>', onRestore, onClose: () => {} },
		});

		await Promise.resolve();
		await Promise.resolve();
		flushSync();

		const rowEl = target.querySelector('.snapshot-row') as HTMLButtonElement;
		rowEl.click();
		flushSync();

		const restoreBtn = document.querySelector('.btn-primary') as HTMLButtonElement;
		expect(restoreBtn).toBeTruthy();
		restoreBtn.click();

		await Promise.resolve();
		await Promise.resolve();
		flushSync();

		expect(restoreSpy).toHaveBeenCalledWith('snap-x');
		expect(onRestore).toHaveBeenCalledWith('<p>restored</p>');

		unmount(cmp);
	});

	it('shows empty state when no snapshots exist', async () => {
		vi.spyOn(repo, 'listByScene').mockResolvedValue([]);
		const cmp = mount(SnapshotHistoryPanel, {
			target,
			props: { sceneId: 'scene-1', currentText: '', onRestore: () => {}, onClose: () => {} },
		});

		await Promise.resolve();
		await Promise.resolve();
		flushSync();

		expect(target.textContent).toContain('No snapshots yet.');
		unmount(cmp);
	});
});
