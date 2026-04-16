export type { ChapterWithScenes, ChapterWithScenesAndAct, BeatFocus, OutlineSelection } from './types.js';
export * from './stores/outliner.svelte.js';
export { computeMetrics, SPARSITY_THRESHOLDS } from './services/pacing-telemetry.js';
export type { PacingMetrics } from './services/pacing-telemetry.js';
export {
	getOrCreateStoryFrame,
	updateStoryFrame,
	getActsByProjectId,
	createAct,
	updateAct,
	removeAct,
	reorderActs,
	getMilestonesByActId,
	getMilestonesByProjectId,
	createMilestone,
	updateMilestone,
	removeMilestone,
} from './services/story-structure-service.js';
export {
	createArc,
	getArcById,
	getArcsByProjectId,
	updateArc,
	removeArc,
	reorderArcs,
} from './services/arc-repository.js';

// Components
export { default as HierarchyNavigator } from './components/HierarchyNavigator.svelte';
export { default as OutlineDetailCard } from './components/OutlineDetailCard.svelte';
