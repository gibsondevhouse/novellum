/**
 * plan-023 stage-004 phase-002 — Nova panel open-state store.
 *
 * SSR-safe singleton: hydrates from sessionStorage on first read in the
 * browser, persists on every change. The session-storage key is
 * documented in the stage spec (`novellum.nova.panel.open`).
 */

const STORAGE_KEY = 'novellum.nova.panel.open';

function readInitial(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return window.sessionStorage.getItem(STORAGE_KEY) === 'true';
	} catch {
		return false;
	}
}

function persist(value: boolean): void {
	if (typeof window === 'undefined') return;
	try {
		window.sessionStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
	} catch {
		/* ignore quota / disabled-storage */
	}
}

class NovaPanelStore {
	isOpen = $state<boolean>(readInitial());

	open(): void {
		this.isOpen = true;
		persist(true);
	}

	close(): void {
		this.isOpen = false;
		persist(false);
	}

	toggle(): void {
		this.isOpen = !this.isOpen;
		persist(this.isOpen);
	}
}

export const novaPanel = new NovaPanelStore();
