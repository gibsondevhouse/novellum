import { db } from '$lib/legacy/dexie/db';
import { getOrCreateStoryFrame, createAct } from '../story-structure-service.js';

/**
 * Idempotent migration: ensures every project that has chapters
 * has at least one Act and a StoryFrame.
 * Assigns chapterless chapters to the default act.
 */
export async function migrateOutlineToStoryWorkspace(projectId: string): Promise<void> {
	await getOrCreateStoryFrame(projectId);

	const existingActs = await db.acts.where('projectId').equals(projectId).count();
	if (existingActs === 0) {
		const act = await createAct(projectId, 'Act I', 0);
		const chapters = await db.chapters.where('projectId').equals(projectId).toArray();
		await Promise.all(
			chapters.filter((ch) => !ch.actId).map((ch) => db.chapters.update(ch.id, { actId: act.id })),
		);
	}
}
