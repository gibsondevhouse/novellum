import type { Beat, Stage } from '$lib/db/types.js';

/** Create a new Beat entity with sensible defaults. Pure — no side effects. */
export function createBeat(arcId: string, projectId: string, order: number): Beat {
	const now = new Date().toISOString();
	return {
		id: crypto.randomUUID(),
		arcId,
		projectId,
		title: `Beat ${order + 1}`,
		type: '',
		order,
		notes: '',
		createdAt: now,
		updatedAt: now
	};
}

/** Create a new Stage entity with sensible defaults. Pure — no side effects. */
export function createStage(beatId: string, projectId: string, order: number): Stage {
	const now = new Date().toISOString();
	return {
		id: crypto.randomUUID(),
		beatId,
		projectId,
		title: `Stage ${order + 1}`,
		description: '',
		order,
		status: 'planned',
		createdAt: now,
		updatedAt: now
	};
}
