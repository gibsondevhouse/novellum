export * from './types.js';
export * from './constants.js';

// Stores
export { editorState } from './stores/editor.svelte.js';

// Services — scene repository
export {
	createScene,
	getSceneById,
	updateScene,
	removeScene,
	getScenesByChapterId,
	getScenesByProjectId,
	reorderScenes,
} from './services/scene-repository.js';

// Services — beat repository
export {
	createBeat,
	getBeatById,
	updateBeat,
	removeBeat,
	getBeatsBySceneId,
	getBeatsByArcId,
	getBeatsByProjectId,
	reorderBeats,
} from './services/beat-repository.js';

// Services — stage repository
export {
	createStage,
	getStageById,
	updateStage,
	removeStage,
	getStagesByBeatId,
	getStagesByProjectId,
	reorderStages,
} from './services/stage-repository.js';

// Services — autosave
export {
	mount as autosaveMount,
	unmount as autosaveUnmount,
	schedule as autosaveSchedule,
} from './services/autosave-service.js';

// Services — snapshot repository
export {
	createSnapshot,
	listByScene,
	restoreSnapshot,
} from './services/snapshot-repository.js';

// Components
export { default as DocumentEditorFrame } from './components/DocumentEditorFrame.svelte';
export { default as EditModeToolbar } from './components/EditModeToolbar.svelte';
export { default as ManuscriptSurface } from './components/ManuscriptSurface.svelte';
export { default as VersionHistoryPanel } from './components/VersionHistoryPanel.svelte';
export { default as SaveStatus } from './components/SaveStatus.svelte';
export { default as SnapshotHistoryPanel } from './components/SnapshotHistoryPanel.svelte';
export { default as SnapshotPreviewModal } from './components/SnapshotPreviewModal.svelte';
export { default as RecoveryPrompt } from './components/RecoveryPrompt.svelte';
