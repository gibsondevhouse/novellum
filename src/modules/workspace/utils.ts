import type { Stage } from '$lib/db/types.js';

/** Compute percentage of stages that are completed. Returns 0 for empty arrays. */
export function computeCompletionPercent(stages: Stage[]): number {
	if (stages.length === 0) return 0;
	return Math.round((stages.filter(s => s.status === 'completed').length / stages.length) * 100);
}
