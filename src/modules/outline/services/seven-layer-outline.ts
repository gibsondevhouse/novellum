import type {
	Act,
	Arc,
	Beat,
	Chapter,
	Milestone,
	Scene,
	Stage,
} from '$lib/db/domain-types';

/**
 * Canonical seven-layer narrative hierarchy in top-down order.
 *
 * Used by:
 *  - AI context assembly (vibe-author family in `context-engine.ts`)
 *  - Outline services to expose deterministic traversal helpers
 *  - Pipeline artifact envelopes (`OutlineHierarchySemantics`)
 */
export const SEVEN_LAYER_HIERARCHY = [
	'arcs',
	'acts',
	'milestones',
	'chapters',
	'scenes',
	'beats',
	'stages',
] as const;

export type SevenLayerName = (typeof SEVEN_LAYER_HIERARCHY)[number];

export interface SevenLayerOutline {
	arcs: Arc[];
	acts: Act[];
	milestones: Milestone[];
	chapters: Chapter[];
	scenes: Scene[];
	beats: Beat[];
	stages: Stage[];
}

function sortByOrderThenTitle<T extends { order?: number; title?: string }>(items: T[]): T[] {
	return [...items].sort((a, b) => {
		const orderDiff = (a.order ?? 0) - (b.order ?? 0);
		if (orderDiff !== 0) return orderDiff;
		return (a.title ?? '').localeCompare(b.title ?? '');
	});
}

/**
 * Returns a normalized, deterministically-sorted seven-layer outline.
 *
 * - All buckets are sorted by `order` then by `title` so output is
 *   stable across calls and across stores that may emit in different
 *   insertion orders.
 * - `Milestone.chapterIds` is also sorted by the chapter's canonical
 *   order index so out-of-order references normalize predictably.
 * - Scenes with beats but no stages stay intact: empty `stages` is
 *   represented as `[]`, never `undefined`, so consumers can iterate
 *   without null guards.
 */
export function normalizeSevenLayerOutline(raw: {
	arcs?: Arc[];
	acts?: Act[];
	milestones?: Milestone[];
	chapters?: Chapter[];
	scenes?: Scene[];
	beats?: Beat[];
	stages?: Stage[];
}): SevenLayerOutline {
	const arcs = sortByOrderThenTitle(raw.arcs ?? []);
	const acts = sortByOrderThenTitle(raw.acts ?? []);
	const chapters = sortByOrderThenTitle(raw.chapters ?? []);
	const scenes = sortByOrderThenTitle(raw.scenes ?? []);
	const beats = sortByOrderThenTitle(raw.beats ?? []);
	const stages = sortByOrderThenTitle(raw.stages ?? []);

	const chapterOrderIndex = new Map(chapters.map((c, i) => [c.id, i]));
	const milestones = sortByOrderThenTitle(raw.milestones ?? []).map((m) => ({
		...m,
		chapterIds: [...(m.chapterIds ?? [])].sort((a, b) => {
			const ai = chapterOrderIndex.get(a) ?? Number.MAX_SAFE_INTEGER;
			const bi = chapterOrderIndex.get(b) ?? Number.MAX_SAFE_INTEGER;
			return ai - bi;
		}),
	}));

	return { arcs, acts, milestones, chapters, scenes, beats, stages };
}

export type StageLifecycleStatus = 'planned' | 'in_progress' | 'completed';

/**
 * Filters the `stages` bucket of a seven-layer outline by lifecycle
 * status. Returns a new outline with the other six layers untouched.
 *
 * The status field is matched by exact string. Unknown statuses are
 * preserved on the stage object but will not match any filter.
 */
export function filterOutlineByStageStatus(
	outline: SevenLayerOutline,
	allowed: readonly StageLifecycleStatus[],
): SevenLayerOutline {
	if (allowed.length === 0) return outline;
	const allowedSet = new Set<string>(allowed);
	return {
		...outline,
		stages: outline.stages.filter((stage) => allowedSet.has(stage.status)),
	};
}
