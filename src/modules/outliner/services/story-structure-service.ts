import { db } from '$lib/db/index.js';
import type { StoryFrame, Act, Milestone } from '$lib/db/types.js';

export async function getOrCreateStoryFrame(projectId: string): Promise<StoryFrame> {
	const existing = await db.story_frames.where('projectId').equals(projectId).first();
	if (existing) return existing;
	const frame: StoryFrame = {
		id: crypto.randomUUID(),
		projectId,
		premise: '',
		theme: '',
		toneNotes: '',
		updatedAt: new Date().toISOString(),
	};
	await db.story_frames.add(frame);
	return frame;
}

export async function updateStoryFrame(
	id: string,
	patch: Partial<Omit<StoryFrame, 'id' | 'projectId'>>,
): Promise<void> {
	await db.story_frames.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function getActsByProjectId(projectId: string): Promise<Act[]> {
	return db.acts.where('projectId').equals(projectId).sortBy('order');
}

export async function createAct(projectId: string, title: string, order: number): Promise<Act> {
	const now = new Date().toISOString();
	const act: Act = {
		id: crypto.randomUUID(),
		projectId,
		title,
		order,
		planningNotes: '',
		createdAt: now,
		updatedAt: now,
	};
	await db.acts.add(act);
	return act;
}

export async function updateAct(
	id: string,
	patch: Partial<Omit<Act, 'id' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await db.acts.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function removeAct(id: string): Promise<void> {
	await db.acts.delete(id);
}

export async function reorderActs(projectId: string, orderedIds: string[]): Promise<void> {
	await Promise.all(
		orderedIds.map((id, idx) =>
			db.acts.update(id, { order: idx, updatedAt: new Date().toISOString() }),
		),
	);
}

/* ── Milestones ── */

export async function getMilestonesByActId(actId: string): Promise<Milestone[]> {
	return db.milestones.where('actId').equals(actId).sortBy('order');
}

export async function getMilestonesByProjectId(projectId: string): Promise<Milestone[]> {
	return db.milestones.where('projectId').equals(projectId).sortBy('order');
}

export async function createMilestone(
	actId: string,
	projectId: string,
	title: string,
	order: number,
	description = '',
): Promise<Milestone> {
	const now = new Date().toISOString();
	const milestone: Milestone = {
		id: crypto.randomUUID(),
		actId,
		projectId,
		title,
		description,
		order,
		chapterIds: [],
		createdAt: now,
		updatedAt: now,
	};
	await db.milestones.add(milestone);
	return milestone;
}

export async function updateMilestone(
	id: string,
	patch: Partial<Omit<Milestone, 'id' | 'actId' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await db.milestones.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function removeMilestone(id: string): Promise<void> {
	await db.milestones.delete(id);
}
