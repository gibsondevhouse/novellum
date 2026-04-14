import { WORKSPACE_MODES, type WorkspaceMode } from '../types.js';

let activeMode: WorkspaceMode = $state('arcs');

let selectedIds: Record<WorkspaceMode, string | null> = $state({
	arcs: null,
	acts: null,
	chapters: null,
	scenes: null,
});

export function getActiveMode(): WorkspaceMode {
	return activeMode;
}

export function getSelectedId(mode: WorkspaceMode): string | null {
	return selectedIds[mode];
}

export function getActiveSelectedId(): string | null {
	return selectedIds[activeMode];
}

export function setMode(mode: WorkspaceMode): void {
	activeMode = mode;
}

export function nextMode(): void {
	const idx = WORKSPACE_MODES.indexOf(activeMode);
	activeMode = WORKSPACE_MODES[(idx + 1) % WORKSPACE_MODES.length];
}

export function prevMode(): void {
	const idx = WORKSPACE_MODES.indexOf(activeMode);
	activeMode = WORKSPACE_MODES[(idx - 1 + WORKSPACE_MODES.length) % WORKSPACE_MODES.length];
}

export function selectItem(mode: WorkspaceMode, id: string | null): void {
	selectedIds[mode] = id;
}

export function resetSelections(): void {
	selectedIds = { arcs: null, acts: null, chapters: null, scenes: null };
}
