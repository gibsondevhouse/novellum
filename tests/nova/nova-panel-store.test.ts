/**
 * plan-023 stage-004 phase-002 — nova-panel store unit tests.
 *
 * The store is a singleton that hydrates from sessionStorage on first
 * read. We exercise toggle/open/close + persistence here. Hydration is
 * exercised indirectly: setting the key before import is brittle in
 * Vitest's module cache, so we focus on persistence side-effects.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { novaPanel } from '$modules/nova';

describe('novaPanel store', () => {
	beforeEach(() => {
		window.sessionStorage.clear();
		novaPanel.close();
		// Clear once more after close() persisted "false" to start each
		// case from a known-empty storage where useful.
		window.sessionStorage.clear();
	});

	it('starts closed by default', () => {
		expect(novaPanel.isOpen).toBe(false);
	});

	it('open() sets isOpen=true and persists "true"', () => {
		novaPanel.open();
		expect(novaPanel.isOpen).toBe(true);
		expect(window.sessionStorage.getItem('novellum.nova.panel.open')).toBe('true');
	});

	it('close() sets isOpen=false and persists "false"', () => {
		novaPanel.open();
		novaPanel.close();
		expect(novaPanel.isOpen).toBe(false);
		expect(window.sessionStorage.getItem('novellum.nova.panel.open')).toBe('false');
	});

	it('toggle() flips state and persists', () => {
		expect(novaPanel.isOpen).toBe(false);
		novaPanel.toggle();
		expect(novaPanel.isOpen).toBe(true);
		expect(window.sessionStorage.getItem('novellum.nova.panel.open')).toBe('true');
		novaPanel.toggle();
		expect(novaPanel.isOpen).toBe(false);
		expect(window.sessionStorage.getItem('novellum.nova.panel.open')).toBe('false');
	});
});
