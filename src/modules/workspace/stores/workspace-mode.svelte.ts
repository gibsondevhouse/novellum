import { WORKSPACE_MODES, type WorkspaceMode } from '../types.js';

/**
 * Maps each child mode to the parent mode whose selection
 * scopes the child's visible collection.
 * Arcs is top-level so it has no parent.
 */
export const PARENT_MODE: Partial<Record<WorkspaceMode, WorkspaceMode>> = {
	acts: 'arcs',
	chapters: 'acts',
	scenes: 'chapters',
};

let activeMode: WorkspaceMode = $state('arcs');

let selectedIds: Record<WorkspaceMode, string | null> = $state({
	arcs: null,
	acts: null,
	chapters: null,
	scenes: null,
});

/**
 * Per-mode parent context: which parent entity scopes each child mode.
 * e.g., parentContext.acts = '<arcId>' means Acts mode is scoped to that arc.
 */
let parentContext: Record<WorkspaceMode, string | null> = $state({
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

/* ── Parent context API ── */

export function getParentContext(mode: WorkspaceMode): string | null {
	return parentContext[mode];
}

export function setParentContext(mode: WorkspaceMode, parentId: string | null): void {
	parentContext[mode] = parentId;
}

/**
 * Propagates the currently selected item in `sourceMode` as the
 * parent context for the child mode that depends on it.
 *
 * e.g. selecting an arc auto-sets parentContext.acts = arcId
 */
export function propagateParentFromSelection(sourceMode: WorkspaceMode): void {
	const childMode = Object.entries(PARENT_MODE).find(([, parent]) => parent === sourceMode)?.[0] as WorkspaceMode | undefined;
	if (childMode) {
		parentContext[childMode] = selectedIds[sourceMode];
	}
}

export function resetParentContext(): void {
	parentContext = { arcs: null, acts: null, chapters: null, scenes: null };
}

export function resetSelections(): void {
	selectedIds = { arcs: null, acts: null, chapters: null, scenes: null };
	parentContext = { arcs: null, acts: null, chapters: null, scenes: null };
}
