// Proxy barrel — re-exports the public API of the outliner module.
// Workspace is the product name for the story planning surface.
export * from '../outliner/index.js';

// Workspace-specific types and stores
export type { WorkspaceMode } from './types.js';
export { WORKSPACE_MODES, WORKSPACE_MODE_LABELS } from './types.js';
export {
	getActiveMode,
	getSelectedId,
	getActiveSelectedId,
	setMode,
	nextMode,
	prevMode,
	selectItem,
	resetSelections,
} from './stores/workspace-mode.svelte.js';
export type { WorkspaceData } from './services/workspace-data-service.js';
export { getWorkspaceData } from './services/workspace-data-service.js';
