import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, flushSync } from 'svelte';

// Stub SvelteKit navigation module used by GhostButton href rendering
vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
}));

import BackupStatusCard from '../../src/modules/project/components/BackupStatusCard.svelte';
import ExportReadinessCard from '../../src/modules/project/components/ExportReadinessCard.svelte';
import SaveStatusCard from '../../src/modules/project/components/SaveStatusCard.svelte';
import AIStatusCard from '../../src/modules/project/components/AIStatusCard.svelte';

describe('Hub status cards', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// ── BackupStatusCard ──────────────────────────────────────────────────────

	describe('BackupStatusCard', () => {
		it('renders "Never backed up" when lastBackupAt is null', () => {
			mount(BackupStatusCard, {
				target,
				props: { lastBackupAt: null, projectId: 'proj1' },
			});
			flushSync();
			expect(target.textContent).toContain('Never backed up');
		});

		it('renders a relative time string when lastBackupAt is provided', () => {
			// Use a date far enough in the past to guarantee a non-"Just now" result
			const oneHourAgo = new Date(Date.now() - 61 * 60 * 1000).toISOString();
			mount(BackupStatusCard, {
				target,
				props: { lastBackupAt: oneHourAgo, projectId: 'proj1' },
			});
			flushSync();
			// Should contain "hour" or "hours" — not "Never backed up"
			expect(target.textContent).not.toContain('Never backed up');
			expect(target.textContent).toMatch(/hour|minute|day|Just now/);
		});

		it('renders the "Back up now" button', () => {
			mount(BackupStatusCard, {
				target,
				props: { lastBackupAt: null, projectId: 'proj1' },
			});
			flushSync();
			expect(target.textContent).toContain('Back up now');
		});
	});

	// ── ExportReadinessCard ───────────────────────────────────────────────────

	describe('ExportReadinessCard', () => {
		it('shows formatted word count', () => {
			mount(ExportReadinessCard, {
				target,
				props: {
					sceneCount: 5,
					wordCount: 12345,
					projectId: 'proj1',
					onExportRequest: () => {},
				},
			});
			flushSync();
			// toLocaleString on 12345 → "12,345" in en-US or similar
			expect(target.textContent).toMatch(/12[,.]?345/);
		});

		it('shows scene count', () => {
			mount(ExportReadinessCard, {
				target,
				props: {
					sceneCount: 3,
					wordCount: 0,
					projectId: 'proj1',
					onExportRequest: () => {},
				},
			});
			flushSync();
			expect(target.textContent).toContain('3 scenes');
		});

		it('calls onExportRequest when button is clicked', () => {
			const handler = vi.fn();
			mount(ExportReadinessCard, {
				target,
				props: {
					sceneCount: 2,
					wordCount: 100,
					projectId: 'proj1',
					onExportRequest: handler,
				},
			});
			flushSync();
			const btn = target.querySelector('button');
			btn?.click();
			expect(handler).toHaveBeenCalledOnce();
		});
	});

	// ── SaveStatusCard ────────────────────────────────────────────────────────

	describe('SaveStatusCard', () => {
		it('shows "Not yet saved" when lastSavedAt is null', () => {
			mount(SaveStatusCard, {
				target,
				props: { lastSavedAt: null },
			});
			flushSync();
			expect(target.textContent).toContain('Not yet saved');
		});

		it('shows relative time when lastSavedAt is provided', () => {
			const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
			mount(SaveStatusCard, {
				target,
				props: { lastSavedAt: twoDaysAgo },
			});
			flushSync();
			expect(target.textContent).not.toContain('Not yet saved');
			expect(target.textContent).toContain('2 days ago');
		});
	});

	// ── AIStatusCard ──────────────────────────────────────────────────────────

	describe('AIStatusCard', () => {
		it('renders "AI ready" when apiKeyConfigured is true', () => {
			mount(AIStatusCard, {
				target,
				props: { apiKeyConfigured: true },
			});
			flushSync();
			expect(target.textContent).toContain('AI ready');
		});

		it('renders "No AI key configured" when apiKeyConfigured is false', () => {
			mount(AIStatusCard, {
				target,
				props: { apiKeyConfigured: false },
			});
			flushSync();
			expect(target.textContent).toContain('No AI key configured');
		});

		it('renders a settings link when apiKeyConfigured is false', () => {
			mount(AIStatusCard, {
				target,
				props: { apiKeyConfigured: false },
			});
			flushSync();
			const link = target.querySelector('a[href="/settings/ai"]');
			expect(link).not.toBeNull();
		});

		it('does not render a settings link when apiKeyConfigured is true', () => {
			mount(AIStatusCard, {
				target,
				props: { apiKeyConfigured: true },
			});
			flushSync();
			const link = target.querySelector('a[href="/settings/ai"]');
			expect(link).toBeNull();
		});
	});
});
