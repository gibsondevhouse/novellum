import { apiGet, apiPost, apiPut } from '$lib/api-client.js';
import { createRepository } from '$lib/factories/repository-factory.js';
import type { StoryFrame, Act, Milestone } from '$lib/db/domain-types';

/* ── Story Frame ── */

export async function getOrCreateStoryFrame(projectId: string): Promise<StoryFrame> {
	const existing = await apiGet<StoryFrame[]>('/api/db/story_frames', { projectId });
	if (existing.length > 0) return existing[0];
	return apiPost<StoryFrame>('/api/db/story_frames', { projectId });
}

export async function updateStoryFrame(
	id: string,
	patch: Partial<Omit<StoryFrame, 'id' | 'projectId'>>,
): Promise<void> {
	await apiPut(`/api/db/story_frames/${id}`, patch);
}

/* ── Acts ── */

const actsRepo = createRepository<Act>({
	endpoint: '/api/db/acts',
	entityName: 'Act',
	queries: { byProjectId: 'projectId', byArcId: 'arcId' },
});

export async function getActsByProjectId(projectId: string): Promise<Act[]> {
	return actsRepo.queries.byProjectId(projectId);
}

export async function createAct(
	projectId: string,
	title: string,
	order: number,
	arcId?: string,
): Promise<Act> {
	const payload: Partial<Act> = { projectId, title, order, planningNotes: '' };
	if (arcId) payload.arcId = arcId;
	return actsRepo.create(payload as Omit<Act, 'id' | 'createdAt' | 'updatedAt'>);
}

export async function updateAct(
	id: string,
	patch: Partial<Omit<Act, 'id' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await actsRepo.update(id, patch);
}

export async function removeAct(id: string): Promise<void> {
	await actsRepo.remove(id);
}

export async function reorderActs(_projectId: string, orderedIds: string[]): Promise<void> {
	await Promise.all(orderedIds.map((id, idx) => actsRepo.update(id, { order: idx })));
}

/* ── Milestones ── */

const milestonesRepo = createRepository<Milestone>({
	endpoint: '/api/db/milestones',
	entityName: 'Milestone',
	queries: { byActId: 'actId', byProjectId: 'projectId' },
});

export async function getMilestonesByActId(actId: string): Promise<Milestone[]> {
	return milestonesRepo.queries.byActId(actId);
}

export async function getMilestonesByProjectId(projectId: string): Promise<Milestone[]> {
	return milestonesRepo.queries.byProjectId(projectId);
}

export async function createMilestone(
	actId: string,
	projectId: string,
	title: string,
	order: number,
	description = '',
): Promise<Milestone> {
	return milestonesRepo.create({
		actId,
		projectId,
		title,
		description,
		order,
		chapterIds: [],
	} as Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>);
}

export async function updateMilestone(
	id: string,
	patch: Partial<Omit<Milestone, 'id' | 'actId' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await milestonesRepo.update(id, patch);
}

export async function removeMilestone(id: string): Promise<void> {
	await milestonesRepo.remove(id);
}
