import { db } from '$lib/db/index.js';
import type { ProjectMetrics } from '../types.js';

export async function getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
	const [chapters, scenes] = await Promise.all([
		db.chapters.where('projectId').equals(projectId).count(),
		db.scenes.where('projectId').equals(projectId).count(),
	]);

	let actsCount = 0;
	let actsReady = false;
	try {
		actsCount = await db.acts.where('projectId').equals(projectId).count();
		actsReady = true;
	} catch {
		// table may not exist yet
	}

	let arcsCount = 0;
	let arcsReady = false;
	try {
		arcsCount = await db.arcs.where('projectId').equals(projectId).count();
		arcsReady = true;
	} catch {
		// table may not exist yet
	}

	return {
		arcs: { count: arcsCount, ready: arcsReady },
		acts: { count: actsCount, ready: actsReady },
		chapters: { count: chapters, ready: true },
		scenes: { count: scenes, ready: true },
	};
}
