import { describe, it, expect } from 'vitest';
import type { ChapterWithScenes } from '../../src/modules/outline/types.js';
import type { Act } from '../../src/lib/db/domain-types';
import { computeMetrics } from '../../src/modules/outline/services/pacing-telemetry.js';

type SceneFixture = { id: string };
type ChapterFixture = { id: string; scenes: SceneFixture[] };
type ActFixture = { id: string };

function asChapters(c: ChapterFixture[]): ChapterWithScenes[] {
	return c as unknown as ChapterWithScenes[];
}

function asActs(a: ActFixture[]): Act[] {
	return a as unknown as Act[];
}

describe('pacing-telemetry', () => {
	it('returns healthy for ≥ 2 scenes per chapter on average', () => {
		const chapters = asChapters([
			{ id: 'c1', scenes: [{ id: 's1' }, { id: 's2' }] },
			{ id: 'c2', scenes: [{ id: 's3' }, { id: 's4' }, { id: 's5' }] },
		]);
		const metrics = computeMetrics([], chapters);
		expect(metrics.sparsity).toBe('healthy');
		expect(metrics.chapterCount).toBe(2);
		expect(metrics.sceneCount).toBe(5);
	});

	it('returns sparse for exactly 1 scene per chapter on average', () => {
		const chapters = asChapters([
			{ id: 'c1', scenes: [{ id: 's1' }] },
			{ id: 'c2', scenes: [{ id: 's2' }] },
		]);
		const metrics = computeMetrics([], chapters);
		expect(metrics.sparsity).toBe('sparse');
	});

	it('returns very-sparse when chapters have no scenes', () => {
		const chapters = asChapters([{ id: 'c1', scenes: [] }]);
		const metrics = computeMetrics([], chapters);
		expect(metrics.sparsity).toBe('very-sparse');
	});

	it('handles empty project gracefully', () => {
		const metrics = computeMetrics([], []);
		expect(metrics.sparsity).toBe('healthy');
		expect(metrics.chapterCount).toBe(0);
	});

	it('counts acts correctly', () => {
		const acts = asActs([{ id: 'a1' }, { id: 'a2' }]);
		const metrics = computeMetrics(acts, []);
		expect(metrics.actCount).toBe(2);
	});
});
