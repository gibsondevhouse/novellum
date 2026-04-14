export type { ChapterWithScenes, ChapterWithScenesAndAct } from './types.js';
export * from './stores/outliner.svelte.js';
export { computeMetrics, SPARSITY_THRESHOLDS } from './services/pacing-telemetry.js';
export {
	getOrCreateStoryFrame,
	updateStoryFrame,
	getActsByProjectId,
	createAct,
	updateAct,
	removeAct,
	reorderActs,
} from './services/story-structure-service.js';
export {
	createArc,
	getArcById,
	getArcsByProjectId,
	updateArc,
	removeArc,
	reorderArcs,
} from './services/arc-repository.js';
