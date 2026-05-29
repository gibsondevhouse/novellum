import type { NovaMode } from '../types.js';

const BASE_KEY = 'novellum.nova.mode';

const MODES: readonly NovaMode[] = ['ask', 'write', 'agent'];

function storageKey(projectId: string | null): string {
	return projectId ? `${BASE_KEY}.${projectId}` : BASE_KEY;
}

function readStored(projectId: string | null): NovaMode {
	if (typeof window === 'undefined') return 'ask';
	try {
		const val = window.sessionStorage.getItem(storageKey(projectId));
		if (val === 'ask' || val === 'write' || val === 'agent') return val;
	} catch {
		/* ignore quota / disabled-storage */
	}
	return 'ask';
}

function persist(mode: NovaMode, projectId: string | null): void {
	if (typeof window === 'undefined') return;
	try {
		window.sessionStorage.setItem(storageKey(projectId), mode);
	} catch {
		/* ignore quota / disabled-storage */
	}
}

class NovaModeStore {
	current = $state<NovaMode>('ask');
	private activeProjectId: string | null = null;

	loadForProject(projectId: string | null): void {
		if (projectId === this.activeProjectId) return;
		this.activeProjectId = projectId;
		this.current = readStored(projectId);
	}

	setMode(mode: NovaMode): void {
		this.current = mode;
		persist(mode, this.activeProjectId);
	}

	cycle(): void {
		const idx = MODES.indexOf(this.current);
		const next = MODES[(idx + 1) % MODES.length];
		this.setMode(next);
	}

	/** Test hook — resets tracking state so loadForProject re-reads storage. */
	__resetForTests(): void {
		this.activeProjectId = null;
		this.current = 'ask';
	}
}

export const novaMode = new NovaModeStore();
