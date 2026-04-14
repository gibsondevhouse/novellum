import type { Act } from '$lib/db/types.js';
import type { ChapterWithScenes } from '../types.js';

export interface PacingMetrics {
	actCount: number;
	chapterCount: number;
	sceneCount: number;
	beatCount: number;
	avgScenesPerChapter: number;
	avgBeatsPerScene: number;
	sparsity: 'healthy' | 'sparse' | 'very-sparse';
}

export function computeMetrics(acts: Act[], chapters: ChapterWithScenes[]): PacingMetrics {
	const chapterCount = chapters.length;
	const sceneCount = chapters.reduce((n, ch) => n + ch.scenes.length, 0);
	const beatCount = chapters.reduce(
		(n, ch) =>
			n +
			ch.scenes.reduce(
				(m, sc) => m + ('beats' in sc ? (sc as unknown as { beats: unknown[] }).beats.length : 0),
				0,
			),
		0,
	);
	const avgScenesPerChapter = chapterCount > 0 ? sceneCount / chapterCount : 0;
	const avgBeatsPerScene = sceneCount > 0 ? beatCount / sceneCount : 0;
	const sparsity: PacingMetrics['sparsity'] =
		chapterCount === 0
			? 'healthy'
			: avgScenesPerChapter < 1
				? 'very-sparse'
				: avgScenesPerChapter < 2
					? 'sparse'
					: 'healthy';
	return {
		actCount: acts.length,
		chapterCount,
		sceneCount,
		beatCount,
		avgScenesPerChapter,
		avgBeatsPerScene,
		sparsity,
	};
}

export const SPARSITY_THRESHOLDS = {
	'very-sparse': { minScenesPerChapter: 0, label: 'Very sparse — consider adding scenes' },
	sparse: { minScenesPerChapter: 1, label: 'Sparse — chapters could use more scenes' },
	healthy: { minScenesPerChapter: 2, label: 'Healthy structure' },
};
